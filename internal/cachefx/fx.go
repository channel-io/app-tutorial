package cachefx

import (
	"github.com/channel-io/app-tutorial/internal/cache"

	"go.uber.org/fx"
)

var Option = fx.Options(
	fx.Provide(cache.Init),
)
