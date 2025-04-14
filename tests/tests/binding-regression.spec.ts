import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("Increment counter through arrow function works", async ({ page }) => {
  const entryPoint = `
    <Stack gap="0.5rem" var.counter="{{ value: 0 }}" var.incrementFunc="{x => x.value++ }">
      <Button 
        testId="buttonComponent" label="Increment counter: {counter.value}"
        onClick="incrementFunc(counter)">
      </Button>
    </Stack>
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("Array.filter works with the binding engine #1", async ({ page }) => {
  const entryPoint = `
    <Button var.item="{ [5,4,3,2,1].filter(item => item % 2 === 0)[1] }"
      testId="button" label="stuff: {item}">
    </Button>
  `;
  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("button")).toHaveText("stuff: 2");
});

test("Array.filter works with the binding engine #2", async ({ page }) => {
  const entryPoint = `
    <Button 
      testId="button"
      var.containsArray="{{ array: [5, 4, 3, 2, 1] }}"
      var.item="{containsArray.array.filter(item => item % 2 === 0)[1] }"
      label="stuff: {item}" />
  `;
  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("button")).toHaveText("stuff: 2");
});

test("Array.reduce works with the binding engine", async ({ page }) => {
  const entryPoint = `
    <Button 
      testId="button"
      var.array="{[5, 4, 3, 2, 1]}"
      var.item="{ array.reduce((acc, item) => acc + item, 0) }"
      label="stuff: {item}" />
  `;
  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("button")).toHaveText("stuff: 15");
});

test("Action.delay works with the binding engine", async ({ page }) => {
  const entryPoint = `
    <Button 
      testId="button"
      var.actionCounter="{0}"
      var.asyncTestActionInVars="{ (stuff)=> { Actions.delay(100); return 123; } }"
      debug
      label="async process {actionCounter}"
      onClick="actionCounter = asyncTestActionInVars(5);" />
  `;
  await initApp(page, {
    entryPoint,
  });
  await page.getByTestId("button").click();
  await delay(200);
  await expect(page.getByTestId("button")).toHaveText("async process 123");
});

test("Button click with function in vars works", async ({ page }) => {
  const entryPoint = `
    <Button 
      testId="button"
      var.label=""
      var.objectArgument="{{ list: [1, 2, 3] }}"
      var.testFn="{ (arg) => { label = arg} }"
      label="{label}"
      onClick="testFn(objectArgument.list)" />
  `;
  await initApp(page, {
    entryPoint,
  });
  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText("1,2,3");
});

test("For-loop in vars function works", async ({ page }) => {
  const entryPoint = `
    <Button 
      testId="button"
      var.log=""
      var.runLoop="{()=>{ for (let i = 0; i < 10; i++) { log += i } }}"
      label="{log}"
      onClick="runLoop()" />
  `;
  await initApp(page, {
    entryPoint,
  });
  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText("0123456789");
});

test("Array.map works with the binding engine", async ({ page }) => {
  const entryPoint = `
    <Button 
      testId="button"
      var.log=""
      var.items="{[1, 2, 3]}"
      var.itemsMapped="{ JSON.stringify(items.map(id => {return {id: id} })) }"
      label="{log}"
      onClick="log = itemsMapped" />
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText('[{"id":1},{"id":2},{"id":3}]');
});

test.skip("Compound components works", async ({ page }) => {
  await initApp(page, {
    name: "Compound component",
    components: [
      {
        name: "AnotherTestButton",
        component: {
          type: "Button",
          uid: "test button inner compound inner1",
          props: {
            debug: true,
            label: "{$props.label}",
          },
          events: {
            click: "emitEvent('click')",
          },
        },
      },
      {
        name: "TestButton",
        component: {
          type: "Stack",
          props: {
            debug: true,
          },
          children: [
            {
              type: "Button",
              uid: "test button inner1",
              testId: "button1",
              props: {
                debug: true,
                label: "{$props.label1}",
              },
              events: {
                click: "emitEvent('click1')",
              },
            },
            {
              type: "Button",
              testId: "button2",
              uid: "test button inner2",
              props: {
                debug: true,
                label: "{$props.label2}",
              },
              events: {
                click: "emitEvent('click2')",
              },
            },
            {
              type: "AnotherTestButton",
              testId: "button3",
              uid: "test button inner compound",
              props: {
                debug: true,
                label: "{$props.label3}",
              },
              events: {
                click: "emitEvent('click3')",
              },
            },
          ],
        },
      },
    ],
    entryPoint: {
      type: "TestButton",
      vars: {
        counter1: 0,
        counter2: 0,
        counter3: 0,
      },
      uid: "test button used",
      props: {
        debug: true,
        label1: "Button1 {counter1}",
        label2: "Button2 {counter2}",
        label3: "Button3 {counter3}",
      },
      events: {
        click1: "counter1++",
        click2: "counter2++",
        click3: "counter3++",
      },
    },
  });
  await page.getByTestId("button1").click();
  await page.getByTestId("button1").click();
  await page.getByTestId("button1").click();
  await expect(page.getByTestId("button1")).toHaveText("Button1 3");
  await page.getByTestId("button2").click();
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("button2")).toHaveText("Button2 2");
  await page.getByTestId("button3").click();
  await expect(page.getByTestId("button3")).toHaveText("Button3 1");
});

