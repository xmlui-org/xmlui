import { orderBy } from "@components-core/utils/misc"

export type GroupItem<K, V> = {
    key: K,
    items: V[]
}

export class ReadOnlyCollection<T = any> {
    private readonly list: T[]
    
    constructor(items: Iterable<T>) {
        this.list = [];
        for (const item of items) {
            this.list.push(item);
        }
    }
    
    get length(): number {
        return this.list.length;
    }
    
    toArray(): T[] {
        return this.list.slice(0);
    }
    
    at(index: number): T | undefined {
        if (index < 0 || index > this.list.length - 1) {
            throw new Error(`Index (${index}) is out of range [0..${Math.max(this.list.length - 1, 0)}]`)
        }
        return this.list[index];
    }
    
    all(): ReadOnlyCollection<T> {
        return new ReadOnlyCollection<T>(this.list);
    }
    
    async single(predicate: (item: T) => Promise<boolean>): Promise<T | undefined> {
        const filtered = await this.where(predicate);
        if (filtered.length === 0) {
            throw new Error("No items found with the specified predicate")
        } else if (filtered.length > 1) {
            throw new Error("Multiple items found with the specified predicate")
        }
        return filtered.at(0);
    }

    async singleOrDefault(predicate: (item: T) => Promise<boolean>, defValue?: T): Promise<T | undefined> {
        const filtered = await this.where(predicate);
        if (filtered.length === 0) {
            return defValue;
        } else if (filtered.length > 1) {
            throw new Error("Multiple items found with the specified predicate")
        }
        return filtered.at(0);
    }

    async where(predicate: (item: T) => Promise<boolean>): Promise<ReadOnlyCollection<T>> {
        return new ReadOnlyCollection(await this.whereAsArray(predicate)); 
    }

    async whereAsArray(predicate: (item: T) => Promise<boolean>): Promise<T[]> {
        const results = await Promise.all(this.list.map(predicate ?? (async () => true)));
        return this.list.filter((_v, index) => results[index]);
    }

    async orderBy(...mappers: any[]): Promise<ReadOnlyCollection<T>> {
        return new ReadOnlyCollection(await orderBy(this.list, ...mappers))
    }

    async orderByAsArray(...mappers: any[]): Promise<T[]> {
        return await orderBy(this.list, ...mappers);
    }

    async groupBy<D>(groupKey: (item: T) => Promise<D>): Promise<ReadOnlyCollection<GroupItem<D, T>>> {
        return new ReadOnlyCollection(await this.groupByAsArray(groupKey));
    }

    async groupByAsArray<D>(groupKey: (item: T) => Promise<D>): Promise<GroupItem<D, T>[]> {
        const grouped = new Map<D, T[]>();
        for (const item of this.list) {
            const key = await groupKey(item);
            const matchingList = grouped.get(key);
            if (matchingList === undefined) {
                grouped.set(key, [item]);
            } else {
                matchingList.push(item)
            }
        }
        const groupedItems: GroupItem<D, T>[] = [];
        for (const [key, items] of grouped.entries()) {
            groupedItems.push({ key, items } )
        }
        return groupedItems;
    }

    async distinct<D>(distinctValue?: (item: T) => Promise<D>): Promise<ReadOnlyCollection<D>> {
        distinctValue ??= async (x: T) => x as unknown as D;
        const values = new Set<D>();
        for (const item of this.list) {
            values.add(await distinctValue(item));
        }
        return new ReadOnlyCollection<D>(values.values());
    }

    async distinctAsArray<D>(distinctValue?: (item: T) => Promise<D>): Promise<D[]> {
        return (await this.distinct(distinctValue)).toArray();
    }

    async maxValue(fieldName = "id", predicate?: (item: T) => Promise<boolean>): Promise<any | null> {
        let values = predicate ? (await new ReadOnlyCollection(this.list)
            .where(predicate)).toArray() : this.list;
        values = await orderBy(values, (item: T) => (item as any)[fieldName], true);
        return values.length === 0 ? undefined : (values[0] as any)[fieldName];
    }
    
    async skip(count: number): Promise<ReadOnlyCollection<T>> {
        return new ReadOnlyCollection<T>(this.list.slice(count));
    }

    async take(count: number): Promise<ReadOnlyCollection<T>> {
        return new ReadOnlyCollection<T>(this.list.slice(0, count));
    }

    async skipTake(skip: number, take: number): Promise<ReadOnlyCollection<T>> {
        return new ReadOnlyCollection<T>(this.list.slice(skip, take + skip));
    }

}