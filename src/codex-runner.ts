import { execFile, spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import type { CommandResult, EngineConfig } from "./types.js";

const execFileAsync = promisify(execFile);
const EXPECTED_MCP_URL = "https://meatlink.id/mcp";

export function hasOAuthRefreshFailure(output: string, mcpName: string): boolean {
  const normalized = output.toLowerCase();
  return (
    normalized.includes("failed to refresh oauth tokens") &&
    normalized.includes(mcpName.toLowerCase())
  );
}

async function runCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<CommandResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    child.on("error", reject);
    child.on("close", (code) =>
      resolve({ exitCode: code ?? 1, stderr, stdout }),
    );
  });
}

export async function assertMeatlinkMcp(config: EngineConfig): Promise<void> {
  let detail: string;
  let listing: string;
  try {
    ({ stdout: detail } = await execFileAsync(config.codexCommand, [
      "mcp",
      "get",
      config.mcpName,
    ]));
    ({ stdout: listing } = await execFileAsync(config.codexCommand, ["mcp", "list"]));
  } catch {
    throw new Error(
      `Codex MCP '${config.mcpName}' is unavailable. Run: codex mcp add ${config.mcpName} --url ${EXPECTED_MCP_URL}`,
    );
  }

  if (!detail.includes(EXPECTED_MCP_URL)) {
    throw new Error(
      `MCP '${config.mcpName}' must use ${EXPECTED_MCP_URL} exactly (without www).`,
    );
  }
  const mcpLine = listing
    .split(/\r?\n/)
    .find((line) => line.trimStart().startsWith(config.mcpName));
  if (!mcpLine?.includes("OAuth")) {
    throw new Error(
      `MCP '${config.mcpName}' is not OAuth-authenticated. Run: codex mcp login ${config.mcpName}`,
    );
  }
}

export async function runAnalyticalAgent(
  config: EngineConfig,
  prompt: string,
  cwd: string,
): Promise<string> {
  const runDirectory = await mkdtemp(join(tmpdir(), "meatlink-agent-"));
  const finalOutputPath = join(runDirectory, "final.txt");

  try {
    const args = ["exec", "--ephemeral", "--output-last-message", finalOutputPath];
    if (!config.dryRun) args.push("--approve-for-me");
    else args.push("--sandbox", "read-only");
    args.push(prompt);

    const result = await runCommand(config.codexCommand, args, cwd);
    if (hasOAuthRefreshFailure(`${result.stdout}\n${result.stderr}`, config.mcpName)) {
      throw new Error(
        `MCP '${config.mcpName}' OAuth refresh failed. Reconnect with: codex mcp login ${config.mcpName}`,
      );
    }
    if (result.exitCode !== 0) {
      throw new Error(
        `Codex analytical run failed with exit code ${result.exitCode}. ${result.stderr.trim()}`,
      );
    }

    return await readFile(finalOutputPath, "utf8");
  } finally {
    await rm(runDirectory, { force: true, recursive: true });
  }
}
