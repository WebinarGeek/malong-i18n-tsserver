"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParser = createParser;
exports.findCaptureMatch = findCaptureMatch;
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_typescript_1 = __importDefault(require("tree-sitter-typescript"));
function createParser() {
    const parser = new tree_sitter_1.default();
    parser.setLanguage(tree_sitter_typescript_1.default.tsx);
    return parser;
}
function findCaptureMatch(rootNode, position, queryString, captureName, captureText) {
    var _a, _b;
    const parser = createParser();
    const queryMatches = new tree_sitter_1.default.Query(parser.getLanguage(), queryString);
    const matches = queryMatches.matches(rootNode);
    for (const match of matches) {
        const captureNode = (_a = match.captures.find((capture) => capture.name === captureName)) === null || _a === void 0 ? void 0 : _a.node;
        if (!captureNode ||
            position < captureNode.startIndex ||
            captureNode.endIndex < position)
            continue;
        const capturedText = (_b = match.captures.find((capture) => capture.name === captureText)) === null || _b === void 0 ? void 0 : _b.node.text;
        return {
            node: captureNode,
            text: capturedText !== null && capturedText !== void 0 ? capturedText : "",
        };
    }
    return null;
}
//# sourceMappingURL=treesitter.js.map