#!/usr/bin/env node
import process from "node:process";

import { assertMeatlinkMcp, runAnalyticalAgent } from "./codex-runner.js";
import { parseConfig } from "./config.js";
import { buildPrompt } from "./prompt.js";

async function main(): Promise<void> {
  const config = parseConfig();
  await assertMeatlinkMcp(config);

  const mode = config.dryRun ? "preview" : "draft-write";
  console.log(
    `Starting Meatlink analytical agent (${mode}) for ${config.regions.join(", ")}...`,
  );

  const finalMessage = await runAnalyticalAgent(config, buildPrompt(config), process.cwd());
  console.log("\nFinal agent result:\n");
  console.log(finalMessage.trim());
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Meatlink analytical engine failed: ${message}`);
  process.exitCode = 1;
});

