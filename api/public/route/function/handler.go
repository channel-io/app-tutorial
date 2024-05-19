package function

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/channel-io/app-tutorial/api/public/route/function/dto"
	"github.com/channel-io/app-tutorial/internal/appstore/svc"
	"github.com/channel-io/app-tutorial/internal/config"
	libhttp "github.com/channel-io/app-tutorial/internal/http"

	appstoredto "github.com/channel-io/app-tutorial/internal/appstore/svc/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	tutorialMethod  = "tutorial"
	sendAsBotMethod = "sendAsBot"
)

const (
	tutorialMsg  = "This is a test message sent by a manager."
	sendAsBotMsg = "This is a test message sent by a bot."
)

const (
	wamType    = "wam"
	stringType = "string"
)

type Handler struct {
	client svc.AppStoreSVC
}

func NewHandler(client svc.AppStoreSVC) *Handler {
	return &Handler{client}
}

func (h *Handler) Path() string {
	return "/functions"
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
		res = h.tutorial(ctx, req.Params.Input, req.Context)
	case sendAsBotMethod:
		res = h.sendAsBot(ctx, req.Params.Input, req.Context)
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

func (h *Handler) tutorial(
	_ context.Context,
	_ json.RawMessage,
	fnCtx dto.Context,
) *dto.JsonFunctionResponse {
	manager := fnCtx.Caller

	if manager.Type != "manager" {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "caller is not manager",
			},
		}
	}

	cfg := config.Get()

	wamArgs := dto.TutorialWamArgs{
		Message:   tutorialMsg,
		ManagerID: manager.ID,
	}

	tutorialRes := dto.TutorialResult{
		AppID:    cfg.AppID,
		ClientID: cfg.ClientID,
		Name:     "tutorial",
		WamArgs:  wamArgs,
	}

	data, err := json.Marshal(tutorialRes)
	if err != nil {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "failed to marshal the wam",
			},
		}
	}

	fnRes := dto.FunctionResult{
		Type:       wamType,
		Attributes: data,
	}

	return h.jrpcResult(fnRes)
}

func (h *Handler) sendAsBot(
	ctx context.Context,
	params json.RawMessage,
	fnCtx dto.Context,
) *dto.JsonFunctionResponse {
	var param dto.SendAsBotParams
	if err := json.Unmarshal(params, &param); err != nil {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "failed to unmarshal the function",
			},
		}
	}

	_, err := h.client.WritePlainTextToGroup(
		ctx,
		appstoredto.PlainTextGroupMessage{
			ChannelID: fnCtx.Channel.ID,
			GroupID:   param.GroupID,
			Message:   sendAsBotMsg,
		},
	)
	if err != nil {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "failed to send message as a bot",
			},
		}
	}

	sendRes := dto.SendAsBotResult{}

	data, err := json.Marshal(sendRes)
	if err != nil {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "failed to marshal the send result",
			},
		}
	}

	fnRes := dto.FunctionResult{
		Type:       stringType,
		Attributes: data,
	}

	return h.jrpcResult(fnRes)
}

func (h *Handler) jrpcResult(res dto.FunctionResult) *dto.JsonFunctionResponse {
	fnData, err := json.Marshal(res)
	if err != nil {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "failed to marshal the wam",
			},
		}
	}

	return &dto.JsonFunctionResponse{
		Result: fnData,
	}
}
