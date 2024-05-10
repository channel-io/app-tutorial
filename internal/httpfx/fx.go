package httpfx

import (
	"go.uber.org/fx"

	"github.com/channel-io/app-tutorial/internal/http"
)

var Option = fx.Option(
	fx.Invoke(http.Init),
)
