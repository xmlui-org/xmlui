import { describe, test, expect } from "vitest";
import { format, type FormatOptions } from "../../src/language-server/services/format";
import { createXmlUiParser, toDbgString } from "../../src/parsers/xmlui-parser";

describe("XML Formatter", () => {
  describe("Format Options", () => {
    test("should respect custom indentation", () => {
      const input = "<Fragment><Text>Content</Text></Fragment>";
      const result = formatTwice(input, { tabSize: 4, insertSpaces: true });

      expect(result).toEqual(
        `<Fragment>
    <Text>
        Content
    </Text>
</Fragment>`,
      );
    });

    test("should respect tab indentation", () => {
      const input = "<Fragment><Text>Content</Text></Fragment>";
      const result = formatTwice(input, { tabSize: 4, insertSpaces: false });

      expect(result).toEqual(
        `<Fragment>
\t<Text>
\t\tContent
\t</Text>
</Fragment>`,
      );
    });
  });

  describe("Basic XML Formatting", () => {
    test("should format simple xmlui fragment", () => {
      const input = '<Fragment><Text testId="textShort" width="200px">Short</Text></Fragment>';
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
</Fragment>`,
      );
    });

    test("should format nested xmlui elements", () => {
      const input =
        '<Fragment><Text testId="textShort" width="200px">Short</Text><Text testId="textLong" width="200px" maxLines="2">Long text content</Text></Fragment>';
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
  <Text testId="textLong" width="200px" maxLines="2">
    Long text content
  </Text>
</Fragment>`,
      );
    });

    test("should preserve text content", () => {
      const input =
        "<Text>Though this long text does not fit into a single line, please do not break it!</Text>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Text>
  Though this long text does not fit into a single line, please do not break it!
</Text>`,
      );
    });

    test("should format self-closing tags", () => {
      const input = '<Fragment><Input type="text"/><Button/></Fragment>';
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Input type="text" />
  <Button />
</Fragment>`,
      );
    });

    test("should format key-only attribue", () => {
      const input = '<Fragment><Input type="text" enabled/><Button/></Fragment>';
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Input type="text" enabled />
  <Button />
</Fragment>`,
      );
    });
  });

  describe("CDATA Handling", () => {
    test("should preserve CDATA sections", () => {
      const input = "<Fragment><Text><![CDATA[Some <special> content & more]]></Text></Fragment>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text>
    <![CDATA[Some <special> content & more]]>
  </Text>
</Fragment>`,
      );
    });

    test("should format XML with multiple CDATA sections", () => {
      const input =
        "<Fragment><Text><![CDATA[First CDATA]]></Text><Text><![CDATA[Second CDATA with <tags>]]></Text></Fragment>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text>
    <![CDATA[First CDATA]]>
  </Text>
  <Text>
    <![CDATA[Second CDATA with <tags>]]>
  </Text>
</Fragment>`,
      );
    });

    test("should handle CDATA with special characters", () => {
      const input = "<Text><![CDATA[Content with & < > \" ' characters]]></Text>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Text>
  <![CDATA[Content with & < > " ' characters]]>
</Text>`,
      );
    });
  });

  describe("newlines", () => {
    test("keeps single blank line", () => {
      const result = formatTwice("<A />\n\n<A />");
      expect(result).toEqual(`<A />\n\n<A />`);
    });

    test("converts single whitespace only line to blank line", () => {
      const result = formatTwice("<A />\n   \n<A />");
      expect(result).toEqual(`<A />\n\n<A />`);
    });

    test("keeps blank line around comment only line", () => {
      const result = formatTwice(`<A />

<!--c-->

<A />`);
      expect(result).toEqual(`<A />

<!--c-->

<A />`);
    });

    test("collapses multiple blank lines around comment only line", () => {
      const result = formatTwice(`<A />


  <!--c-->


<A />`);
      expect(result).toEqual(`<A />

<!--c-->

<A />`);
    });
    test("collapses multiple blank lines around 2 comment only line", () => {
      const result = formatTwice(`<A />


  <!--c--><!--c-->


<A />`);
      expect(result).toEqual(`<A />

<!--c-->
<!--c-->

<A />`);
    });

    test("collapses multiple blank lines into single one", () => {
      const result = formatTwice("<A />\n\n\n<A />");
      expect(result).toEqual(`<A />\n\n<A />`);
    });

    test("collapses multiple whitespace only lines into single blank line", () => {
      const result = formatTwice("<A />\n    \n  \n<A />");
      expect(result).toEqual(`<A />\n\n<A />`);
    });
  });

  describe("comments", () => {
    test("single comment #1", () => {
      const input = `<<!--c-->n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `< <!--c--> n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #2", () => {
      const input = `<n<!--c--> attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n <!--c--> attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #3", () => {
      const input = `<n attr<!--c-->="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr <!--c--> ="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #4", () => {
      const input = `<n attr=<!--c-->"val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr= <!--c--> "val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #5", () => {
      const input = `<n attr="val"<!--c--> attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" <!--c--> attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #6", () => {
      const input = `<n attr="val" attr2<!--c-->>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2 <!--c-->>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #7", () => {
      const input = `<n attr="val" attr2><!--c-->
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  <!--c-->
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #8", () => {
      const input = `<n attr="val" attr2>
  <!--c-->text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  <!--c-->text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #9", () => {
      const input = `<n attr="val" attr2>
  text1<!--c-->
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1 <!--c-->
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #10", () => {
      const input = `<n attr="val" attr2>
  text1
  <!--c--><n2
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <!--c-->
  <n2
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #11", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2<!--c-->
    attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    <!--c-->
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #12", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    <!--c-->attr3="val2"
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    <!--c-->
    attr3="val2"
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #13", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"<!--c-->
    attr4 />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    <!--c-->
    attr4 />
  text2
</n>`,
      );
    });

    test("single comment #14", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4<!--c--> />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
    <!--c--> />
  text2
</n>`,
      );
    });

    test("single comment #15", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2<!--c-->
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2 <!--c-->
</n>`,
      );
    });

    test("single comment #16", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
  <!--c-->
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
  <!--c-->
</n>`,
      );
    });

    test("single comment #17", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n><!--c-->`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n> <!--c-->`,
      );
    });

    test("single comment #19", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</<!--c-->n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</ <!--c--> n>`,
      );
    });

    test("single comment #20", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n<!--c-->>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4 />
  text2
</n <!--c-->>`,
      );
    });

    test("single comment between tags does not break line", () => {
      const input = `<n>
  <n1 /> <!-- c -->
  <n2 />
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n>
  <n1 /> <!-- c -->
  <n2 />
</n>`,
      );
    });

    test("single comment between tags keeps linebreak", () => {
      const input = `<n>
  <n1 />
<!-- c -->
  <n2 />
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n>
  <n1 />
  <!-- c -->
  <n2 />
</n>`,
      );
    });

    test("adds newline after single comment between tags", () => {
      const input = `<n>
  <n1 />
<!-- c --><n2 />
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n>
  <n1 />
  <!-- c -->
  <n2 />
</n>`,
      );
    });

    test("single comment as the only content in tag", () => {
      const input = `<n> <!-- c --> </n>`;
      const result = formatTwice(input);

      expect(result).toEqual(`<n> <!-- c -->
</n>`);
    });

    test("2 comments as the only content in tag", () => {
      const input = `<n> <!-- c --> <!-- d --> </n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n> <!-- c -->
  <!-- d -->
</n>`,
      );
    });

    test("single comment, error node in before attributes", () => {
      const input = `<n attr="val" <!-- long, long commonet long, long commonet long, long commonet long, long commonet --> attr2 ? ></n2>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n
  attr="val"
  <!-- long, long commonet long, long commonet long, long commonet long, long commonet -->
  attr2 ?></n2>`,
      );
    });

    test("single comment before ':' in tag name ", () => {
      const input = `<ns<!-- c -->:n attr="val" />`;
      const result = formatTwice(input);

      expect(result).toEqual(`<ns <!-- c --> :n attr="val" />`);
    });

    test("single comment after ':' in tag name ", () => {
      const input = `<ns:<!-- c -->n attr="val" />`;
      const result = formatTwice(input);

      expect(result).toEqual(`<ns: <!-- c --> n attr="val" />`);
    });

    test("single comment before ':' in attr name", () => {
      const input = `<n ns<!-- c -->:attr="val" />`;
      const result = formatTwice(input);

      expect(result).toEqual(`<n ns <!-- c --> :attr="val" />`);
    });

    test("single comment after ':' in attr name", () => {
      const input = `<n ns:<!-- c -->attr="val" />`;
      const result = formatTwice(input);

      expect(result).toEqual(`<n ns: <!-- c --> attr="val" />`);
    });

    test("should handle comments before eof", () => {
      const input = `<Fragment><Text>Content</Text></Fragment>
        <!-- This is a comment -->`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text>
    Content
  </Text>
</Fragment>
<!-- This is a comment -->`,
      );
    });
  });
  describe("Edge Cases", () => {
    test("should handle empty string", () => {
      const result = formatTwice("");
      expect(result).toEqual("");
    });

    test("should handle whitespace-only string", () => {
      const result = formatTwice("   \n  \t  ");
      expect(result).toEqual("");
    });

    test("should handle single self-closing tag", () => {
      const input = '<Input type="text"/>';
      const result = formatTwice(input);

      expect(result).toEqual(`<Input type="text" />`);
    });

    test("should handle deeply nested elements", () => {
      const input =
        "<Fragment><Container><Section><Text>Deep content</Text></Section></Container></Fragment>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Container>
    <Section>
      <Text>
        Deep content
      </Text>
    </Section>
  </Container>
</Fragment>`,
      );
    });

    test("should handle mixed content", () => {
      const input = "<Text>Before<Bold>bold</Bold>After</Text>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Text>
  Before
  <Bold>
    bold
  </Bold>
  After
</Text>`,
      );
    });
  });

  describe("Real-world xmlui Examples", () => {
    test("should format typical xmlui component", () => {
      const input = `<Fragment>
  <Text testId="textShort" width="200px">Short</Text>
  <Text testId="textLong" width="200px" maxLines="2">
    Though this long text does not fit into a single line, please do not break it!
  </Text>
</Fragment>`;

      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
  <Text testId="textLong" width="200px" maxLines="2">
    Though this long text does not fit into a single line, please do not break it!
  </Text>
</Fragment>`,
      );
    });

    test("should format long attribute list in paired tag", () => {
      const input =
        '<Button testId="submitBtn" variant="primary" size="large" disabled="false" onClick="handleClick">Submit</Button>';
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Button
  testId="submitBtn"
  variant="primary"
  size="large"
  disabled="false"
  onClick="handleClick">
  Submit
</Button>`,
      );
    });

    test("should format long attribute list in self-closing tag", () => {
      const input =
        '<Button testId="submitBtn" variant="primary" size="large" disabled="false" onClick="handleClick"/>';
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Button
  testId="submitBtn"
  variant="primary"
  size="large"
  disabled="false"
  onClick="handleClick" />`,
      );
    });

    test("should format complex xmlui layout", () => {
      const input =
        "<Fragment><Header><Title>Page Title</Title></Header><Main><Section><Text>Content</Text><Button>Action</Button></Section></Main><Footer><Text>Footer content</Text></Footer></Fragment>";
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Header>
    <Title>
      Page Title
    </Title>
  </Header>
  <Main>
    <Section>
      <Text>
        Content
      </Text>
      <Button>
        Action
      </Button>
    </Section>
  </Main>
  <Footer>
    <Text>
      Footer content
    </Text>
  </Footer>
</Fragment>`,
      );
    });
  });
});

function formatFromString(
  input: string,
  options: FormatOptions = { tabSize: 2, insertSpaces: true },
) {
  const parser = createXmlUiParser(input);
  const { node } = parser.parse();
  const defaultOptions: FormatOptions = { insertSpaces: true, tabSize: 2, ...options };

  return format(node, parser.getText, defaultOptions);
}

/* also tests idempotency */
function formatTwice(input: string, options: FormatOptions = { tabSize: 2, insertSpaces: true }) {
  const firstFormat = formatFromString(input, options);
  const secondFormat = formatFromString(firstFormat, options);

  expect(firstFormat).toBe(secondFormat);
  return firstFormat;
}
