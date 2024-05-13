package public

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/channel-io/app-tutorial/api/public/routefx"
	"github.com/channel-io/app-tutorial/internal/config"
	libhttp "github.com/channel-io/app-tutorial/internal/http"

	"go.uber.org/fx"
)

type ServerParams struct {
	fx.In

	Config libhttp.ServerConfig `name:"public.http.config"`
	Routes []libhttp.Routes     `group:"public.http.routes"`
}

type ServerResults struct {
	fx.Out

	Server *libhttp.Server `group:"http.servers"`
}

func NewServer(lifeCycle fx.Lifecycle, p ServerParams) (ServerResults, error) {
	server, err := libhttp.NewServer(p.Config, p.Routes)

	lifeCycle.Append(fx.Hook{
		OnStart: func(_ context.Context) error {
			go func(server *libhttp.Server) {
				log.Println("starting server ...")
				if err := server.Run(); err != nil && !errors.Is(err, http.ErrServerClosed) {
					panic(err)
				}
			}(server)
			return nil
		},
		OnStop: func(_ context.Context) error {
			log.Println("stopping server ...")
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			if err := server.Shutdown(ctx); err != nil {
				log.Fatal("Server Shutdown:", err)
				return err
			}
			log.Println("stopped server success")
			return nil
		},
	})

	return ServerResults{
		Server: server,
	}, err
}

func HTTPServerModule() fx.Option {
	return fx.Module(
		"api.public.http_server",

		routefx.Option,

		fx.Provide(
			fx.Annotate(
				func(e *config.Config) libhttp.ServerConfig {
					return libhttp.ServerConfig{
						Port: e.API.Public.HTTP.Port,
					}
				},
				fx.ResultTags(`name:"public.http.config"`),
			),
		),

		fx.Provide(
			NewServer,
		),
	)
}

func HTTPServerTestModule() fx.Option {
	return fx.Module(
		"test.api.public.http_server",

		routefx.Option,

		fx.Provide(
			fx.Annotate(
				func(e *config.Config) libhttp.ServerConfig {
					return libhttp.ServerConfig{
						Port: e.API.Public.HTTP.Port,
					}
				},
				fx.ResultTags(`name:"public.http.config"`),
			),
		),

		fx.Provide(
			fx.Annotate(
				libhttp.NewServer,
				fx.ParamTags(
					`name:"public.http.config"`,
					`group:"public.http.routes"`,
				),
			),
		),
	)
}
