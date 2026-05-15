import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get(["ping", "health"])
  getHealth() {
    return { ok: true };
  }
}
