import { InputStream } from "../../../src/parsers/common/InputStream";
import { describe, expect, it } from "vitest";

describe("InputStream", () => {
  it("Builds from string", () => {
    // --- Act
    const is = new InputStream("hello");

    // --- Assert
    expect(is.position).equal(0);
    expect(is.line).equal(1);
    expect(is.column).equal(0);
    expect(is.source).equal("hello");
  });

  it("Peek #1", () => {
    // --- Arrange
    const is = new InputStream("hello");

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).equal("h");
    expect(is.position).equal(0);
    expect(is.line).equal(1);
    expect(is.column).equal(0);
  });

  it("Peek #3", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).equal("l");
    expect(is.position).equal(2);
    expect(is.line).equal(1);
    expect(is.column).equal(2);
  });

  it("Peek #5", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).equal(null);
    expect(is.position).equal(5);
    expect(is.line).equal(1);
    expect(is.column).equal(5);
  });

  it("Peek with new line #1", () => {
    // --- Arrange
    const is = new InputStream("he\nllo");
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).equal("\n");
    expect(is.position).equal(2);
    expect(is.line).equal(1);
    expect(is.column).equal(2);
  });

  it("Get #1", () => {
    // --- Arrange
    const is = new InputStream("hello");

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).equal("h");
    expect(is.position).equal(1);
    expect(is.line).equal(1);
    expect(is.column).equal(1);
  });

  it("Get #3", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).equal("l");
    expect(is.position).equal(3);
    expect(is.line).equal(1);
    expect(is.column).equal(3);
  });

  it("Get #5", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).equal(null);
    expect(is.position).equal(5);
    expect(is.line).equal(1);
    expect(is.column).equal(5);
  });

  it("Get with new line #1", () => {
    // --- Arrange
    const is = new InputStream("he\nllo");
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).equal("\n");
    expect(is.position).equal(3);
    expect(is.line).equal(2);
    expect(is.column).equal(0);
  });
});
