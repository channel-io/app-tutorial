package ping

import (
	"net/http"

	"github.com/gin-gonic/gin"

	libhttp "github.com/channel-io/app-tutorial/internal/http"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Path() string {
	return "/ping"
}

func (h *Handler) Register(router libhttp.Router) {
	router.GET("", h.Ping)
}

func (h *Handler) Ping(ctx *gin.Context) {
	ctx.String(http.StatusOK, "pong")
}
