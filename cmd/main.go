package main

import (
	"context"
	"log"

	"github.com/channel-io/app-tutorial/api/public"
	"github.com/channel-io/app-tutorial/internal"

	"github.com/channel-io/app-tutorial/internal/appstore/svc"
	"github.com/channel-io/app-tutorial/internal/config"
	"github.com/channel-io/app-tutorial/internal/http"

	"go.uber.org/fx"
)

const appName = "app-tutorial"

// @title GO HTTP server
func main() {
	fx.New(
		public.HTTPServerModule(),
		internalModule(),
		fx.Invoke(registerCommands),
		fx.Invoke(printLog),
		fx.Invoke(
			fx.Annotate(
				func(_ []*http.Server) error {
					return nil
				},
				fx.ParamTags(`group:"http.servers"`),
			),
		),
	).Run()
}

func internalModule() fx.Option {
	return fx.Module(
		"internal",
		internal.Option,
	)
}

func registerCommands(appStoreSvc svc.AppStoreSVC) {
	_, err := appStoreSvc.RegisterCommands(context.Background())
	if err != nil {
		panic(err)
	}
}

func printLog(
	e *config.Config,
) {
	log.Default().Printf("Running application name=%s stage=%s version=%s", appName, e.Stage, e.Meta.Version)
}
