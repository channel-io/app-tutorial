import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = Number.parseInt(process.env["PORT"] ?? "3000", 10);
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error("bootstrap failed:", error);
  process.exit(1);
});
