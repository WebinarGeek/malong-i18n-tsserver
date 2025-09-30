import ts, { server } from "typescript/lib/tsserverlibrary";
import { createParser } from "./treesitter";

export function parseJsonFile(
  ts: typeof import("typescript/lib/tsserverlibrary"),
  jsonPath: string,
) {
  const fileContents = ts.sys.readFile(jsonPath, "utf-8");
  if (!fileContents) {
    return null;
  }
  const parsedJson = ts.parseJsonText(jsonPath, fileContents);
  return parsedJson;
}

export function getResolvedJsonPaths(info: server.PluginCreateInfo) {
  const { jsonFilePaths } = info.config;
  if (!jsonFilePaths) {
    info.project.projectService.logger.info(
      "Missing jsonFilePaths in plugin config, skipping",
    );
    return null;
  }
  if (!Array.isArray(jsonFilePaths)) {
    info.project.projectService.logger.info(
      "jsonFilePaths must be an array in plugin config, skipping",
    );
    return null;
  }
  const { baseUrl } = info.project.getCompilerOptions();
  if (!baseUrl) {
    info.project.projectService.logger.info(
      "Missing baseUrl in tsConfig, skipping",
    );
    return null;
  }
  return jsonFilePaths.map((jsonFilePathConfig) => ({
    ...jsonFilePathConfig,
    path: `${baseUrl}/${jsonFilePathConfig.path}`,
  })) as {
    path: string;
    namespace: string;
  }[];
}

/**
 * Recursively searches for a node by property name.
 */
export function findNodeByKey(
  ts: typeof import("typescript/lib/tsserverlibrary"),
  node: ts.Node,
  key: string,
): ts.Node | undefined {
  let found: ts.Node | undefined;

  function visit(n: ts.Node) {
    // Look for a property assignment (e.g. "key": value)
    if (n.kind === ts.SyntaxKind.PropertyAssignment) {
      const propAssignment = n as ts.PropertyAssignment;
      const name = propAssignment.name;

      // The property name can be an identifier or a string literal.
      if (
        (ts.isIdentifier(name) && name.text === key) ||
        (ts.isStringLiteral(name) && name.text === key)
      ) {
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
export function findNodeByNestedKey(
  root: ts.Node,
  nestedKey: string,
): ts.Node | undefined {
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
function findJsonObjectInAST(node: ts.Node): ts.ObjectLiteralExpression | undefined {
  if (ts.isObjectLiteralExpression(node)) {
    return node;
  }
  
  // Search through all child nodes recursively
  let found: ts.ObjectLiteralExpression | undefined;
  
  function searchChildren(currentNode: ts.Node) {
    if (found) return;
    
    if (ts.isObjectLiteralExpression(currentNode)) {
      found = currentNode;
      return;
    }
    
    ts.forEachChild(currentNode, (child) => {
      searchChildren(child);
    });
  }
  
  searchChildren(node);
  
  return found;
}

/**
 * Searches for a nested key within a specific JSON object
 */
function searchForNestedKeyInObject(
  obj: ts.ObjectLiteralExpression,
  keys: string[],
): ts.Node | undefined {
  if (keys.length === 0) {
    return undefined;
  }
  
  const targetKey = keys[0];
  
  for (const property of obj.properties) {
    if (ts.isPropertyAssignment(property)) {
      let propertyName: string | undefined;
      
      if (ts.isIdentifier(property.name)) {
        propertyName = property.name.text;
      } else if (ts.isStringLiteral(property.name)) {
        propertyName = property.name.text;
      }
      
      if (propertyName === targetKey) {
        if (keys.length === 1) {
          return property;
        } else {
          if (ts.isObjectLiteralExpression(property.initializer)) {
            return searchForNestedKeyInObject(property.initializer, keys.slice(1));
          } else {
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
export function getTokenAtPosition(
  sourceFile: ts.SourceFile,
  pos: number,
): ts.Node {
  let candidate: ts.Node = sourceFile;

  // Continuously look for a child that encloses pos.
  while (true) {
    let foundChild: ts.Node | undefined;
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

export function getFileRootNode(
  info: server.PluginCreateInfo,
  fileName: string,
) {
  const program = info.languageService.getProgram();
  const sourceFile = program?.getSourceFile(fileName);
  if (!sourceFile) return null;
  const parser = createParser();
  try {
    const tree = parser.parse(sourceFile.getFullText());
    return tree.rootNode;
  } catch (e) {
    console.log("Could not parse file")
    return null;
  }
}
