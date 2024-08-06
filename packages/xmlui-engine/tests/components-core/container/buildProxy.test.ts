import { describe, expect, it } from "vitest";
import buildProxy from "@components-core/container/buildProxy";

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
});
