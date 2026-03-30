---
"xmlui": patch
---

fix: quoted content in markup no longer has special meaning. `<Stack>"hi"</Stack>`no longer produces the unquoted string _hi_, but rather the quoted string as-is _"hi"_. This can technically break existing code which relied on quoting text that incluced the less-than (<) character. This feature was very hidden, we don't expect users to have markup like that. In case you are affected, use the _&lt;_ entity instead, or wrap the content in a CDATA.
