import type { Table } from "dexie";
import Dexie from "dexie";

import { ReadOnlyCollection } from "../interception/ReadonlyCollection";
import type { IDatabase, TableDescriptor } from "./abstractions";

export class IndexedDb implements IDatabase {
  // private repository: Record<string, Array<any>>;
  // private maxIdsByCollections: Record<string, number> = {};
  private db: Dexie | null = null;

  [key: string]: unknown;

  constructor(
    private tables: Array<TableDescriptor> | undefined,
    private initialData: Record<string, any[]> | (() => Promise<Record<string, any[]>>) = {},
    private config?: any,
  ) {}

  private getDb() {
    if (this.db === null) {
      throw new Error("Db is not initialized yet");
    }
    return this.db;
  }

  public async initialize() {
    const resolvedInitialData =
      typeof this.initialData === "function" ? await this.initialData() : this.initialData;
    const schema: Record<string, string> = {};
    const tableNames = new Set<string>();
    if (this.tables) {
      this.tables.forEach((tableDescriptor) => {
        const schemaArray = [];
        if (tableDescriptor.pk.length === 1) {
          schemaArray.push(tableDescriptor.pk[0]);
        } else {
          schemaArray.push(`[${tableDescriptor.pk.join("+")}]`); //indexeddb compound index looks like this: [field+anotherfield]
        }
        if (tableDescriptor.indexes) {
          schemaArray.push(...tableDescriptor.indexes);
        }
        schema[tableDescriptor.name] = schemaArray.join(", ");
        tableNames.add(tableDescriptor.name);
      });
    } else {
      Object.entries(resolvedInitialData).forEach(([key]) => {
        schema[key] = "++id";
        tableNames.add(key);
      });
    }

    const targetVersion =
      this.config?.version !== undefined && typeof this.config?.version === "number"
        ? this.config?.version
        : 1;

    const shouldInitializeData = await this.dropDbOnVersionChange(targetVersion);

    this.db = this.createDbInstance();
    this.db.version(targetVersion).stores(schema);

    if (shouldInitializeData) {
      await Promise.all(
        Object.entries(resolvedInitialData).map(async ([key, value]) => {
          try {
            await this.getDb().table(key).bulkAdd(value);
          } catch (ignored) {
            console.error(ignored);
          }
        }),
      );
    }

    tableNames.forEach((key) => {
      this[`$${key}`] = createTableWrapper(this.getDb().table(key));
    });
  }

  private createDbInstance() {
    return new Dexie(this.config?.database ?? "defaultIndexDb");
  }

  private async dropDbOnVersionChange(targetVersion: number) {
    const tempDb = this.createDbInstance();
    if (!(await Dexie.exists(tempDb.name))) {
      return true;
    }
    await tempDb.open();
    if (tempDb.verno !== targetVersion) {
      await tempDb.delete();
      return true;
    } else {
      tempDb.close();
      return false;
    }
  }

  public getItems = (resourceId: string) => this.getDb().table(resourceId).toArray();

  public findItems = async (resourceId: string, predicate: (item: any) => Promise<boolean>) => {
    const ret = await this.getItems(resourceId);
    const results = await Promise.all(ret.map(predicate));
    return ret.filter((_v, index) => results[index]);
  };

  public getItem = async (resourceId: string, predicate: (item: any) => Promise<boolean>) => {
    const ret = await this.getItems(resourceId);
    const results = await Promise.all(ret.map(predicate));
    return ret.find((_v, index) => results[index]);
  };

  public getItemById = async (resourceId: string, id: any) => {
    return await this.getItem(resourceId, (item) => {
      return item.id + "" === id + "";
    });
  };

  public deleteItems = async (resourceId: string, predicate: (item: any) => Promise<boolean>) => {
    // this.repository[resourceId] = this.repository[resourceId]?.filter((item) => !predicate(item));
  };

