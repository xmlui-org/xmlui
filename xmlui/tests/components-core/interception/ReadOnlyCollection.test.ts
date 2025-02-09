import { describe, expect, it, assert } from "vitest";
import {ReadOnlyCollection} from "../../../src/components-core/interception/ReadonlyCollection";

const numArray = [3,4,1,2,5];
const strArray = ["beta", "delta", "alpha", "gamma", "charlie"]
const objArray = [
    { key: "hey", value: 1},
    { key: "bye", value: 114},
    { key: "hey", value: 3},
    { key: "bye", value: 41},
    { key: "ok", value: 1000},
]

describe("ReadOnlyCollection", () => {
    it("Construct from Array", () => {
        // --- Act
        const coll = new ReadOnlyCollection([1, 2, 3]);

        // --- Assert
        expect(coll.length).equal(3);
        expect(coll.at(0)).equal(1);
        expect(coll.at(1)).equal(2);
        expect(coll.at(2)).equal(3);
    });

    it("toArray", () => {
        // --- Arrange
        const coll = new ReadOnlyCollection([3, 2, 1]);

        // --- Act
        const arr = coll.toArray()
        
        // --- Assert
        expect(Array.isArray(arr)).equal(true);
        expect(arr.length).equal(3);
        expect(arr.at(0)).equal(3);
        expect(arr[0]).equal(3);
        expect(arr.at(1)).equal(2);
        expect(arr[1]).equal(2);
        expect(arr.at(2)).equal(1);
        expect(arr[2]).equal(1);
    });

    it("all", () => {
        // --- Arrange
        const coll = new ReadOnlyCollection([3, 2, 1]);

        // --- Act
        const all = coll.all()

        // --- Assert
        expect(all instanceof ReadOnlyCollection).equal(true);
        expect(all).not.equal(coll);
        expect(all.length).equal(3);
        expect(all.at(0)).equal(3);
        expect(all.at(1)).equal(2);
        expect(all.at(2)).equal(1);
    });

    it("where #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const where = await coll.where(async i => i >= 3)

        // --- Assert
        expect(where instanceof ReadOnlyCollection).equal(true);
        expect(where).not.equal(numArray);
        expect(where.length).equal(3);
        expect(where.at(0)).equal(3);
        expect(where.at(1)).equal(4);
        expect(where.at(2)).equal(5);
    });

    it("where #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(strArray);

        // --- Act
        const where = await coll.where(async s => s.includes("t"))

        // --- Assert
        expect(where instanceof ReadOnlyCollection).equal(true);
        expect(where).not.equal(strArray);
        expect(where.length).equal(2);
        expect(where.at(0)).equal("beta");
        expect(where.at(1)).equal("delta");
    });

    it("where #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const where = await coll.where(async s => s.value > 100)

        // --- Assert
        expect(where instanceof ReadOnlyCollection).equal(true);
        expect(where).not.equal(objArray);
        expect(where.length).equal(2);
        expect(where.at(0)!.key).equal("bye");
        expect(where.at(0)!.value).equal(114);
        expect(where.at(1)!.key).equal("ok");
        expect(where.at(1)!.value).equal(1000);
    });

    it("whereArray #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const where = await coll.whereAsArray(async s => s.value > 100)

        // --- Assert
        expect(Array.isArray(where)).equal(true);
        expect(where.length).equal(2);
        expect(where.at(0)!.key).equal("bye");
        expect(where.at(0)!.value).equal(114);
        expect(where.at(1)!.key).equal("ok");
        expect(where.at(1)!.value).equal(1000);
    });

    it("orderBy #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const where = await coll.orderBy(async (i: any) => i)

        // --- Assert
        expect(where instanceof ReadOnlyCollection).equal(true);
        expect(where).not.equal(numArray);
        expect(where.length).equal(5);
        expect(where.at(0)).equal(1);
        expect(where.at(1)).equal(2);
        expect(where.at(2)).equal(3);
        expect(where.at(3)).equal(4);
        expect(where.at(4)).equal(5);
    });

    it("orderBy #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.orderBy(async (i: any) => i.key, true, async (i: any) => i.value, true);

        // --- Assert
        expect(res.at(0)!.key).equal("ok");
        expect(res.at(0)!.value).equal(1000);
        expect(res.at(1)!.key).equal("hey");
        expect(res.at(1)!.value).equal(3);
        expect(res.at(2)!.key).equal("hey");
        expect(res.at(2)!.value).equal(1);
        expect(res.at(3)!.key).equal("bye");
        expect(res.at(3)!.value).equal(114);
        expect(res.at(4)!.key).equal("bye");
        expect(res.at(4)!.value).equal(41);
    });

    it("orderByArray #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const where = await coll.orderByAsArray(async (i: any) => i)

        // --- Assert
        expect(Array.isArray(where)).equal(true);
        expect(where.length).equal(5);
        expect(where.at(0)).equal(1);
        expect(where.at(1)).equal(2);
        expect(where.at(2)).equal(3);
        expect(where.at(3)).equal(4);
        expect(where.at(4)).equal(5);
    });

    it("single #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.single(async o => o.key === "ok");

        // --- Assert
        expect(res!.key).equal("ok");
        expect(res!.value).equal(1000);
    });

    it("single #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act/Assert
        try {
            await coll.single(async o => o.key === "dummy");
        } catch (err: any) {
            expect(err.toString().includes("No items")).equal(true);
            return;
        }
        assert.fail("Exception expected");
    });

    it("single #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act/Assert
        try {
            await coll.single(async o => o.key === "hey");
        } catch (err: any) {
            expect(err.toString().includes("Multiple items")).equal(true);
            return;
        }
        assert.fail("Exception expected");
    });

    it("singleOrDefault #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.singleOrDefault(async o => o.key === "ok", { key: "replaced", value: 0});

        // --- Assert
        expect(res!.key).equal("ok");
        expect(res!.value).equal(1000);
    });

    it("singleOrDefault #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.singleOrDefault(async o => o.key === "ok");

        // --- Assert
        expect(res!.key).equal("ok");
        expect(res!.value).equal(1000);
    });

    it("singleOrDefault #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.singleOrDefault(async o => o.key === "none", { key: "replaced", value: 0});

        // --- Assert
        expect(res!.key).equal("replaced");
        expect(res!.value).equal(0);
    });

    it("singleOrDefault #4", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.singleOrDefault(async o => o.key === "none");

        // --- Assert
        expect(res).equal(undefined);
    });

    it("singleOrDefault #5", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act/Assert
        try {
            await coll.singleOrDefault(async o => o.key === "hey");
        } catch (err: any) {
            expect(err.toString().includes("Multiple items")).equal(true);
            return;
        }
        assert.fail("Exception expected");
    });

    it("singleOrDefault #6", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act/Assert
        try {
            await coll.singleOrDefault(async o => o.key === "hey", { key: "none", value: 0 });
        } catch (err: any) {
            expect(err.toString().includes("Multiple items")).equal(true);
            return;
        }
        assert.fail("Exception expected");
    });

    it("distinct #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.distinct(async o => o.key);

        // --- Assert
        expect(res.length).equal(3);
        expect(await res.single(async i => i === "hey")).not.equal(undefined);
        expect(await res.single(async i => i === "bye")).not.equal(undefined);
        expect(await res.single(async i => i === "ok")).not.equal(undefined);
    });

    it("distinct #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection([null, 1, 2, undefined, null]);

        // --- Act
        const res = await coll.distinct(async o => o);

        // --- Assert
        expect(res.length).equal(4);
        expect(await res.single(async i => i === null)).not.equal(undefined);
        expect(await res.single(async i => i === undefined)).equal(undefined);
        expect(await res.single(async i => i === 1)).not.equal(undefined);
        expect(await res.single(async i => i === 2)).not.equal(undefined);
    });

    it("distinct #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection([2, null, 1, 2, undefined, null, 1]);

        // --- Act
        const res = await coll.distinct();

        // --- Assert
        expect(res.length).equal(4);
        expect(await res.single(async i => i === null)).not.equal(undefined);
        expect(await res.single(async i => i === undefined)).equal(undefined);
        expect(await res.single(async i => i === 1)).not.equal(undefined);
        expect(await res.single(async i => i === 2)).not.equal(undefined);
    });

    it("distinctByArray #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.distinctAsArray(async o => o.key);

        // --- Assert
        expect(res.length).equal(3);
        expect(res.find(i => i === "hey")).not.equal(undefined);
        expect(res.find(i => i === "bye")).not.equal(undefined);
        expect(res.find(i => i === "ok")).not.equal(undefined);
    });

    it("groupBy #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.groupBy(async o => o.key);

        // --- Assert
        expect(res.length).equal(3);
        let group = await res.single(async i => i.key === "hey");
        expect(group!.items.length).equal(2);
        group = await res.single(async i => i.key === "ok");
        expect(group!.items.length).equal(1);
        group = await res.single(async i => i.key === "bye");
        expect(group!.items.length).equal(2);
    });

    it("groupBy #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = await coll.groupBy(async i => i % 2);

        // --- Assert
        expect(res.length).equal(2);
        let group = await res.single(async i => i.key === 0);
        expect(group!.items.length).equal(2);
        group = await res.single(async i => i.key === 1);
        expect(group!.items.length).equal(3);
    });

    it("groupByArray #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(objArray);

        // --- Act
        const res = await coll.groupByAsArray(async o => o.key);

        // --- Assert
        expect(res.length).equal(3);
        let group = res.find(i => i.key === "hey");
        expect(group!.items.length).equal(2);
        group = res.find(i => i.key === "ok");
        expect(group!.items.length).equal(1);
        group = res.find(i => i.key === "bye");
        expect(group!.items.length).equal(2);
    });

    it("skip #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skip(0)).toArray();

        // --- Assert
        expect(res).deep.equal([3,4,1,2,5]);
    });

    it("skip #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skip(2)).toArray();

        // --- Assert
        expect(res).deep.equal([1,2,5]);
    });

    it("skip #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skip(5)).toArray();

        // --- Assert
        expect(res).deep.equal([]);
    });

    it("skip #4", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skip(100)).toArray();

        // --- Assert
        expect(res).deep.equal([]);
    });

    it("take #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.take(0)).toArray();

        // --- Assert
        expect(res).deep.equal([]);
    });

    it("take #2", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.take(3)).toArray();

        // --- Assert
        expect(res).deep.equal([3, 4, 1]);
    });

    it("take #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.take(100)).toArray();

        // --- Assert
        expect(res).deep.equal([3, 4, 1, 2, 5]);
    });

    it("skipTake #1", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skipTake(2, 2)).toArray();

        // --- Assert
        expect(res).deep.equal([1, 2]);
    });

    it("skipTake #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skipTake(100, 2)).toArray();

        // --- Assert
        expect(res).deep.equal([]);
    });

    it("skipTake #3", async () => {
        // --- Arrange
        const coll = new ReadOnlyCollection(numArray);

        // --- Act
        const res = (await coll.skipTake(2, 20)).toArray();

        // --- Assert
        expect(res).deep.equal([1, 2, 5]);
    });

});