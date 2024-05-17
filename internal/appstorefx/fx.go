package appstorefx

import (
	"github.com/channel-io/app-tutorial/internal/appstore/svc"
	"github.com/channel-io/app-tutorial/internal/appstorefx/infrafx"

	"go.uber.org/fx"
)

var Option = fx.Module(
	"core",
	infrafx.Option,
	fx.Provide(
		svc.NewAppStoreSVC,
	),
)
