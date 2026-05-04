# Flaky test

The following E2E tests are often flaky (~8 out of 10):

- xmlui/src/components/Accordion/Accordion.spec.ts:92:1 › applies border-side and combinat
ion theme variables
- xmlui/src/components/Accordion/Accordion.spec.ts:28:1 › component renders custom header wi
th headerTemplate prop
- xmlui/src/components/AutoComplete/AutoComplete.spec.ts:1235:3 › Validation Feedback › sh
ows valid icon in concise mode when valid
- xmlui/src/components/DataSource/DataSource.spec.ts:146:3 › Basic Functionality › shows 
unknown error notification 
- xmlui/src/components-core/behaviors/FormBindingBehavior.spec.ts:828:3 › Validation › 'requ
ired' validation shows error when isDirty and losing focus
- xmlui/src/components/IncludeMarkup/IncludeMarkup.spec.ts:118:3 › Basic Functionality ›
 fires didFail on non-2xx HTTP status
- xmlui/src/components/IncludeMarkup/IncludeMarkup.spec.ts:145:3 › Basic Functional
ity › re-fetches when url prop changes
- xmlui/src/components/MessageListener/MessageListener.spec.ts:126:3 › Basic Functi
onality › doesn't disrupt HStack layout gaps
- xmlui/src/components/RadioGroup/RadioGroup.spec.ts:1003:3 › Keyboard Navigation › seque
ntial ArrowDown visits all options in order
- xmlui/src/components/Table/Table.spec.ts:4195:3 › Column width theme variables › column 
width theme variable with rem value resolves to correct pixel size
- xmlui/src/components/RadioGroup/RadioGroup.spec.ts:1003:3 › Keyboard Navigation › sequential ArrowDown visits all options in order
- xmlui/tests-e2e/datasource-responseHeaders.spec.ts:29:1 › DataSource responseHeaders inclu
des content-type from server
- xmlui/tests-e2e/markup.spec.ts:15:3 › A complex JSON object › filling station name and sub
mitting shows it in the output @website
