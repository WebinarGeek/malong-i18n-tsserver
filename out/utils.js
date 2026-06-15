"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonFile = parseJsonFile;
exports.getResolvedJsonPaths = getResolvedJsonPaths;
exports.findNodeByKey = findNodeByKey;
exports.findNodeByNestedKey = findNodeByNestedKey;
exports.getTokenAtPosition = getTokenAtPosition;
exports.getFileRootNode = getFileRootNode;
const tsserverlibrary_1 = __importDefault(require("typescript/lib/tsserverlibrary"));
const treesitter_1 = require("./treesitter");
function parseJsonFile(ts, jsonPath) {
    const fileContents = ts.sys.readFile(jsonPath, "utf-8");
    if (!fileContents) {
        return null;
    }
    const parsedJson = ts.parseJsonText(jsonPath, fileContents);
    return parsedJson;
}
function getResolvedJsonPaths(info) {
    const { jsonFilePaths } = info.config;
    if (!jsonFilePaths) {
        info.project.projectService.logger.info("Missing jsonFilePaths in plugin config, skipping");
        return null;
    }
    if (!Array.isArray(jsonFilePaths)) {
        info.project.projectService.logger.info("jsonFilePaths must be an array in plugin config, skipping");
        return null;
    }
    // `baseUrl` is the root that jsonFilePaths are resolved against. When it is
    // not set explicitly (e.g. with `moduleResolution: bundler`), fall back to
    // the project's config directory, which is what TS itself uses as the
    // implicit base for relative paths.
    const { baseUrl } = info.project.getCompilerOptions();
    const base = baseUrl !== null && baseUrl !== void 0 ? baseUrl : info.project.getCurrentDirectory();
    if (!base) {
        info.project.projectService.logger.info("Could not determine a base directory for jsonFilePaths, skipping");
        return null;
    }
    return jsonFilePaths.map((jsonFilePathConfig) => (Object.assign(Object.assign({}, jsonFilePathConfig), { path: `${base}/${jsonFilePathConfig.path}` })));
}
/**
 * Recursively searches for a node by property name.
 */
function findNodeByKey(ts, node, key) {
    let found;
    function visit(n) {
        // Look for a property assignment (e.g. "key": value)
        if (n.kind === ts.SyntaxKind.PropertyAssignment) {
            const propAssignment = n;
            const name = propAssignment.name;
            // The property name can be an identifier or a string literal.
            if ((ts.isIdentifier(name) && name.text === key) ||
                (ts.isStringLiteral(name) && name.text === key)) {
                found = n;
                return;
            }
        }
        ts.forEachChild(n, visit);
    }
    visit(node);
    return found;
}
/**
 * Finds a JSON node for a nested key specified in dot notation.
 *
 * @param root - The root node of the JSON AST.
 * @param nestedKey - A dot‑separated string representing the nested key.
 * @returns The PropertyAssignment node for the final key, or undefined if not found.
 */
function findNodeByNestedKey(root, nestedKey) {
    const keys = nestedKey.split(".");
    // For JSON files, we need to find the actual JSON object first
    const jsonObject = findJsonObjectInAST(root);
    if (!jsonObject) {
        return undefined;
    }
    return searchForNestedKeyInObject(jsonObject, keys);
}
/**
 * Finds the actual JSON object literal in the AST
 */
function findJsonObjectInAST(node) {
    if (tsserverlibrary_1.default.isObjectLiteralExpression(node)) {
        return node;
    }
    // Search through all child nodes recursively
    let found;
    function searchChildren(currentNode) {
        if (found)
            return;
        if (tsserverlibrary_1.default.isObjectLiteralExpression(currentNode)) {
            found = currentNode;
            return;
        }
        tsserverlibrary_1.default.forEachChild(currentNode, (child) => {
            searchChildren(child);
        });
    }
    searchChildren(node);
    return found;
}
/**
 * Searches for a nested key within a specific JSON object
 */
function searchForNestedKeyInObject(obj, keys) {
    if (keys.length === 0) {
        return undefined;
    }
    const targetKey = keys[0];
    for (const property of obj.properties) {
        if (tsserverlibrary_1.default.isPropertyAssignment(property)) {
            let propertyName;
            if (tsserverlibrary_1.default.isIdentifier(property.name)) {
                propertyName = property.name.text;
            }
            else if (tsserverlibrary_1.default.isStringLiteral(property.name)) {
                propertyName = property.name.text;
            }
            if (propertyName === targetKey) {
                if (keys.length === 1) {
                    return property;
                }
                else {
                    if (tsserverlibrary_1.default.isObjectLiteralExpression(property.initializer)) {
                        return searchForNestedKeyInObject(property.initializer, keys.slice(1));
                    }
                    else {
                        return undefined;
                    }
                }
            }
        }
    }
    return undefined;
}
/**
 * Recursively finds the smallest AST node that contains the given position.
 *
 * @param sourceFile - The source file AST.
 * @param pos - The character offset position.
 * @returns The deepest node at the given position.
 */
function getTokenAtPosition(sourceFile, pos) {
    let candidate = sourceFile;
    // Continuously look for a child that encloses pos.
    while (true) {
        let foundChild;
        candidate.forEachChild((child) => {
            // Use child.pos (ignores leading trivia) and child.end.
            if (child.pos <= pos && pos < child.end) {
                foundChild = child;
            }
        });
        if (!foundChild) {
            break;
        }
        candidate = foundChild;
    }
    return candidate;
}
function getFileRootNode(info, fileName) {
    const program = info.languageService.getProgram();
    const sourceFile = program === null || program === void 0 ? void 0 : program.getSourceFile(fileName);
    if (!sourceFile)
        return null;
    const parser = (0, treesitter_1.createParser)();
    try {
        const tree = parser.parse(sourceFile.getFullText());
        return tree.rootNode;
    }
    catch (e) {
        console.log("Could not parse file");
        return null;
    }
}
//# sourceMappingURL=utils.js.map