package internal

import (
	"github.com/channel-io/app-tutorial/internal/authfx"
	"github.com/channel-io/app-tutorial/internal/cachefx"
	"github.com/channel-io/app-tutorial/internal/configfx"
	"github.com/channel-io/app-tutorial/internal/httpfx"
	"go.uber.org/fx"
)

var Option = fx.Options(
	configfx.Option,
	httpfx.Option,
	cachefx.Option,
	authfx.Option,
)
