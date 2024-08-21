import { describe, expect, it } from "vitest";
import { collectVariableDependencies } from "@components-core/script-runner/visitors";
import { Parser } from "@parsers/scripting/Parser";

describe("collectVariableDependencies", () => {
  const stmtCases = [
    { src: "() => x", exp: ["x"] },
    { src: "(x) => x", exp: [] },
    { src: "({x}) => x", exp: [] },
    { src: "(x, y) => x + y", exp: [] },
    { src: "(x, y) => x + y + z.x", exp: ["z.x"] },
    { src: "(x, y) => x + y + z[x]", exp: ["z[x]"] },
    { src: "({x, y}) => x + y", exp: [] },
    { src: "({x, y}) => x + y + z.x", exp: ["z.x"] },
    {
      src: `
      () => { let x; z = 2 * x; }
      `,
      exp: [],
    },
    {
      src: `
      () => { let x; z = 2 * x + k; }
      `,
      exp: ["k"],
    },
    {
      src: `
      () => { let x; z = 2 * x + k[23].a; }
      `,
      exp: ["k['23'].a"],
    },
    {
      src: `
      () => { const x = 1; z = 2 * x; }
      `,
      exp: [],
    },
    {
      src: `
      () => { const x = 1; z = 2 * x + k; }
      `,
      exp: ["k"],
    },
    {
      src: `
      () => { const x = 1; z = 2 * x + k[23].a; }
      `,
      exp: ["k['23'].a"],
    },
    {
      src: `
      () => {
        let a; 
        { 
          let x; 
          z = 2 * x + a;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        a++; 
        { 
          let x; 
          z = 2 * x + a;
        }
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        for (let i = 0; i < 10; i++) {
          z = i;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        for (let i = 0; i < 10; i++) {
          z = i + x;        
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      (x) => {
        for (let i = 0; i < 10; i++) {
          z = i + x;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        for (let i in collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        for (const i in collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        let collection = [1, 2];
        for (let i in collection) {
          z = i;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        for (let i of collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        for (const i of collection) {
          z = i;        
        }
      }
      `,
      exp: ["collection"],
    },
    {
      src: `
      () => {
        let collection = [1, 2];
        for (let i of collection) {
          z = i;        
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x;
        } catch {
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch {
        }
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch {
          z = x + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch {
          let y = 6;
          z = x + y + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } finally {
          z = x + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } finally {
          let y = 6;
          z = x + y + a
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        try {
          const x = 3;
          z = x + a;
        } catch (e) {
          z = x + a + e
        }
      }
      `,
      exp: ["a", "x"],
    },
    {
      src: `
      () => {
        if (true) { 
          let x = 3;
          z = x;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        if (true) { 
          let x = 3;
        } else {
          z = x;
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      () => {
        if (true) { 
        } else {
          let x = 3;
          z = x;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        let x = 2;
        switch (x) {
          case 2:
            z = x;
            break;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        switch (x) {
          case 2:
            z = x;
            break;
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      () => {
        switch (123) {
          case 2:
            let x = 2;
            z = x;
            break;
        }
      }
      `,
      exp: [],
    },

    {
      src: `
      () => {
        switch (123) {
          case 1:
            z = x; 
          case 2:
            let x = 2;
            z = x;
            break;
        }
      }
      `,
      exp: ["x"],
    },

    {
      src: `
      () => {
        switch (123) {
          case 1:
            let y = 3;
            z = y; 
          case 2:
            let x = 2;
            z = x;
            break;
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        switch (123) {
          case 2: {
            let x = 2;
            z = x;
            break;
          }
          default:
            z = x;
            break;
        }
      }
      `,
      exp: ["x"],
    },
    {
      src: `
      () => {
        while (true) {
          let x = 23;
          z = 2 * x 
        }
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        while (true) {
          let x = 23;
          z = 2 * x + a 
        }
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        while (true) {
          z = 2 * x + a 
        }
      }
      `,
      exp: ["x", "a"],
    },
    {
      src: `
      () => {
        do {
          let x = 23;
          z = 2 * x + a 
        } while (true)
      }
      `,
      exp: ["a"],
    },
    {
      src: `
      () => {
        do {
          let x = 23;
          z = 2 * x 
        } while (true)
      }
      `,
      exp: [],
    },
    {
      src: `
      () => {
        do {
          z = 2 * x + a 
        } while (true)
      }
      `,
      exp: ["x", "a"],
    },
  ];
  stmtCases.forEach((c) =>
    it(`statement dependencies '${c.src}'`, () => {
      const dps = collectNew(c.src);
      expect(dps).deep.equal(c.exp);
    })
  );

  const exprCases = [
    { src: "x", exp: ["x"] },
    { src: "x + y", exp: ["x", "y"] },
    { src: "x - y", exp: ["x", "y"] },
    { src: "-x", exp: ["x"] },
    { src: "z * x + y", exp: ["z", "x", "y"] },
    { src: "z = x - y", exp: ["x", "y"] },
    { src: "z, x + y", exp: ["z", "x", "y"] },
    { src: "z, y, x", exp: ["z", "y", "x"] },
    { src: "[x, y, 123]", exp: ["x", "y"] },
    { src: "...x", exp: ["x"] },
    { src: "{x, y: z}", exp: ["x", "z"] },
    { src: "{x: a, y: z}", exp: ["a", "z"] },
    { src: "{...x}", exp: ["x"] },
    { src: "z += x * y", exp: ["x", "y"] },
    { src: "++x", exp: ["x"] },
    { src: "x--", exp: ["x"] },
    { src: "x > y ? a + 12 : z - 3", exp: ["x", "y", "a", "z"] },
    {
      src: "z = x + x.stuff + Object.keys(y[0]).reduce((acc, i)=>{acc + i} , 0)",
      exp: ["x", "x.stuff", "y['0']", "Object"],
    },
    { src: "x.y", exp: ["x.y"] },
    { src: "x[y]", exp: ["x[y]"] },
    { src: "x['y']", exp: ["x['y']"] },
    { src: "x['y'].z", exp: ["x['y'].z"] },
    { src: "x['y'].z + x['y']", exp: ["x['y'].z", "x['y']"] },
    { src: "x[123]", exp: ["x['123']"] },
    { src: "x[123].z", exp: ["x['123'].z"] },
    { src: "x[123].z + x[123]", exp: ["x['123'].z", "x['123']"] },
    { src: "x['y'].z + x[y]", exp: ["x['y'].z", "x[y]"] },
    { src: "x[123].z + x['123'].z", exp: ["x['123'].z"] },
    { src: "x.y[z]", exp: ["x.y[z]"] },
    { src: "x.y[z+x], x.y", exp: ["x.y", "z", "x"] },
    { src: "x.y[z+m].k", exp: ["x.y", "z", "m"] },
    { src: "x.y[z+m][k]", exp: ["x.y", "z", "m", "k"] },
    { src: "x.y[z+m][k].x", exp: ["x.y", "z", "m", "k"] },
    { src: "z = x", exp: ["x"] },
    { src: "x, y", exp: ["x", "y"] },
    { src: "x.y, y", exp: ["x.y", "y"] },
    { src: "Object.keys()", exp: ["Object"] },
    { src: "Object.keys(y[0])", exp: ["y['0']", "Object"] },
    { src: "Object.keys(y[a+b])", exp: ["y", "a", "b", "Object"] },
    { src: "Object.keys(y[0]).reduce", exp: ["y['0']", "Object"] },
  ];
  exprCases.forEach((c) =>
    it(`expr dependencies '${c.src}'`, () => {
      const dps = collectNew(c.src);
      expect(dps).deep.equal(c.exp);
    })
  );

  it("dependencies #1 - simple case", () => {
    // --- Arrange
    const source = "x + y * 13 * z";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["x", "y", "z"]);
  });

  it("dependencies #2 - member access", () => {
    // --- Arrange
    const source = "x + y * 13 * z.d";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["x", "y", "z.d"]);
  });

  it("dependencies #3 - arrow expression", () => {
    // --- Arrange
    const source = "x = (y, z) => y + z";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal([]);
  });

  it("dependencies #4 - complex, with memberAccess, calculatedMemberAccess", () => {
    // --- Arrange
    const source = "z = x + x.stuff + Object.keys(y[0]).reduce((acc, i)=>{acc + i} , 0)";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["x", "x.stuff", "y['0']", "Object"]);
  });

  it("dependencies regression #1", () => {
    // --- Arrange
    const source = `
    ()=>{
        if(!selectedItems.value.length){
          return;
        }
        if(selectedItems.value.length === 1 && !!selectedItems.value[0].file ){
          Actions.download({
              url: "/items/" + encodeURIComponent(selectedItems.value[0].itemId) + "/content",
              queryParams: {
                fileName: selectedItems.value[0].fileName
              }
            });
        } else {
          let x = selectedItems.value.map(item => ({ itemId: item.itemId }));
          console.log(x);
          Actions.download({
                url: "/items/content",
                method: "POST",
                body: {
                  fileName: selectedItems.value.length === 1 ? selectedItems.value[0].fileName : 'export_' + formatDate(Date.now()),
                  items: selectedItems.value.map(item => ({ itemId: item.itemId })),
                },
                fileName: selectedItems.value.length === 1 ? selectedItems.value[0].fileName : 'export_' + formatDate(Date.now())
            });
        }
      }
    `;

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal([
      "selectedItems.value.length",
      "selectedItems.value['0'].file",
      "selectedItems.value['0'].itemId",
      "encodeURIComponent",
      "selectedItems.value['0'].fileName",
      "Actions",
      "selectedItems.value",
      "console",
      "Date",
      "formatDate",
    ]);
  });

  it("dependencies regression #2", () => {
    // --- Arrange
    const source = `
    () => { let x = { operation: "a" } }
    `;

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal([]);
  });

  it("dependencies regression #3", () => {
    // --- Arrange
    const source = `
    () => { let x = { operation: operation } }
    `;

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["operation"]);
  });

  it("dependencies regression #4 missed .value dep", () => {
    // --- Arrange
    const source =
      "!!transform_undefined_data_loggedInUser ? transform_undefined_data_loggedInUser(undefined_data_loggedInUser.value) : undefined_data_loggedInUser.value;";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["transform_undefined_data_loggedInUser", "undefined_data_loggedInUser.value"]);
  });

  it("dependencies regression #5 missed dep in reduce", () => {
    // --- Arrange
    const source = `Object.entries($props.item.reactions.reduce((group, r) => {
              const { reaction } = r;
              group[reaction] = group[reaction] ?? [];
              group[reaction].push(r);
              return group;
            }, {})).map(([key, value]) => ({reaction: key, value}))`;

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["$props.item.reactions", "Object"]);
  });

  it("dependencies regression #6 missed dep in reduce", () => {
    // --- Arrange
    const source = `Object.entries(reduce())`;

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["reduce", "Object"]);
  });

  it("dependencies regression #7 missed dep in reduce", () => {
    // --- Arrange
    const source = `dummy.Object.entries(reduce())`;

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["reduce", "dummy.Object"]);
  });

  it("dependencies regression #8 extra dep with function", () => {
    // --- Arrange
    const source = "deleteQueue.getQueuedItems().length;";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["deleteQueue"]);
  });

  it("dependencies regression #9", () => {
    // --- Arrange
    const source = "deleteQueue.getQueuedItems(y[0]);";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["y['0']", "deleteQueue"]);
  });

  it("dependencies regression #10 - api fn present", () => {
    // --- Arrange
    const source = "deleteQueue.getQueuedItems(y[0]);";

    // --- Act
    const dps = collectNew(source, {
      deleteQueue: {
        getQueuedItems: () => {},
      },
    });

    // --- Arrange
    expect(dps).deep.equal(["y['0']", "deleteQueue.getQueuedItems"]);
  });

  it("dependencies regression #11 - api fn not present", () => {
    // --- Arrange
    const source = "deleteQueue.getQueuedItems(y[0]);";

    // --- Act
    const dps = collectNew(source, {
      deleteQueue: {},
    });

    // --- Arrange
    expect(dps).deep.equal(["y['0']", "deleteQueue"]);
  });

  it("dependencies regression #12 - inner function parameters shouldn't be collected", () => {
    // --- Arrange
    const source = "items.filter(item => item.status === 'completed')";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["items"]);
  });

  it("dependencies regression #13 - inner function parameters shouldn't be collected #2", () => {
    // --- Arrange
    const source = "(status) =>{ return items.filter(item => item.status === status) }";

    // --- Act
    const dps = collectNew(source);

    // --- Arrange
    expect(dps).deep.equal(["items"]);
  });
});

function collectNew(source: string, referenceTrackedApi: Record<string, any> = {}): string[] {
  const parser = new Parser(source);
  const expr = parser.parseExpr();
  return collectVariableDependencies(expr!, referenceTrackedApi);
}