test("Arrow in arrow works", async ({ page }) => {
  const entryPoint = `
    <Stack
      var.current="{0}"
      var.total="{200}"
      var.progressFn="{(cur, tot) => (Math.floor(1000 * cur / tot)) / 10}"
      var.progressLabel="{(progressCalc, cur, tot) => 'Progress: ' + progressCalc(cur, tot) + '%'}" >
      <Button
        testId="button"
        label="Process with next item"
        onClick="current++" />
      <Text 
        testId="text"
        value="{progressLabel(progressFn, current, total)}" />
    </Stack>
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("Progress: 0.5%");
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("Progress: 1%");
});

test("Recursive arrow function works", async ({ page }) => {
  const entryPoint = `
    <Button
      testId="button"
      var.label=""
      var.items="{[1, 2, 3]}"
      label="{label}"
      onClick="const fact = n => { if (n === 0) return 1; else return n * fact(n-1); }; label = fact(6);" />  
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText("720");
});

test("Array.map works in an event #1", async ({ page }) => {
  const entryPoint = `
    <Button
      testId="button"
      var.label=""
      label="{label}"
      onClick="label = JSON.stringify([1,2,3].map(id => {return {id: id} })); " />
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText('[{"id":1},{"id":2},{"id":3}]');
});

test("Array.map works in an event #2", async ({ page }) => {
  const entryPoint = `
    <Button
      testId="button"
      var.label=""
      label="{label}"
      onClick="label = JSON.stringify([[1],[2,3],[4,5,6]].map(item => {return item.map(id => { return {id: id}; })}))" />
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText(
    '[[{"id":1}],[{"id":2},{"id":3}],[{"id":4},{"id":5},{"id":6}]]',
  );
});

test("Array.map works in an event #3", async ({ page }) => {
  const entryPoint = `
    <Button
      testId="button"
      var.label=""
      label="{label}"
      onClick="label = JSON.stringify([1,2,3,4,5,6].map(item => ({item})));" />
  `;
  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText(
    '[{"item":1},{"item":2},{"item":3},{"item":4},{"item":5},{"item":6}]',
  );
});

test("Access var in parent container", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Fragment",
      vars: {
        isOpen: false,
      },
      children: [
        {
          type: "Text",
          testId: "text",
          props: {
            value: "isOpen: {isOpen}",
          },
        },
        {
          type: "Fragment",
          children: [
            {
              type: "Button",
              testId: "button1",
              props: {
                label: "toggle isOpen: {isOpen}",
              },
              events: {
                click: "isOpen = !isOpen",
              },
            },
          ],
        },
        {
          type: "Button",
          testId: "button2",
          vars: {
            fullyUnrelatedStuff: "stuff",
          },
          props: {
            label: "other toggle (in another nested container) isOpen: {isOpen}",
          },
          events: {
            click: "isOpen = !isOpen",
          },
        },
      ],
    },
  });

  await expect(page.getByTestId("text")).toHaveText("isOpen: false");
  await page.getByTestId("button1").click();
  await expect(page.getByTestId("text")).toHaveText("isOpen: true");
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("text")).toHaveText("isOpen: false");
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("text")).toHaveText("isOpen: true");
  await page.getByTestId("button1").click();
  await expect(page.getByTestId("text")).toHaveText("isOpen: false");
});

test("Setting null-values variable works", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Button",
      testId: "button",
      props: {
        label: "{stuff}",
      },
      vars: {
        stuff: null,
      },
      events: {
        click: "stuff=0",
      },
    },
  });

  await page.getByTestId("button").click();
  await expect(page.getByTestId("button")).toHaveText("0");
});

