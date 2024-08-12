# Change Log

All notable changes to the "xmlui-lang" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.1]

- Initial release

## [0.0.6] - 2024-01-14

### Added

Support for unicode and the following escape characters:

- \b: Backspace
- \f: Form Feed
- \n: New Line
- \r: Carriage Return
- \t: Horizontal Tabulator
- \v: Vertical Tabulator
- \S: Non-breaking Space
- \\: Backslash
- \': Single quote
- \": Double quote
- \xhh: Hexadecimal character (here, hh represents two hexadecimal digits).
- \uhhhh: Unicode code point between U+0000 and U+FFFF (here hhhh represents four hexadecimal digits).
- \u{hHHHHH}: Unicode code point between U+0000 and U+10FFFF (here hHHHHH represents one to six hexadecimal digits).

## [0.0.7] - 2024-01-17

### Added

Support for .xmlui files.
