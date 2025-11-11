import { describe, expect, it } from "vitest";
import type { ProxyCallbackArgs } from "../../../src/components-core/rendering/buildProxy";
import { buildProxy  } from "../../../src/components-core/rendering/buildProxy";

describe("proxy", () => {
  it("buildProxy keeps proxied reference on get", async () => {
    const testObject = {
      name: "John Doe",
      address: {
        city: "Budapest",
        street: {
          kind: "road",
          name: "Main",
          number: 1,
        },
      },
    };

    const proxyObject = buildProxy(testObject, () => {});

    expect(proxyObject.address).equal(proxyObject.address);
    expect(proxyObject.address).eql({
      city: "Budapest",
      street: {
        kind: "road",
        name: "Main",
        number: 1,
      },
    });
    expect(proxyObject.name).equal(proxyObject.name);
    expect(proxyObject.name).equal("John Doe");
    expect(proxyObject.address.street).equal(proxyObject.address.street);
    expect(proxyObject.address.street).eql({
      kind: "road",
      name: "Main",
      number: 1,
    });
  });

  it("buildProxy observes change #1", async () => {
    const testObject = {
      name: "John Doe",
      address: {
        city: "Budapest",
        street: {
          kind: "road",
          name: "Main",
          number: 1,
        },
      },
    };

    const changes: ProxyCallbackArgs[] = [];
    const proxyObject = buildProxy(testObject, (change) => {changes.push(change)});

    proxyObject.name = "Jane Doe";

    expect(changes.length).equal(1);
    const change = changes[0];
    expect(change.action).equal("set");
    expect(change.path).equal("name");
    expect(change.pathArray).eql(["name"]);
    expect(change.newValue).equal("Jane Doe");
    expect(change.previousValue).equal("John Doe");
  });

  it("buildProxy observes change #2", async () => {
    const testObject = {
      name: "John Doe",
      address: {
        city: "Budapest",
        street: {
          kind: "road",
          name: "Main",
          number: 1,
        },
      },
    };

    const changes: ProxyCallbackArgs[] = [];
    const proxyObject = buildProxy(testObject, (change) => {changes.push(change)});

    proxyObject.address.city = "Dunakeszi";

    expect(changes.length).equal(1);
    const change = changes[0];
    expect(change.action).equal("set");
    expect(change.path).equal("address.city");
    expect(change.pathArray).eql(["address", "city"]);
    expect(change.newValue).equal("Dunakeszi");
    expect(change.previousValue).equal("Budapest");
  });

  it("buildProxy observes change #3", async () => {
    const testObject = {
      name: "John Doe",
      address: {
        city: "Budapest",
        street: {
          kind: "road",
          name: "Main",
          number: 1,
        },
      },
    };

    const changes: ProxyCallbackArgs[] = [];
    const proxyObject = buildProxy(testObject, (change) => {changes.push(change)});

    proxyObject.address.street.name = "Kossuth";

    expect(changes.length).equal(1);
    const change = changes[0];
    expect(change.action).equal("set");
    expect(change.path).equal("address.street.name");
    expect(change.pathArray).eql(["address", "street", "name"]);
    expect(change.newValue).equal("Kossuth");
    expect(change.previousValue).equal("Main");
  });
});