test("Async hell", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Stack",
      vars: {
        asyncValue: {
          valami: {
            counter: 0,
            counter2: 0,
          },
        },
        stuff: {
          a: {
            b: {
              c: 0,
            },
          },
        },
        results: {},

        getResult: "{()=> { delay(100); return asyncValue.valami.counter} }",
        set1: `{()=> {
      if( !results['set1'] ){ results['set1'] = {}; }
      results['set1'].setting = true;
      asyncValue.valami.counter += 1;
      results['set1'].value = asyncValue.valami.counter; 
      results['set1'].setting = false;
     }}`,
        set2: `{()=> {
      if(!results['set2']){ results['set2'] = {}; };
      results['set2'].setting = true;
      const res = getResult();
      asyncValue.valami.counter2 += res; 
      results['set2'].value = asyncValue.valami.counter2; 
      results['set2'].setting = false;
    }}`,
      },
      children: [
        {
          type: "Text",
          testId: "text1",
          props: {
            value: "{JSON.stringify(asyncValue.valami)}",
          },
        },
        {
          type: "Text",
          testId: "text2",
          props: {
            value: "{JSON.stringify(results)}",
          },
        },
        {
          type: "Stack",
          children: [
            {
              type: "Button",
              testId: "button1",
              props: {},
              events: {
                click: "set1();",
              },
            },
          ],
          events: {
            mounted: "set1()",
          },
        },
        {
          type: "Stack",
          children: [
            {
              type: "Button",
              testId: "button2",
              props: {},
              events: {
                click: "set2();",
              },
            },
          ],
          events: {
            mounted: "set2()",
          },
        },
      ],
    },
  });

  await expect(page.getByTestId("text1")).toHaveText('{"counter":1,"counter2":1}');
  await expect(page.getByTestId("text2")).toHaveText(
    '{"set1":{"setting":false,"value":1},"set2":{"setting":false,"value":1}}',
  );
  await page.getByTestId("button1").click();
  await delay(200);
  await expect(page.getByTestId("text1")).toHaveText('{"counter":2,"counter2":1}');
  await expect(page.getByTestId("text2")).toHaveText(
    '{"set1":{"setting":false,"value":2},"set2":{"setting":false,"value":1}}',
  );
  await page.getByTestId("button2").click();
  await delay(200);
  await expect(page.getByTestId("text1")).toHaveText('{"counter":2,"counter2":3}');
  await expect(page.getByTestId("text2")).toHaveText(
    '{"set1":{"setting":false,"value":2},"set2":{"setting":false,"value":3}}',
  );
});

test("Async return value works", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Stack",
      vars: {
        counter: 0,
        getResult: "{()=>{ delay(100); return 4; }}",
        setAsync: "{()=> { counter += getResult();  }}",
        setAsyncWORKS: "{()=> { const result = getResult(); counter += result;  }}",
      },
      children: [
        {
          type: "Text",
          testId: "text",
          props: {
            value: "{counter}",
          },
        },
        {
          type: "Button",
          testId: "button1",
          props: {
            label: "Doesn't work",
          },
          events: {
            click: "setAsync();",
          },
        },
        {
          type: "Button",
          testId: "button2",
          props: {
            label: "Works",
          },
          events: {
            click: "setAsyncWORKS();",
          },
        },
      ],
    },
  });

  await page.getByTestId("button1").click();
  await expect(page.getByTestId("text")).toHaveText("4");
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("text")).toHaveText("8");
});

test("Array push direct/indirect works", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Stack",
      vars: {
        array: [],
        objectWithArray: {
          arrayInside: [],
        },
      },
      children: [
        {
          type: "Text",
          testId: "text1",
          props: {
            value: "{array}",
          },
        },
        {
          type: "Text",
          testId: "text2",
          props: {
            value: "{objectWithArray.arrayInside}",
          },
        },
        {
          type: "Button",
          testId: "button1",
          props: {
            label: "Push to array",
          },
          events: {
            click: "array.push('hello')",
          },
        },
        {
          type: "Button",
          testId: "button2",
          props: {
            label: "Push to array in object",
          },
          events: {
            click: "objectWithArray.arrayInside.push('hello')",
          },
        },
        {
          type: "Button",
          testId: "button3",
          props: {
            label: "Push to array (indirect)",
          },
          events: {
            click: "const n = array; n.push('hello')",
          },
        },
        {
          type: "Button",
          testId: "button4",
          props: {
            label: "Push to array in object (indirect)",
          },
          events: {
            click: "const n = objectWithArray; n.arrayInside.push('hello')",
          },
        },
      ],
    },
  });

  await page.getByTestId("button1").click();
  await expect(page.getByTestId("text1")).toHaveText("hello");
  await expect(page.getByTestId("text2")).toHaveText("");
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("text1")).toHaveText("hello");
  await expect(page.getByTestId("text2")).toHaveText("hello");
  await page.getByTestId("button3").click();
  await expect(page.getByTestId("text1")).toHaveText("hello,hello");
  await expect(page.getByTestId("text2")).toHaveText("hello");
  await page.getByTestId("button4").click();
  await expect(page.getByTestId("text1")).toHaveText("hello,hello");
  await expect(page.getByTestId("text2")).toHaveText("hello,hello");
});

