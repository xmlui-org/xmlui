import { describe, test, expect } from 'vitest';
import { format } from '../../src/language-server/services/format';

describe('XML Formatter', () => {
  // Helper function to test idempotency
  function testIdempotency(input: string, options: { lineSeparator?: string; indentation?: string } = {}) {
    const defaultOptions = { lineSeparator: '\n', indentation: '  ', ...options };
    const firstFormat = format(input, defaultOptions);
    if (firstFormat === null) return null;

    const secondFormat = format(firstFormat, defaultOptions);
    expect(secondFormat).toBe(firstFormat);
    return firstFormat;
  }

  describe('Format Options', () => {
    test('should respect custom indentation', () => {
      const input = '<Fragment><Text>Content</Text></Fragment>';
      const result = testIdempotency(input, { indentation: '    ' });

      expect(result).toEqual(
`<Fragment>
    <Text>
        Content
    </Text>
</Fragment>`);
    });

    test('should respect tab indentation', () => {
      const input = '<Fragment><Text>Content</Text></Fragment>';
      const result = testIdempotency(input, { indentation: '\t' });

      expect(result).toEqual(
`<Fragment>
\t<Text>
\t\tContent
\t</Text>
</Fragment>`);
    });

    test('should respect custom line separator', () => {
      const input = '<Fragment><Text>Content</Text></Fragment>';
      const result = testIdempotency(input, { lineSeparator: '\r\n' });

      expect(result).toEqual(
`<Fragment>\r
  <Text>\r
    Content\r
  </Text>\r
</Fragment>`);
    });
  });

  describe('Basic XML Formatting', () => {
    test('should format simple xmlui fragment', () => {
      const input = '<Fragment><Text testId="textShort" width="200px">Short</Text></Fragment>';
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Fragment>
  <Text testId="textShort" width="200px">
    Short
  </Text>
</Fragment>`);
    });

    test('should format nested xmlui elements', () => {
      const input = '<Fragment><Text testId="textShort" width="200px">Short</Text><Text testId="textLong" width="200px" maxLines="2">Long text content</Text></Fragment>';
      const result = testIdempotency(input);

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
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Text>
  Though this long text does not fit into a single line, please do not break it!
</Text>`);
    });

    test('should format self-closing tags', () => {
      const input = '<Fragment><Input type="text"/><Button/></Fragment>';
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Fragment>
  <Input type="text"/>
  <Button/>
</Fragment>`);
    });
  });

  describe('CDATA Handling', () => {
    test('should preserve CDATA sections', () => {
      const input = '<Fragment><Text><![CDATA[Some <special> content & more]]></Text></Fragment>';
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Fragment>
  <Text>
    <![CDATA[Some <special> content & more]]>
  </Text>
</Fragment>`);
    });

    test('should format XML with multiple CDATA sections', () => {
      const input = '<Fragment><Text><![CDATA[First CDATA]]></Text><Text><![CDATA[Second CDATA with <tags>]]></Text></Fragment>';
      const result = testIdempotency(input);

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
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Text>
  <![CDATA[Content with & < > " ' characters]]>
</Text>`);
    });
  });

  describe('Ill-formed XML Handling', () => {
    test('should return null for malformed CDATA', () => {
      const input = '<Text><![CDATA[Unclosed CDATA</Text>';
      const result = format(input, { indentation: '  ', lineSeparator: '\n' });

      expect(result).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const result = format('', { indentation: '  ', lineSeparator: '\n' });
      expect(result).toBeNull();
    });

    test('should handle whitespace-only string', () => {
      const result = format('   \n  \t  ', { indentation: '  ', lineSeparator: '\n' });
      expect(result).toBeNull();
    });

    test('should handle single self-closing tag', () => {
      const input = '<Input type="text"/>';
      const result = testIdempotency(input);

      expect(result).toEqual(`<Input type="text"/>`);
    });

    test('should handle XML with comments', () => {
      const input = '<Fragment><!-- This is a comment --><Text>Content</Text></Fragment>';
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Fragment>
  <!-- This is a comment -->
  <Text>
    Content
  </Text>
</Fragment>`);
    });

    test('should handle XML with processing instructions', () => {
      const input = '<?xml version="1.0"?><Fragment><Text>Content</Text></Fragment>';
      const result = testIdempotency(input);

      expect(result).toEqual(
`<?xml version="1.0"?>
<Fragment>
  <Text>
    Content
  </Text>
</Fragment>`);
    });

    test('should handle deeply nested elements', () => {
      const input = '<Fragment><Container><Section><Text>Deep content</Text></Section></Container></Fragment>';
      const result = testIdempotency(input);

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
      const result = testIdempotency(input);

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

      const result = testIdempotency(input);

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

    test('should format xmlui with multiple attributes', () => {
      const input = '<Button testId="submitBtn" variant="primary" size="large" disabled="false" onClick="handleClick">Submit</Button>';
      const result = testIdempotency(input);

      expect(result).toEqual(
`<Button testId="submitBtn" variant="primary" size="large" disabled="false" onClick="handleClick">
  Submit
</Button>`);
    });

    test('should format complex xmlui layout', () => {
      const input = '<Fragment><Header><Title>Page Title</Title></Header><Main><Section><Text>Content</Text><Button>Action</Button></Section></Main><Footer><Text>Footer content</Text></Footer></Fragment>';
      const result = testIdempotency(input);

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
