import ts from "typescript/lib/tsserverlibrary";
import { getTranslationInJsonFile } from "./translationKey";
import { parseJsonFile } from "./utils";
import path from "path";

describe("getTranslationInJsonFile", () => {
  const testJsonPath = path.join(__dirname, "..", "test.json");

  it("should find nested translation keys in real JSON file", () => {
    const parsedJson = parseJsonFile(ts, testJsonPath);
    expect(parsedJson).not.toBeNull();
    
    if (!parsedJson) return;

    const result = getTranslationInJsonFile(parsedJson, "admin.channel.sidebar.colors.themingBranding");
    
    expect(result).toEqual({
      start: expect.any(Number),
      length: expect.any(Number),
      translationText: '"Theming & Custom Branding"',
      proprtyNode: expect.any(Object)
    });
  });

  it("should return null for non-existent keys", () => {
    const parsedJson = parseJsonFile(ts, testJsonPath);
    if (!parsedJson) return;

    const result = getTranslationInJsonFile(parsedJson, "nonexistent.key");
    
    expect(result).toBeNull();
  });

  it("should handle file that doesn't exist", () => {
    const parsedJson = parseJsonFile(ts, "nonexistent-file.json");
    
    expect(parsedJson).toBeNull();
  });
});