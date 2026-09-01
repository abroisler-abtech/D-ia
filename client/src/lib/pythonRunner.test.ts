import { describe, expect, it } from "vitest";
import { isPythonTimeout } from "./pythonRunner";

describe("pythonRunner", () => {
  it("identifica o erro de timeout do executor", () => {
    expect(isPythonTimeout(new Error("TIMEOUT"))).toBe(true);
    expect(isPythonTimeout(new Error("SyntaxError"))).toBe(false);
    expect(isPythonTimeout("TIMEOUT")).toBe(false);
  });
});
