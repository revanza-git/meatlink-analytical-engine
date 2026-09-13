import { describe, expect, it } from "vitest";

import { parseConfig } from "../src/config.js";

describe("parseConfig", () => {
  it("defaults to preview mode and two provinces", () => {
    const config = parseConfig([], {});
    expect(config.dryRun).toBe(true);
    expect(config.regions).toEqual(["Jawa Timur", "Sulawesi Selatan"]);
    expect(config.articleCount).toBe(2);
  });

  it("enables writes only with an explicit flag", () => {
    const config = parseConfig(
      ["--write", "--regions=DKI Jakarta,Jawa Barat", "--count=2"],
      {},
    );
    expect(config.dryRun).toBe(false);
    expect(config.regions).toEqual(["DKI Jakarta", "Jawa Barat"]);
    expect(config.codexCommand).toBe("codex");
  });

  it("rejects a count larger than the region list", () => {
    expect(() =>
      parseConfig(["--regions=Bali", "--count=2"], {}),
    ).toThrow(/cannot exceed/);
  });
});
