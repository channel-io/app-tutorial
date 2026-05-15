import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as yaml from "js-yaml";
import { z } from "zod";

const appConfigSchema = z.object({
  appStore: z.object({
    url: z.string().url(),
  }),
  runtime: z.object({
    nodeEnv: z.enum(["development", "production", "test"]),
    debug: z.boolean().optional(),
  }),
});

type AppConfig = z.infer<typeof appConfigSchema>;

@Injectable()
export class AppConfigService {
  private readonly config: AppConfig;
  private readonly entry: string;

  constructor(private readonly configService: ConfigService) {
    this.entry = this.configService.get<string>("CH_ENTRY") ?? "development";
    this.config = this.loadConfig(this.entry);
  }

  private loadConfig(entry: string): AppConfig {
    const configPath = this.resolveConfigPath(entry);

    try {
      const fileContents = readFileSync(configPath, "utf8");
      return appConfigSchema.parse(yaml.load(fileContents));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load config file ${configPath}: ${message}`);
    }
  }

  private resolveConfigPath(entry: string): string {
    const candidates = [
      join(process.cwd(), "config", `${entry}.yml`),
      join(process.cwd(), "config", `${entry}.yaml`),
    ];

    const configPath = candidates.find((candidate) => existsSync(candidate));
    if (!configPath) {
      throw new Error(`Config file not found for CH_ENTRY=${entry}: ${candidates.join(", ")}`);
    }

    return configPath;
  }

  get appStoreUrl(): string {
    return this.config.appStore.url;
  }

  get nodeEnv(): string {
    return this.config.runtime.nodeEnv;
  }

  get debug(): boolean {
    return this.config.runtime.debug ?? this.nodeEnv !== "production";
  }
}
