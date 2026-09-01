import { describe, expect, it } from "vitest";

describe("título da aplicação", () => {
  it("usa o nome oficial Déia", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Déia");
  });
});
