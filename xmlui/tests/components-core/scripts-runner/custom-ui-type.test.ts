import { describe, expect, it } from "vitest";
import { isCustomUiData } from "../../../src/components-core/script-runner/custom-ui-data";

describe("Custom UI types", () => {
    it("Type guard works for CustomUiData (true)", () => {
        // --- Arrange
        const customType= {
            _custom_data_type_: "decimal",
            some: 123456,
        }

        // --- Act
        const isCustom = isCustomUiData(customType);

        // --- Assert
        expect(isCustom).equal(true);
    });

    it("Type guard works for CustomUiData (false)", () => {
        // --- Arrange
        const customType= {
            some: 123456,
        }

        // --- Act
        const isCustom = isCustomUiData(customType);

        // --- Assert
        expect(isCustom).equal(false);
    });
});