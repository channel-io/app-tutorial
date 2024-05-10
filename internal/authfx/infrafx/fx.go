package infrafx

import (
	"net/http"
	"time"

	"github.com/channel-io/app-tutorial/internal/auth/infra"

	"github.com/go-resty/resty/v2"
	"go.uber.org/fx"
)

const timeout = time.Second * 10

var Option = fx.Options(
	fx.Supply(
		fx.Annotate(
			http.DefaultTransport,
			fx.ResultTags(`name:"auth"`),
			fx.As(new(http.RoundTripper)),
		),
	),
	fx.Provide(
		fx.Annotate(
			func(tripper http.RoundTripper) *resty.Client {
				ret := resty.New()
				ret.SetTimeout(timeout)
				ret.SetTransport(tripper)
				return ret
			},
			fx.ParamTags(`name:"auth"`),
			fx.ResultTags(`name:"auth"`),
		),
	),
	fx.Provide(
		fx.Annotate(
			infra.NewAuthClient,
			fx.ParamTags(`name:"auth"`),
		),
	),
)
