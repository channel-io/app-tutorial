package function

import (
	"net/http"

	"github.com/channel-io/app-tutorial/api/public/route/function/dto"
	libhttp "github.com/channel-io/app-tutorial/internal/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	tutorialMethod  = "tutorial"
	sendAsBotMethod = "sendAsBot"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Path() string {
	return "/function"
}

func (h *Handler) Register(router libhttp.Router) {
	router.PUT("", h.Function)
}

func (h *Handler) Function(ctx *gin.Context) {
	var req dto.JsonFunctionRequest
	if err := ctx.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var res *dto.JsonFunctionResponse
	switch req.Method {
	case tutorialMethod:
		res = h.tutorial()
	case sendAsBotMethod:
		res = h.sendAsBot()
	default:
		ctx.JSON(
			http.StatusOK,
			dto.JsonFunctionResponse{
				Error: &dto.Error{
					Message: "invalid method, " + req.Method,
				},
			},
		)
		return
	}

	ctx.JSON(http.StatusOK, res)
}

func (h *Handler) tutorial() *dto.JsonFunctionResponse {
	panic("not implemented")
}

func (h *Handler) sendAsBot() *dto.JsonFunctionResponse {
	panic("not implemented")
}