test("Cannot write read-only var", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Stack",
      props: {
        gap: "0.5rem",
      },
      vars: {
        msg: "",
        $counter: { value: 0 },
        incrementFunc: "{x => { try { x.value++; } catch { msg += ' read-only' } } }",
      },
      children: [
        {
          type: "Button",
          testId: "button1",
          props: {
            label: "{$counter.value}{msg}",
          },
          events: {
            click: "incrementFunc($counter)",
          },
        },
        {
          type: "Button",
          testId: "button2",
          props: {
            label: "{$counter.value} {msg}",
          },
          events: {
            click: "const n = $counter; incrementFunc(n)",
          },
        },
      ],
    },
  });

  await expect(page.getByTestId("button1")).toHaveText("0");
  await page.getByTestId("button1").click();
  await expect(page.getByTestId("button1")).toHaveText("0 read-only");
  await expect(page.getByTestId("button2")).toHaveText("0 read-only");
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("button2")).toHaveText("0 read-only read-only");
});

test("Event body transform to arrow works", async ({ page }) => {
  await initApp(page, {
    entryPoint: {
      type: "Stack",
      children: [
        {
          type: "Button",
          testId: "button1",
          vars: {
            val: 0,
          },
          props: {
            label: "#1: {val}",
          },
          events: {
            click: "val = 23",
          },
        },
        {
          type: "Button",
          testId: "button2",
          vars: {
            val: 0,
          },
          props: {
            label: "#2: {val}",
          },
          events: {
            click: "{val = 23}",
          },
        },
        {
          type: "Button",
          testId: "button3",
          vars: {
            val: 0,
          },
          props: {
            label: "#3: {val}",
          },
          events: {
            click: "() => val = 23",
          },
        },
        {
          type: "Button",
          testId: "button4",
          vars: {
            val: 0,
          },
          props: {
            label: "#4: {val}",
          },
          events: {
            click: "() => {val = 23}",
          },
        },
        {
          type: "Button",
          testId: "button5",
          vars: {
            val: 0,
          },
          props: {
            label: "#5: {val}",
          },
          events: {
            click: "(args) => val = args.toString()",
          },
        },
        {
          type: "Button",
          testId: "button6",
          vars: {
            val: 0,
          },
          props: {
            label: "#6: {val}",
          },
          events: {
            click: "{(args) => val = args.toString()}",
          },
        },
      ],
    },
  });

  await expect(page.getByTestId("button1")).toHaveText("#1: 0");
  await page.getByTestId("button1").click();
  await expect(page.getByTestId("button1")).toHaveText("#1: 23");
  await expect(page.getByTestId("button2")).toHaveText("#2: 0");
  await page.getByTestId("button2").click();
  await expect(page.getByTestId("button2")).toHaveText("#2: 23");
  await expect(page.getByTestId("button3")).toHaveText("#3: 0");
  await page.getByTestId("button3").click();
  await expect(page.getByTestId("button3")).toHaveText("#3: 23");
  await expect(page.getByTestId("button4")).toHaveText("#4: 0");
  await page.getByTestId("button4").click();
  await expect(page.getByTestId("button4")).toHaveText("#4: 23");
  await expect(page.getByTestId("button5")).toHaveText("#5: 0");
  await page.getByTestId("button5").click();
  await expect(page.getByTestId("button5")).toHaveText("#5: [object Object]");
  await expect(page.getByTestId("button6")).toHaveText("#6: 0");
  await page.getByTestId("button6").click();
  await expect(page.getByTestId("button6")).toHaveText("#6: [object Object]");
});

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
