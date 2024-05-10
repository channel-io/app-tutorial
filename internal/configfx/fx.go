package configfx

import (
	"github.com/channel-io/app-tutorial/internal/config"

	"go.uber.org/fx"
)

var Option = fx.Options(
	fx.Invoke(config.Init),
	fx.Provide(config.Load),
)
