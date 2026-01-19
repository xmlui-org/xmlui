import { describe, test, expect } from "vitest";
import { format, type FormatOptions } from "../../../src/language-server/services/format";
import { createXmlUiParser, toDbgString } from "../../../src/parsers/xmlui-parser";

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

    test("should indent script tag", () => {
      const input = `<App>
<script>
    var dummy="Hello World";
    console.log("Select initialized");
    </script>
      <H1>
    {dummy}
  </H1>
</App>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<App>
  <script>
    var dummy="Hello World";
    console.log("Select initialized");
  </script>
  <H1>
    {dummy}
  </H1>
</App>`,
      );
    });

    test("should format single line script tag", () => {
      const input = `<App>
<script>console.log("Select initialized");    </script>
    <Button/>
</App>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<App>
  <script> console.log("Select initialized"); </script>
  <Button />
</App>`,
      );
    });

    test("should format content right before closing script tag", () => {
      const input = `<App>
<script>
    console.log("Select initialized");
    console.log("Select initialized");</script>
    <Button/>
</App>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<App>
  <script>
    console.log("Select initialized");
    console.log("Select initialized");
  </script>
  <Button />
</App>`,
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
    test("should handle comment before tag name", () => {
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
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment after tag name", () => {
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
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment between attribute name and =", () => {
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
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment before attribute value", () => {
      const input = `<n attr=<!--c-->"val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr= <!--c--> "val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment between attributes", () => {
      const input = `<n attr="val"<!--c--> attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" <!--c--> attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment after last attribute", () => {
      const input = `<n attr="val" attr2<!--c-->>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2 <!--c-->>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment after opening tag", () => {
      const input = `<n attr="val" attr2><!--c-->
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  <!--c-->
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment before text content", () => {
      const input = `<n attr="val" attr2>
  <!--c-->text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  <!--c-->text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment after text content", () => {
      const input = `<n attr="val" attr2>
  text1<!--c-->
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1 <!--c-->
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment before child element", () => {
      const input = `<n attr="val" attr2>
  text1
  <!--c--><n2
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <!--c-->
  <n2
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment in self closing tag after name", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2<!--c-->
    attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    <!--c-->
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment in self closing tag after newline name", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    <!--c-->attr3="val2"
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    <!--c-->
    attr3="val2"
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment in self closing tag between attributes", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"<!--c-->
    attr4
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    <!--c-->
    attr4
  />
  text2
</n>`,
      );
    });

    test("should handle comment before self-closing tag closing", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
    <!--c-->
  />
  text2
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
    <!--c-->
  />
  text2
</n>`,
      );
    });

    test("should handle comment between text and closing tag", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2<!--c-->
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2 <!--c-->
</n>`,
      );
    });

    test("should handle comment between text with newline and closing tag", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
  <!--c-->
</n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
  <!--c-->
</n>`,
      );
    });

    test("should handle comment right after last tag", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n><!--c-->`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n> <!--c-->`,
      );
    });

    test("should handle comment after closeNodeStart", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</<!--c-->n>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</ <!--c--> n>`,
      );
    });

    test("should handle comment after closeing tag name", () => {
      const input = `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
  text2
</n<!--c-->>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<n attr="val" attr2>
  text1
  <n2
    attr3="val2"
    attr4
  />
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
  attr2 ?
></n2>`,
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

    test("should handle comments after text, before eof", () => {
      const input = `Content        <!-- c-->`;
      const result = formatTwice(input);

      expect(result).toEqual(`Content <!-- c-->`);
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
  onClick="handleClick"
>
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
  onClick="handleClick"
/>`,
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

  describe("Additional Test Cases", () => {
    test("should handle multiple comments in same line", () => {
      const input = `<Fragment><!-- comment1 --><!-- comment2 --><Text>Content</Text></Fragment>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment> <!-- comment1 -->
  <!-- comment2 -->
  <Text>
    Content
  </Text>
</Fragment>`,
      );
    });

    test("should handle XML with namespaces", () => {
      const input = `<ns:Fragment xmlns:ns="http://example.com">
<ns:Text>Content</ns:Text>
</ns:Fragment>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<ns:Fragment xmlns:ns="http://example.com">
  <ns:Text>
    Content
  </ns:Text>
</ns:Fragment>`,
      );
    });

    test("should handle XML with escaped content", () => {
      const input = `<Fragment>
<Text>&lt;div&gt;Content&lt;/div&gt; &amp; &quot;quotes&quot;</Text>
</Fragment>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text>
    &lt;div&gt;Content&lt;/div&gt; &amp; &quot;quotes&quot;
  </Text>
</Fragment>`,
      );
    });

    test("should handle XML with mixed line endings", () => {
      const input = `<Fragment>\r\n<Text>Content</Text>\r\n</Fragment>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text>
    Content
  </Text>
</Fragment>`,
      );
    });

    test("should handle XML with trailing whitespace", () => {
      const input = `<Fragment/>     `;
      const result = formatTwice(input);

      expect(result).toEqual(`<Fragment />`);
    });

    test("should handle XML with very long lines", () => {
      const input = `<Fragment><Text attr1="value1" attr2="value2" attr3="value3" attr4="value4" attr5="value5" attr6="value6" attr7="value7" attr8="value8" attr9="value9" attr10="value10">text content</Text></Fragment>`;
      const result = formatTwice(input);

      expect(result).toEqual(
        `<Fragment>
  <Text
    attr1="value1"
    attr2="value2"
    attr3="value3"
    attr4="value4"
    attr5="value5"
    attr6="value6"
    attr7="value7"
    attr8="value8"
    attr9="value9"
    attr10="value10"
  >
    text content
  </Text>
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
