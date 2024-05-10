package authfx

import (
	"github.com/channel-io/app-tutorial/internal/auth/repo"
	"github.com/channel-io/app-tutorial/internal/auth/svc"
	"github.com/channel-io/app-tutorial/internal/authfx/infrafx"

	"go.uber.org/fx"
)

var Option = fx.Module(
	"auth",
	infrafx.Option,
	fx.Provide(
		repo.NewAuthRepo,
		svc.NewAuthSVC,
	),
)
