package routefx

import (
	"go.uber.org/fx"

	"github.com/channel-io/app-tutorial/api/public/route/function"
	"github.com/channel-io/app-tutorial/api/public/route/ping"
	"github.com/channel-io/app-tutorial/api/public/route/wam"
	"github.com/channel-io/app-tutorial/internal/http"
)

var Option = fx.Provide(
	route(ping.NewHandler),
	route(function.NewHandler),
	route(wam.NewHandler),
)

func route(fn interface{}) interface{} {
	return fx.Annotate(
		fn,
		fx.As(new(http.Routes)),
		fx.ResultTags(`group:"public.http.routes"`),
	)
}
