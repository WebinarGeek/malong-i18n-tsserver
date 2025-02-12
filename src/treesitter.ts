import Parser from "tree-sitter";
import TypeScript from "tree-sitter-typescript";

export function createParser() {
  const parser = new Parser();
  parser.setLanguage(TypeScript.tsx);
  return parser;
}

interface Capture {
  text: string;
  node: Parser.SyntaxNode;
}

export function findCaptureMatch(
  rootNode: Parser.SyntaxNode,
  position: number,
  queryString: string,
  captureName: string,
  captureText: string,
): Capture | null {
  const parser = createParser();
  const queryMatches = new Parser.Query(parser.getLanguage(), queryString);
  const matches = queryMatches.matches(rootNode);

  for (const match of matches) {
    const captureNode = match.captures.find(
      (capture) => capture.name === captureName,
    )?.node;

    if (
      !captureNode ||
      position < captureNode.startIndex ||
      captureNode.endIndex < position
    )
      continue;

    const capturedText = match.captures.find(
      (capture) => capture.name === captureText,
    )?.node.text;

    return {
      node: captureNode,
      text: capturedText ?? "",
    };
  }
  return null;
}
