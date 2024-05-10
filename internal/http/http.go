package http

import (
	"github.com/channel-io/app-tutorial/internal/config"

	"github.com/gin-gonic/gin"
)

type Router interface {
	gin.IRouter
}

type Routes interface {
	Path() string
	Register(router Router)
}

func Init(
	e *config.Config,
) {
	switch e.Stage {
	case config.StageDevelopment:
		gin.SetMode(gin.DebugMode)
	}
}
