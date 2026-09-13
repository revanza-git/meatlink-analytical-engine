import { describe, expect, it } from "vitest";

import { hasOAuthRefreshFailure } from "../src/codex-runner.js";
import { buildPrompt } from "../src/prompt.js";
import type { EngineConfig } from "../src/types.js";

function config(dryRun: boolean): EngineConfig {
  return {
    articleCount: 2,
    codexCommand: "codex",
    dryRun,
    mcpName: "meatlink",
    periodLabel: "September 2026",
    regions: ["Jawa Timur", "Sulawesi Selatan"],
  };
}

describe("buildPrompt", () => {
  it("contains non-negotiable privacy and draft-only controls", () => {
    const prompt = buildPrompt(config(false));
    expect(prompt).toContain("Never access, infer, quote, or disclose Meatlink inventory");
    expect(prompt).toContain("Never publish an insight");
    expect(prompt).toContain("Never fabricate a live price");
    expect(prompt).toContain("Create exactly 2 new drafts");
  });

  it("prevents all mutation tools in preview mode", () => {
    const prompt = buildPrompt(config(true));
    expect(prompt).toContain("PREVIEW MODE");
    expect(prompt).toContain("Do not call record_public_market_observation");
    expect(prompt).toContain("proposed create_market_insight payloads");
  });
});

describe("hasOAuthRefreshFailure", () => {
  it("recognizes the Codex MCP refresh failure", () => {
    expect(
      hasOAuthRefreshFailure(
        "ERROR failed to refresh OAuth tokens for server meatlink",
        "meatlink",
      ),
    ).toBe(true);
  });

  it("does not confuse another MCP server with Meatlink", () => {
    expect(
      hasOAuthRefreshFailure(
        "ERROR failed to refresh OAuth tokens for server another-service",
        "meatlink",
      ),
    ).toBe(false);
  });
});
