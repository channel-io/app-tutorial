import "reflect-metadata";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ChannelAppModule } from "@channel.io/app-sdk-server";
import { AppConfigModule } from "./config/app-config.module.js";
import { AppConfigService } from "./config/app-config.service.js";
import { GoogleCalendarConfigExtension } from "./extensions/config.extension.js";
import { GoogleOAuthExtension } from "./extensions/oauth.extension.js";
import { CalendarFunctions } from "./functions/calendar.functions.js";
import { HealthController } from "./health.controller.js";
import { GoogleCalendarService } from "./services/google-calendar.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"] }),
    AppConfigModule,
    ChannelAppModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService, AppConfigService],
      useFactory: (config: ConfigService, appConfig: AppConfigService) => {
        const appId = config.get<string>("APP_ID");
        const appSecret = config.get<string>("APP_SECRET");
        if (!appId || !appSecret) {
          throw new Error(
            "APP_ID, APP_SECRET 환경변수는 필수입니다. .env 또는 배포 환경 설정을 확인하세요.",
          );
        }

        return {
          appId,
          appSecret,
          autoRegister: true,
          appStoreUrl: appConfig.appStoreUrl,
          debug: appConfig.debug,
        };
      },
    }),
  ],
  controllers: [HealthController],
  providers: [
    GoogleCalendarService,
    GoogleCalendarConfigExtension,
    GoogleOAuthExtension,
    CalendarFunctions,
  ],
})
export class AppModule {}
