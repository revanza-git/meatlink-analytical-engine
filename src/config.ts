import process from "node:process";

import type { EngineConfig } from "./types.js";

const DEFAULT_REGIONS = ["Jawa Timur", "Sulawesi Selatan"];

function valueFor(args: string[], name: string): string | undefined {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 10) {
    throw new Error("--count must be an integer between 1 and 10");
  }
  return parsed;
}

export function parseConfig(
  args = process.argv.slice(2),
  env = process.env,
): EngineConfig {
  if (args.includes("--write") && args.includes("--dry-run")) {
    throw new Error("Use either --write or --dry-run, not both");
  }

  const regionValue = valueFor(args, "--regions") ?? env.MEATLINK_REGIONS;
  const regions = (regionValue ? regionValue.split(",") : DEFAULT_REGIONS)
    .map((region) => region.trim())
    .filter(Boolean);

  if (regions.length === 0) throw new Error("At least one region is required");

  const count = positiveInteger(
    valueFor(args, "--count") ?? env.MEATLINK_ARTICLE_COUNT,
    Math.min(2, regions.length),
  );

  if (count > regions.length) {
    throw new Error("--count cannot exceed the number of supplied regions");
  }

  return {
    articleCount: count,
    codexCommand: env.CODEX_CLI_PATH ?? "codex",
    dryRun: !args.includes("--write"),
    mcpName: env.MEATLINK_MCP_NAME ?? "meatlink",
    periodLabel:
      valueFor(args, "--period") ??
      new Intl.DateTimeFormat("en", {
        month: "long",
        timeZone: "Asia/Jakarta",
        year: "numeric",
      }).format(new Date()),
    regions: regions.slice(0, count),
  };
}
