import { LanguageService, server } from "typescript/lib/tsserverlibrary";
import { getFileRootNode, getResolvedJsonPaths, parseJsonFile } from "./utils";
import {
  getTranslationInJsonFile,
  getTranslationKeyAtPosition,
} from "./translationKey";

function init(modules: {
  typescript: typeof import("typescript/lib/tsserverlibrary");
}) {
  const ts = modules.typescript;
  function create(info: server.PluginCreateInfo) {
    // Diagnostic logging
    function log(message: string) {
      info.project.projectService.logger.info(message);
    }
    log("Loaded plugin: malong-i18n-tsserver");

    // Set up decorator object
    const proxy: LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<
      keyof LanguageService
    >) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    const jsonPathConfig = getResolvedJsonPaths(info);
    if (!jsonPathConfig) {
      return proxy;
    }
    log("Using JSON paths: " + jsonPathConfig.map((p) => p.path).join(", "));

    proxy.getDefinitionAndBoundSpan = (fileName, position) => {
      const prior = info.languageService.getDefinitionAndBoundSpan(
        fileName,
        position,
      );

      const rootNode = getFileRootNode(info, fileName);
      if (!rootNode) return prior;

      const translationKeyCapture = getTranslationKeyAtPosition(
        rootNode,
        position,
      );
      if (!translationKeyCapture) return prior;
      const { node: translationNode, text: translationKey } =
        translationKeyCapture;
      log("✅ Found translationKey: " + translationKey);

      const namespace = translationKey.split(".")[0];
      const jsonPath = jsonPathConfig.find(
        (p) => p.namespace === namespace,
      )?.path;
      if (!jsonPath) {
        log("❌ Failed to find json path for namespace: " + namespace);
        return prior;
      }

      const parsedJson = parseJsonFile(ts, jsonPath);
      if (!parsedJson) {
        log("❌ Failed to parse json file: " + jsonPath);
        return prior;
      }

      const translationFileCapture = getTranslationInJsonFile(
        parsedJson,
        translationKey,
      );
      if (!translationFileCapture) return prior;
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
      const prior = info.languageService.getQuickInfoAtPosition(
        fileName,
        position,
      );

      const rootNode = getFileRootNode(info, fileName);
      if (!rootNode) return prior;

      const translationKeyCapture = getTranslationKeyAtPosition(
        rootNode,
        position,
      );
      if (!translationKeyCapture) return prior;
      const { text: translationKey } = translationKeyCapture;
      log("✅ Found translationKey: " + translationKey);

      const namespace = translationKey.split(".")[0];
      const jsonPath = jsonPathConfig.find(
        (p) => p.namespace === namespace,
      )?.path;
      if (!jsonPath) {
        log("❌ Failed to find json path for namespace: " + namespace);
        return prior;
      }

      const parsedJson = parseJsonFile(ts, jsonPath);
      if (!parsedJson) {
        log("❌ Failed to parse json file: " + jsonPath);
        return prior;
      }

      const translationFileCapture = getTranslationInJsonFile(
        parsedJson,
        translationKey,
      );
      if (!translationFileCapture) return prior;
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

export = init;
