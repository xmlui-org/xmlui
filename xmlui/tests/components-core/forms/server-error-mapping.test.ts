/**
 * Unit tests for `extractServerValidationProblem` (Plan #9 Phase 3 / Step 3.1).
 *
 * Tests the four supported wire shapes plus the "no recognised shape"
 * fallback. All tests are pure / synchronous.
 */

import { describe, it, expect } from "vitest";
import { extractServerValidationProblem } from "../../../src/components-core/forms/server-error-mapping";

// ---------------------------------------------------------------------------
// RFC 7807 / RFC 9457 shape
// ---------------------------------------------------------------------------

describe("RFC 7807 — invalid-params", () => {
  it("extracts invalid-params from a flat Problem Details body", () => {
    const error = {
      type: "https://example.com/errors/validation",
      title: "Unprocessable Entity",
      status: 422,
      detail: "Two fields are invalid.",
      "invalid-params": [
        { name: "email", reason: "Not a valid email address" },
        { name: "age", reason: "Must be a positive integer", code: "range" },
      ],
    };
    const result = extractServerValidationProblem(error);
    expect(result).toBeDefined();
    expect(result!.status).toBe(422);
    expect(result!.detail).toBe("Two fields are invalid.");
    expect(result!.invalidParams).toHaveLength(2);
    expect(result!.invalidParams[0]).toEqual({
      name: "email",
      reason: "Not a valid email address",
    });
    expect(result!.invalidParams[1].code).toBe("range");
  });

  it("accepts camelCase invalidParams alias", () => {
    const error = {
      status: 400,
      invalidParams: [{ name: "field", reason: "required" }],
    };
    const result = extractServerValidationProblem(error);
    expect(result?.invalidParams[0].name).toBe("field");
  });

  it("finds the body nested under error.data (AppError pattern)", () => {
    const error = {
      message: "Request failed",
      data: {
        "invalid-params": [{ name: "username", reason: "Already taken" }],
      },
    };
    const result = extractServerValidationProblem(error);
    expect(result?.invalidParams[0].name).toBe("username");
  });
});

// ---------------------------------------------------------------------------
// Spring Boot shape
// ---------------------------------------------------------------------------

describe("Spring Boot — errors[]", () => {
  it("extracts field errors from a Spring BindingResult payload", () => {
    const error = {
      errors: [
        { field: "email", defaultMessage: "must be a well-formed email address" },
        { field: "age", message: "must be greater than 0", code: "Min" },
      ],
    };
    const result = extractServerValidationProblem(error);
    expect(result?.invalidParams).toHaveLength(2);
    expect(result!.invalidParams[0].name).toBe("email");
    expect(result!.invalidParams[1].code).toBe("Min");
  });
});

// ---------------------------------------------------------------------------
// Laravel shape
// ---------------------------------------------------------------------------

describe("Laravel — errors{}", () => {
  it("extracts field errors from a Laravel validation response", () => {
    const error = {
      message: "The given data was invalid.",
      errors: {
        email: ["The email field is required.", "The email must be a valid email address."],
        password: ["The password must be at least 8 characters."],
      },
    };
    const result = extractServerValidationProblem(error);
    // First message per field is extracted.
    expect(result?.invalidParams).toHaveLength(2);
    const emailEntry = result!.invalidParams.find((p) => p.name === "email");
    expect(emailEntry?.reason).toBe("The email field is required.");
    const passEntry = result!.invalidParams.find((p) => p.name === "password");
    expect(passEntry?.reason).toBe("The password must be at least 8 characters.");
  });
});

// ---------------------------------------------------------------------------
// XMLUI legacy shape (GenericBackendError)
// ---------------------------------------------------------------------------

describe("XMLUI legacy — details.issues", () => {
  it("extracts issues from a GenericBackendError payload", () => {
    const error = {
      details: {
        issues: [
          { field: "email", message: "Invalid email", severity: "error" },
          { field: "name", message: "Too short", severity: "warning" },
        ],
      },
    };
    const result = extractServerValidationProblem(error);
    expect(result?.invalidParams).toHaveLength(2);
    expect(result!.invalidParams[0]).toMatchObject({
      name: "email",
      reason: "Invalid email",
      severity: "error",
    });
    expect(result!.invalidParams[1]).toMatchObject({
      name: "name",
      severity: "warning",
    });
  });
});

// ---------------------------------------------------------------------------
// Unrecognised shapes
// ---------------------------------------------------------------------------

describe("unrecognised shape", () => {
  it("returns undefined for a plain string error", () => {
    expect(extractServerValidationProblem("something went wrong")).toBeUndefined();
  });

  it("returns undefined for an Error instance with no known payload", () => {
    expect(extractServerValidationProblem(new Error("network error"))).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(extractServerValidationProblem(null)).toBeUndefined();
  });

  it("returns undefined for an empty object", () => {
    expect(extractServerValidationProblem({})).toBeUndefined();
  });
});
