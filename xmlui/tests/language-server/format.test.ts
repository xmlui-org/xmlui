import { describe, test, expect } from 'vitest';
import { format } from '../../src/language-server/services/format';
import { createXmlUiParser } from '../../src/parsers/xmlui-parser';
import type { FormattingOptions } from 'vscode-languageserver';

describe('XML Formatter', () => {
  function formatFromString(input: string, options: FormattingOptions = {tabSize: 2, insertSpaces: true}){

    const parser1 = createXmlUiParser(input);
    const { node: node1 } = parser1.parse();
    const defaultOptions: FormattingOptions = { insertSpaces: true, tabSize: 2, ...options };

    return format(node1, parser1.getText, defaultOptions);
  }
  // Helper function to test idempotency
  function testIdempotency(input: string, options: FormattingOptions = {tabSize: 2, insertSpaces: true}) {
    const firstFormat = formatFromString(input, options)
    const secondFormat = formatFromString(firstFormat, options)

    expect(secondFormat).toBe(firstFormat);
    return firstFormat;
  }

  describe('Format Options', () => {
    test('should respect custom indentation', () => {
      const input = '<Fragment><Text>Content</Text></Fragment>';
      const result = formatFromString(input, { tabSize: 4, insertSpaces: true});

      expect(result).toEqual(
`<Fragment>
    <Text>
        Content
    </Text>
</Fragment>`);
    });

    test('should respect tab indentation', () => {
      const input = '<Fragment><Text>Content</Text></Fragment>';
      const result = formatFromString(input, { tabSize: 4, insertSpaces: false});

      expect(result).toEqual(
`<Fragment>
\t<Text>
\t\tContent
\t</Text>
</Fragment>`);
    });

  });

  describe('Basic XML Formatting', () => {
    test('should format simple xmlui fragment', () => {
      const input = '<Fragment><Text testId="textShort" width="200px">Short</Text></Fragment>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
</Fragment>`);
    });

    test('should format nested xmlui elements', () => {
      const input = '<Fragment><Text testId="textShort" width="200px">Short</Text><Text testId="textLong" width="200px" maxLines="2">Long text content</Text></Fragment>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
  <Text testId="textLong" width="200px" maxLines="2">
    Long text content
  </Text>
</Fragment>`);
    });

    test('should preserve text content', () => {
      const input = '<Text>Though this long text does not fit into a single line, please do not break it!</Text>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Text>
  Though this long text does not fit into a single line, please do not break it!
</Text>`);
    });

    test('should format self-closing tags', () => {
      const input = '<Fragment><Input type="text"/><Button/></Fragment>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Input type="text" />
  <Button />
</Fragment>`);
    });
  });

  describe('CDATA Handling', () => {
    test('should preserve CDATA sections', () => {
      const input = '<Fragment><Text><![CDATA[Some <special> content & more]]></Text></Fragment>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Text>
    <![CDATA[Some <special> content & more]]>
  </Text>
</Fragment>`);
    });

    test('should format XML with multiple CDATA sections', () => {
      const input = '<Fragment><Text><![CDATA[First CDATA]]></Text><Text><![CDATA[Second CDATA with <tags>]]></Text></Fragment>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Text>
    <![CDATA[First CDATA]]>
  </Text>
  <Text>
    <![CDATA[Second CDATA with <tags>]]>
  </Text>
</Fragment>`);
    });

    test('should handle CDATA with special characters', () => {
      const input = '<Text><![CDATA[Content with & < > " \' characters]]></Text>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Text>
  <![CDATA[Content with & < > " ' characters]]>
</Text>`);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const result = formatFromString('');
      expect(result).toEqual("");
    });

    test('should handle whitespace-only string', () => {
      const result = formatFromString('   \n  \t  ', );
      expect(result).toEqual("");
    });

    test('should handle single self-closing tag', () => {
      const input = '<Input type="text"/>';
      const result = formatFromString(input);

      expect(result).toEqual(`<Input type="text" />`);
    });

    test('should handle XML with comments', () => {
      const input = '<Fragment><!-- This is a comment --><Text>Content</Text></Fragment><!-- This is a comment -->';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <!-- This is a comment -->
  <Text>
    Content
  </Text>
</Fragment>
<!-- This is a comment -->`);
    });

    test('should handle deeply nested elements', () => {
      const input = '<Fragment><Container><Section><Text>Deep content</Text></Section></Container></Fragment>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Container>
    <Section>
      <Text>
        Deep content
      </Text>
    </Section>
  </Container>
</Fragment>`);
    });

    test('should handle mixed content', () => {
      const input = '<Text>Before<Bold>bold</Bold>After</Text>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Text>
  Before
  <Bold>
    bold
  </Bold>
  After
</Text>`);
    });
  });

  describe('Real-world xmlui Examples', () => {
    test('should format typical xmlui component', () => {
      const input = `<Fragment>
        <Text testId="textShort" width="200px">Short</Text>
        <Text testId="textLong" width="200px" maxLines="2">
          Though this long text does not fit into a single line, please do not break it!
        </Text>
      </Fragment>`;

      const result = formatFromString(input);

      expect(result).toEqual(
`<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
  <Text testId="textLong" width="200px" maxLines="2">
    Though this long text does not fit into a single line, please do not break it!
  </Text>
</Fragment>`);
    });

    test('should format long attribute list in paired tag', () => {
      const input = '<Button testId="submitBtn" variant="primary" size="large" disabled="false" onClick="handleClick">Submit</Button>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Button
  testId="submitBtn"
  variant="primary"
  size="large"
  disabled="false"
  onClick="handleClick">
  Submit
</Button>`);
    });

    test('should format long attribute list in self-closing tag', () => {
      const input = '<Button testId="submitBtn" variant="primary" size="large" disabled="false" onClick="handleClick"/>';
      const result = formatFromString(input);

      expect(result).toEqual(
`<Button
  testId="submitBtn"
  variant="primary"
  size="large"
  disabled="false"
  onClick="handleClick" />`);
    });

    test('should format complex xmlui layout', () => {
      const input = '<Fragment><Header><Title>Page Title</Title></Header><Main><Section><Text>Content</Text><Button>Action</Button></Section></Main><Footer><Text>Footer content</Text></Footer></Fragment>';
      const result = formatFromString(input);

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
</Fragment>`);
    });
  });
});
