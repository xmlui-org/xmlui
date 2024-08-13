import {collectCodeBehindFromSource} from "./scripting/code-behind-collect.js";
import {moduleFileExtension, componentFileExtension, codeBehindFileExtension} from "./ueml/fileExtensions.js";
import {Parser} from "./scripting/Parser.js";
import {removeCodeBehindTokensFromTree} from "./scripting/code-behind-collect.js";
import {parseXmlUiMarkup} from "./xmlui-parser/index.js";

export {
    collectCodeBehindFromSource,
    moduleFileExtension,
    componentFileExtension,
    codeBehindFileExtension,
    Parser,
    removeCodeBehindTokensFromTree,
    parseXmlUiMarkup
}
