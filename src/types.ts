export interface EngineConfig {
  articleCount: number;
  codexCommand: string;
  dryRun: boolean;
  mcpName: string;
  periodLabel: string;
  regions: string[];
}

export interface CommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

