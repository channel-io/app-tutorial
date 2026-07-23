package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/channel-io/app-sdk/go/native"
	sdkgin "github.com/channel-io/app-sdk/go/server/gin"
	"github.com/channel-io/app-tutorial/internal/tutorial"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	nativeClient := native.NewClient(native.WithBaseURL(cfg.AppStoreURL))
	tokenManager := native.NewTokenManager(native.TokenManagerConfig{
		AppID:       cfg.AppID,
		AppSecret:   cfg.AppSecret,
		AppStoreURL: cfg.AppStoreURL,
		Client:      nativeClient,
	})

	sdkApp, err := tutorial.NewApp(tutorial.Config{
		AppID:     cfg.AppID,
		AppSecret: cfg.AppSecret,
		BotName:   cfg.BotName,
	}, tutorial.NewNativeMessageSender(tokenManager, nativeClient))
	if err != nil {
		log.Fatal(err)
	}

	serverOptions := []sdkgin.Option{
		sdkgin.WithAutoRegister(
			sdkgin.WithAutoRegisterClient(nativeClient),
			sdkgin.WithAutoRegisterTokenManager(tokenManager),
			sdkgin.WithAutoRegisterResult(logAutoRegistration),
		),
	}
	if !cfg.SkipSignatureVerification {
		serverOptions = append(serverOptions, sdkgin.WithSignature(cfg.SigningKey))
	}

	server := sdkgin.NewServer(sdkApp, serverOptions...)
	mountAppStoreFunctionRoot(server)
	server.Engine().GET("/ping", func(ctx *gin.Context) { ctx.String(200, "pong") })

	wamDist, err := filepath.Abs("wam/dist")
	if err != nil {
		log.Fatal(err)
	}
	if _, err := os.Stat(wamDist); err == nil {
		server.Engine().Static("/resource/wam/tutorial", wamDist)
	} else {
		log.Printf("WAM build not found at %s; run make build-wam", wamDist)
	}

	addr := ":" + cfg.Port
	log.Printf("Function endpoint: http://localhost:%s/functions", cfg.Port)
	log.Printf("WAM endpoint: http://localhost:%s/resource/wam", cfg.Port)
	if err := server.Run(addr); err != nil {
		log.Fatal(err)
	}
}

func logAutoRegistration(results []native.AutoRegisterResult) {
	for _, result := range results {
		name := result.ExtensionName + ":" + result.SystemVersion
		if result.Success {
			log.Printf("Extension registration succeeded: %s", name)
			continue
		}
		log.Printf("Extension registration failed: %s; check credentials, permissions, and endpoint settings", name)
	}
}

type config struct {
	AppID                     string
	AppSecret                 string
	SigningKey                string
	AppStoreURL               string
	Port                      string
	BotName                   string
	SkipSignatureVerification bool
}

func loadConfig() (config, error) {
	cfg := config{
		AppID:                     strings.TrimSpace(os.Getenv("APP_ID")),
		AppSecret:                 strings.TrimSpace(os.Getenv("APP_SECRET")),
		SigningKey:                strings.TrimSpace(os.Getenv("SIGNING_KEY")),
		AppStoreURL:               valueOrDefault("APP_STORE_URL", "https://app-store.channel.io"),
		Port:                      valueOrDefault("PORT", "3022"),
		BotName:                   valueOrDefault("BOT_NAME", "AppTutorialBot"),
		SkipSignatureVerification: os.Getenv("SKIP_SIGNATURE_VERIFICATION") == "true",
	}
	if cfg.AppID == "" || cfg.AppSecret == "" {
		return config{}, fmt.Errorf("APP_ID and APP_SECRET are required; copy .env.example to .env")
	}
	if !cfg.SkipSignatureVerification && cfg.SigningKey == "" {
		return config{}, fmt.Errorf("SIGNING_KEY is required unless SKIP_SIGNATURE_VERIFICATION=true")
	}
	return cfg, nil
}

func valueOrDefault(name, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(name)); value != "" {
		return value
	}
	return fallback
}
