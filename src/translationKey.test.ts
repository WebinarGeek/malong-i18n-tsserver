import ts from "typescript/lib/tsserverlibrary";
import { getTranslationInJsonFile } from "./translationKey";
import { parseJsonFile } from "./utils";
import path from "path";

describe("getTranslationInJsonFile", () => {
  function parseJson(jsonContent: string): ts.JsonSourceFile {
    return ts.parseJsonText("test.json", jsonContent);
  }

  describe("nested keys", () => {
    const testJson = `{
      "auth": {
        "login": {
          "title": "Sign In",
          "button": "Login Now"
        },
        "errors": {
          "invalid": "Invalid credentials"
        }
      },
      "dashboard": {
        "welcome": "Welcome back!"
      }
    }`;

    it("should find deeply nested translation keys", () => {
      const parsedJson = parseJson(testJson);
      
      const result = getTranslationInJsonFile(parsedJson, "auth.login.title");
      
      expect(result).toEqual({
        start: expect.any(Number),
        length: expect.any(Number), 
        translationText: '"Sign In"',
        proprtyNode: expect.any(Object)
      });
    });

    it("should find mid-level nested keys", () => {
      const parsedJson = parseJson(testJson);
      
      const result = getTranslationInJsonFile(parsedJson, "auth.errors.invalid");
      
      expect(result?.translationText).toBe('"Invalid credentials"');
    });

    it("should find top-level nested keys", () => {
      const parsedJson = parseJson(testJson);
      
      const result = getTranslationInJsonFile(parsedJson, "dashboard.welcome");
      
      expect(result?.translationText).toBe('"Welcome back!"');
    });

    it("should return null for non-existent nested keys", () => {
      const parsedJson = parseJson(testJson);
      
      const result = getTranslationInJsonFile(parsedJson, "auth.login.nonexistent");
      
      expect(result).toBeNull();
    });

    it("should return null for partially matching keys", () => {
      const parsedJson = parseJson(testJson);
      
      const result = getTranslationInJsonFile(parsedJson, "auth.nonexistent.title");
      
      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle empty JSON", () => {
      const parsedJson = parseJson("{}");
      
      const result = getTranslationInJsonFile(parsedJson, "any.key");
      
      expect(result).toBeNull();
    });

    it("should handle malformed keys", () => {
      const parsedJson = parseJson('{"key": "value"}');
      
      const result = getTranslationInJsonFile(parsedJson, "");
      
      expect(result).toBeNull();
    });

    it("should handle single-level keys", () => {
      const parsedJson = parseJson('{"simple": "value"}');
      
      const result = getTranslationInJsonFile(parsedJson, "simple");
      
      expect(result?.translationText).toBe('"value"');
    });
  });

  describe("with real JSON file using parseJsonFile", () => {
    const testJsonPath = path.join(__dirname, "..", "test-translations.json");

    it("should parse real JSON file and find nested keys", () => {
      const parsedJson = parseJsonFile(ts, testJsonPath);
      expect(parsedJson).not.toBeNull();
      
      if (!parsedJson) return;

      const result = getTranslationInJsonFile(parsedJson, "auth.login.title");
      
      expect(result).toEqual({
        start: expect.any(Number),
        length: expect.any(Number),
        translationText: '"Sign In to Your Account"',
        proprtyNode: expect.any(Object)
      });
    });

    it("should find deep nested keys in real file", () => {
      const parsedJson = parseJsonFile(ts, testJsonPath);
      if (!parsedJson) return;

      const result = getTranslationInJsonFile(parsedJson, "dashboard.stats.users");
      
      expect(result?.translationText).toBe('"Total Users"');
    });

    it("should find keys with interpolation", () => {
      const parsedJson = parseJsonFile(ts, testJsonPath);
      if (!parsedJson) return;

      const result = getTranslationInJsonFile(parsedJson, "dashboard.welcome");
      
      expect(result?.translationText).toBe('"Welcome back, {{name}}!"');
    });

    it("should return null for non-existent keys in real file", () => {
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
});