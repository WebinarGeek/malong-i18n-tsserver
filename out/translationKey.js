"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranslationKeyAtPosition = getTranslationKeyAtPosition;
exports.getTranslationInJsonFile = getTranslationInJsonFile;
const queries_1 = require("./queries");
const treesitter_1 = require("./treesitter");
const utils_1 = require("./utils");
function getTranslationKeyAtPosition(rootNode, position) {
    const translationKeyCapture = (0, treesitter_1.findCaptureMatch)(rootNode, position, queries_1.translationQuery, "translationKey", "translationKey.name");
    return translationKeyCapture;
}
function getTranslationInJsonFile(parsedJson, translationKey) {
    const jsonTranslationNode = (0, utils_1.findNodeByNestedKey)(parsedJson, translationKey);
    if (!jsonTranslationNode)
        return null;
    const jsonTranslationTextNode = jsonTranslationNode.getChildren(parsedJson)[2];
    const start = jsonTranslationTextNode.getStart(parsedJson);
    const length = jsonTranslationTextNode.getEnd() - start;
    const translationText = jsonTranslationTextNode.getText(parsedJson);
    return {
        start,
        length,
        translationText,
        proprtyNode: jsonTranslationNode,
    };
}
//# sourceMappingURL=translationKey.js.map