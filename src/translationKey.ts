import Parser from "tree-sitter";
import { translationQuery } from "./queries";
import { findCaptureMatch } from "./treesitter";
import { findNodeByNestedKey } from "./utils";
import ts from "typescript/lib/tsserverlibrary";

export function getTranslationKeyAtPosition(
  rootNode: Parser.SyntaxNode,
  position: number,
) {
  const translationKeyCapture = findCaptureMatch(
    rootNode,
    position,
    translationQuery,
    "translationKey",
    "translationKey.name",
  );
  return translationKeyCapture;
}

export function getTranslationInJsonFile(
  parsedJson: ts.JsonSourceFile,
  translationKey: string,
) {
  const jsonTranslationNode = findNodeByNestedKey(parsedJson, translationKey);
  if (!jsonTranslationNode) return null;

  const jsonTranslationTextNode = jsonTranslationNode.getChildren(parsedJson)[2];
  const start = jsonTranslationTextNode.getStart(parsedJson);
  const length = jsonTranslationTextNode.getEnd() - start;
  const translationText = jsonTranslationTextNode.getText(parsedJson)

  return {
    start,
    length,
    translationText,
    proprtyNode: jsonTranslationNode,
  }
}