  public insertItem = async (resourceId: string, item: any) => {
    const id = await this.getDb().table(resourceId).add(item);
    return this.getItemById(resourceId, id);
  };

  public updateItem = async (resourceId: string, item: any) => {
    await this.getDb().table(resourceId).update(item.id, item);
    return await this.getItemById(resourceId, item.id);
  };

  // --- This method signifies that a section of operations is executed in a transaction
  async transaction(actions: () => Promise<void>): Promise<void> {
    if (!this.db) return;

    const tables = this.db.tables;
    await this.db.transaction("rw", tables, actions);
  }
}

// Wraps an indexDb Table into an object that provides helpful methods
function createTableWrapper(table: Table): any {
  // --- Function to retrieve the current table data
  const getDataFn = () => table.db.table(table.name);

  // --- Helper method to filter the table data
  const filteredData = async (predicate?: (item: any) => Promise<boolean>) => {
    const dataSnapshot = await table.toArray();
    const results = await Promise.all(dataSnapshot.map(predicate ?? (() => Promise.resolve(true))));
    return dataSnapshot.filter((_v, index) => results[index]);
  };

  return {
    native: getDataFn,
    insert: async (item: any) => {
      const id = await table.add(item);
      return getDataFn().get(id);
    },
    update: async (item: any) => {
      await table.update(item.id, item);
      return getDataFn().get(item.id);
    },
    save: async (item: any) => {
      const key = await table.put(item);
      return table.get(key);
    },
    deleteById: async (id: any) => {
      await table.delete(id);
    },
    byId: async (id: any) => {
      if (id === undefined || id === null) {
        return null;
      }
      let safeId = id;
      if (table.schema.primKey.src === "++id") {
        //it's an auto incremented id, must be a number
        safeId = Number(id);
      }
      return await table.get(safeId);
    },
    toArray: async () => await table.toArray(),
    single: async (predicate: (item: any) => Promise<boolean>) =>
      await new ReadOnlyCollection(await table.toArray()).single(predicate),
    singleOrDefault: async (predicate: (item: any) => Promise<boolean>, defValue?: any) => {
      return await new ReadOnlyCollection(await table.toArray()).singleOrDefault(
        predicate,
        defValue,
      );
    },
    where: async (predicate: (item: any) => Promise<boolean>) =>
      new ReadOnlyCollection(await filteredData(predicate)),
    whereAsArray: async (predicate: (item: any) => Promise<boolean>) =>
      await filteredData(predicate),
    orderBy: async (...mappers: any[]) =>
      await new ReadOnlyCollection(await table.toArray()).orderBy(...mappers),
    orderByAsArray: async (...mappers: any[]) =>
      await new ReadOnlyCollection(await table.toArray()).orderByAsArray(...mappers),
    groupBy: async (groupKey: (item: any) => Promise<any>) =>
      await new ReadOnlyCollection(await table.toArray()).groupBy(groupKey),
    groupByAsArray: async (groupKey: (item: any) => Promise<any>) =>
      await new ReadOnlyCollection(await table.toArray()).groupByAsArray(groupKey),
    distinct: async (distinctValue?: (item: any) => Promise<any>) =>
      await new ReadOnlyCollection(await table.toArray()).distinct(distinctValue),
    distinctAsArray: async (distinctValue?: (item: any) => Promise<any>) =>
      await new ReadOnlyCollection(await table.toArray()).distinctAsArray(distinctValue),
    maxValue: async (fieldName = "id", predicate?: (item: any) => Promise<boolean>) => {
      return await new ReadOnlyCollection(await table.toArray()).maxValue(fieldName, predicate);
    },
    skip: async (count: number) => {
      return await new ReadOnlyCollection(await table.toArray()).skip(count);
    },
    take: async (count: number) => {
      return await new ReadOnlyCollection(await table.toArray()).take(count);
    },
    skipTake: async (skip: number, take: number) => {
      return await new ReadOnlyCollection(await table.toArray()).skipTake(skip, take);
    },
  };
}
