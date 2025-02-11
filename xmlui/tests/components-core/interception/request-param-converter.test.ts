import { describe, expect, it } from "vitest";
import { convertRequestParamPart } from "../../../src/components-core/utils/request-params"

describe("Request parameter converter", () => {
    it("string to integer #1", () => {
        // --- Arrange
        const data = {
            a: "123",
            b: true,
            c: 345
        }
        
        // --- Act
        const types = {
            a: "integer"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123,
            b: true,
            c: 345
        })
    });
    
    it("string to integer #2", () => {
        // --- Arrange
        const data = {
            a: "123",
            b: "-444",
            c: 345
        }

        // --- Act
        const types = {
            a: "integer",
            b: "integer"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123,
            b: -444,
            c: 345
        })
    });

    it("string to float #1", () => {
        // --- Arrange
        const data = {
            a: "123.25",
            b: true,
            c: 345
        }

        // --- Act
        const types = {
            a: "float"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123.25,
            b: true,
            c: 345
        })
    });

    it("string to float #2", () => {
        // --- Arrange
        const data = {
            a: "123.25",
            b: "234.5",
            c: 345
        }

        // --- Act
        const types = {
            a: "float",
            b: "real"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123.25,
            b: 234.5,
            c: 345
        })
    });

    it("string to float #3", () => {
        // --- Arrange
        const data = {
            a: "123.25",
            b: "234.5",
            c: 345
        }

        // --- Act
        const types = {
            a: "double",
            b: "real"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123.25,
            b: 234.5,
            c: 345
        })
    });
    
    const stringToBoolCases = [
        { s: "true",  exp: true},
        { s: "yes",  exp: true},
        { s: "on",  exp: true},
        { s: "false",  exp: false},
        { s: "no",  exp: false},
        { s: "off",  exp: false},
    ]

    stringToBoolCases.forEach((tc, idx) => it(`string to bool #${idx + 1}`, () => {
        // --- Arrange
        const data = {
            a: tc.s,
            b: "234.5",
            c: 345
        }

        // --- Act
        const types = {
            a: "boolean",
            b: "real"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: tc.exp,
            b: 234.5,
            c: 345
        })
    }))

    it("number to integer #1", () => {
        // --- Arrange
        const data = {
            a: 123.25,
            b: true,
            c: 345
        }

        // --- Act
        const types = {
            a: "integer"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123,
            b: true,
            c: 345
        })
    });

    it("number to integer #2", () => {
        // --- Arrange
        const data = {
            a: 123.25,
            b: 234,
            c: 345.5
        }

        // --- Act
        const types = {
            a: "integer",
            b: "integer",
            c: "integer"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 123,
            b: 234,
            c: 346
        })
    });

    it("number to bool", () => {
        // --- Arrange
        const data = {
            a: 123.25,
            b: true,
            c: 0
        }

        // --- Act
        const types = {
            a: "boolean",
            c: "boolean"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: true,
            b: true,
            c: false
        })
    });

    it("boolean to integer", () => {
        // --- Arrange
        const data = {
            a: true,
            b: "123",
            c: false
        }

        // --- Act
        const types = {
            a: "integer",
            c: "integer"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 1,
            b: "123",
            c: 0
        })
    });

    it("boolean to real", () => {
        // --- Arrange
        const data = {
            a: true,
            b: true,
            c: false
        }

        // --- Act
        const types = {
            a: "real",
            b: "double",
            c: "float"
        }
        const res = convertRequestParamPart(data, types)

        // --- Assert
        expect(res).deep.equal({
            a: 1,
            b: 1,
            c: 0
        })
    });


});