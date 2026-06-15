"use strict";
const utils_1 = require("./utils");
const translationKey_1 = require("./translationKey");
function init(modules) {
    const ts = modules.typescript;
    function create(info) {
        // Diagnostic logging
        function log(message) {
            info.project.projectService.logger.info(message);
        }
        log("Loaded plugin: malong-i18n-tsserver");
        log("DEBUGGGING");
        // Set up decorator object
        const proxy = Object.create(null);
        for (let k of Object.keys(info.languageService)) {
            const x = info.languageService[k];
            // @ts-expect-error - JS runtime trickery which is tricky to type tersely
            proxy[k] = (...args) => x.apply(info.languageService, args);
        }
        const jsonPathConfig = (0, utils_1.getResolvedJsonPaths)(info);
        if (!jsonPathConfig) {
            return proxy;
        }
        log("Using JSON paths: " + jsonPathConfig.map((p) => p.path).join(", "));
        proxy.getDefinitionAndBoundSpan = (fileName, position) => {
            var _a;
            const prior = info.languageService.getDefinitionAndBoundSpan(fileName, position);
            const rootNode = (0, utils_1.getFileRootNode)(info, fileName);
            if (!rootNode)
                return prior;
            const translationKeyCapture = (0, translationKey_1.getTranslationKeyAtPosition)(rootNode, position);
            if (!translationKeyCapture)
                return prior;
            const { node: translationNode, text: translationKey } = translationKeyCapture;
            log("✅ Found translationKey: " + translationKey);
            const namespace = translationKey.split(".")[0];
            const jsonPath = (_a = jsonPathConfig.find((p) => p.namespace === namespace)) === null || _a === void 0 ? void 0 : _a.path;
            if (!jsonPath) {
                log("❌ Failed to find json path for namespace: " + namespace);
                return prior;
            }
            const parsedJson = (0, utils_1.parseJsonFile)(ts, jsonPath);
            if (!parsedJson) {
                log("❌ Failed to parse json file: " + jsonPath);
                return prior;
            }
            const translationFileCapture = (0, translationKey_1.getTranslationInJsonFile)(parsedJson, translationKey);
            if (!translationFileCapture) {
                log("❌ Failed to find translation in json file: " + jsonPath);
                return prior;
            }
            const { start, length, translationText } = translationFileCapture;
            log("✅ Found translation: " + translationText);
            return {
                textSpan: {
                    start: translationNode.startIndex,
                    length: translationNode.endIndex - translationNode.startIndex,
                },
                definitions: [
                    {
                        fileName: jsonPath,
                        textSpan: {
                            start,
                            length,
                        },
                        kind: ts.ScriptElementKind.memberVariableElement,
                        containerName: "json",
                        containerKind: ts.ScriptElementKind.memberVariableElement,
                        name: translationKey,
                    },
                ],
            };
        };
        proxy.getQuickInfoAtPosition = (fileName, position) => {
            var _a;
            const prior = info.languageService.getQuickInfoAtPosition(fileName, position);
            const rootNode = (0, utils_1.getFileRootNode)(info, fileName);
            if (!rootNode)
                return prior;
            const translationKeyCapture = (0, translationKey_1.getTranslationKeyAtPosition)(rootNode, position);
            if (!translationKeyCapture)
                return prior;
            const { text: translationKey } = translationKeyCapture;
            log("✅ Found translationKey: " + translationKey);
            const namespace = translationKey.split(".")[0];
            const jsonPath = (_a = jsonPathConfig.find((p) => p.namespace === namespace)) === null || _a === void 0 ? void 0 : _a.path;
            if (!jsonPath) {
                log("❌ Failed to find json path for namespace: " + namespace);
                return prior;
            }
            const parsedJson = (0, utils_1.parseJsonFile)(ts, jsonPath);
            if (!parsedJson) {
                log("❌ Failed to parse json file: " + jsonPath);
                return prior;
            }
            const translationFileCapture = (0, translationKey_1.getTranslationInJsonFile)(parsedJson, translationKey);
            if (!translationFileCapture) {
                log("❌ Failed to find translation in json file: " + jsonPath);
                return prior;
            }
            const { start, length, translationText } = translationFileCapture;
            log("✅ Found translation: " + translationText);
            return {
                kind: ts.ScriptElementKind.string,
                kindModifiers: "",
                textSpan: {
                    start,
                    length,
                },
                displayParts: [
                    {
                        text: translationText,
                        kind: "text",
                    },
                ],
            };
        };
        return proxy;
    }
    return { create };
}
module.exports = init;
//# sourceMappingURL=index.js.map