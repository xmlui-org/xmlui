import { describe, expect, it } from "vitest";
import { orderBy } from "@components-core/utils/misc"

const numArray = [3,4,1,2,5];
const strArray = ["beta", "delta", "alpha", "gamma", "charlie"]
const objArray = [
    { key: "hey", value: 1},
    { key: "bye", value: 114},
    { key: "hey", value: 3},
    { key: "bye", value: 41},
    { key: "ok", value: 1000},
]

describe("orderBy", () => {
    it("single number", async () => {
        // --- Act
        const res = await orderBy(numArray, async (i: any) => i);
        
        // --- Assert
        expect(res[0]).equal(1);
        expect(res[1]).equal(2);
        expect(res[2]).equal(3);
        expect(res[3]).equal(4);
        expect(res[4]).equal(5);
    });

    it("single number, desc", async () => {
        // --- Act
        const res = await orderBy(numArray, async (i: any) => i, true);

        // --- Assert
        expect(res[0]).equal(5);
        expect(res[1]).equal(4);
        expect(res[2]).equal(3);
        expect(res[3]).equal(2);
        expect(res[4]).equal(1);
    });

    it("single string", async () => {
        // --- Act
        const res = await orderBy(strArray, async (i: any) => i);

        // --- Assert
        expect(res[0]).equal("alpha");
        expect(res[1]).equal("beta");
        expect(res[2]).equal("charlie");
        expect(res[3]).equal("delta");
        expect(res[4]).equal("gamma");
    });

    it("single string, desc", async () => {
        // --- Act
        const res = await orderBy(strArray, async (i: any) => i, true);

        // --- Assert
        expect(res[0]).equal("gamma");
        expect(res[1]).equal("delta");
        expect(res[2]).equal("charlie");
        expect(res[3]).equal("beta");
        expect(res[4]).equal("alpha");
    });

    it("single object, string mapper", async () => {
        // --- Act
        const res = await orderBy(objArray, "value");

        // --- Assert
        expect(res[0].value).equal(1);
        expect(res[1].value).equal(3);
        expect(res[2].value).equal(41);
        expect(res[3].value).equal(114);
        expect(res[4].value).equal(1000);
    });

    it("single object, string mapper, desc", async () => {
        // --- Act
        const res = await orderBy(objArray, "value", true);

        // --- Assert
        expect(res[0].value).equal(1000);
        expect(res[1].value).equal(114);
        expect(res[2].value).equal(41);
        expect(res[3].value).equal(3);
        expect(res[4].value).equal(1);
    });

    it("single object, func mapper", async () => {
        // --- Act
        const res = await orderBy(objArray, async (i: any) => i.value);

        // --- Assert
        expect(res[0].value).equal(1);
        expect(res[1].value).equal(3);
        expect(res[2].value).equal(41);
        expect(res[3].value).equal(114);
        expect(res[4].value).equal(1000);
    });

    it("single object, func mapper, desc", async () => {
        // --- Act
        const res = await orderBy(objArray, async (i: any) => i.value, true);

        // --- Assert
        expect(res[0].value).equal(1000);
        expect(res[1].value).equal(114);
        expect(res[2].value).equal(41);
        expect(res[3].value).equal(3);
        expect(res[4].value).equal(1);
    });

    it("multiple object #1", async () => {
        // --- Act
        const res = await orderBy(objArray, async (i: any) => i.key, async (i: any) => i.value);

        // --- Assert
        expect(res[0].key).equal("bye");
        expect(res[0].value).equal(41);
        expect(res[1].key).equal("bye");
        expect(res[1].value).equal(114);
        expect(res[2].key).equal("hey");
        expect(res[2].value).equal(1);
        expect(res[3].key).equal("hey");
        expect(res[3].value).equal(3);
        expect(res[4].key).equal("ok");
        expect(res[4].value).equal(1000);
    });

    it("multiple object #2", async () => {
        // --- Act
        const res = await orderBy(objArray, async (i: any) => i.key, true, async (i: any) => i.value);

        // --- Assert
        expect(res[0].key).equal("ok");
        expect(res[0].value).equal(1000);
        expect(res[1].key).equal("hey");
        expect(res[1].value).equal(1);
        expect(res[2].key).equal("hey");
        expect(res[2].value).equal(3);
        expect(res[3].key).equal("bye");
        expect(res[3].value).equal(41);
        expect(res[4].key).equal("bye");
        expect(res[4].value).equal(114);
    });

    it("multiple object #3", async () => {
        // --- Act
        const res = await orderBy(objArray, async (i: any) => i.key, async (i: any) => i.value, true);

        // --- Assert
        expect(res[0].key).equal("bye");
        expect(res[0].value).equal(114);
        expect(res[1].key).equal("bye");
        expect(res[1].value).equal(41);
        expect(res[2].key).equal("hey");
        expect(res[2].value).equal(3);
        expect(res[3].key).equal("hey");
        expect(res[3].value).equal(1);
        expect(res[4].key).equal("ok");
        expect(res[4].value).equal(1000);
    });

    it("multiple object #4", async () => {
        // --- Act
        const res = await orderBy(objArray, async (i: any) => i.key, true, async (i: any) => i.value, true);

        // --- Assert
        expect(res[0].key).equal("ok");
        expect(res[0].value).equal(1000);
        expect(res[1].key).equal("hey");
        expect(res[1].value).equal(3);
        expect(res[2].key).equal("hey");
        expect(res[2].value).equal(1);
        expect(res[3].key).equal("bye");
        expect(res[3].value).equal(114);
        expect(res[4].key).equal("bye");
        expect(res[4].value).equal(41);
    });
});