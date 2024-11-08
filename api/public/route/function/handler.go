package function

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/channel-io/app-tutorial/api/public/route/function/dto"
	"github.com/channel-io/app-tutorial/internal/appstore"
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
		res = h.tutorial(ctx, req.Params, req.Context)
	case sendAsBotMethod:
		res = h.sendAsBot(ctx, req.Params, req.Context)
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
	params dto.FunctionParams,
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

	wamArgs := map[string]string{}
	for _, k := range appstore.DefaultWamArgs() {
		if attr, ok := params.Trigger.Attributes[k]; ok {
			wamArgs[k] = attr
		}
	}
	wamArgs["managerId"] = manager.ID
	wamArgs["message"] = tutorialMsg

	tutorialRes := dto.TutorialResult{
		AppID:   cfg.AppID,
		Name:    "tutorial",
		WamArgs: wamArgs,
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
	params dto.FunctionParams,
	fnCtx dto.Context,
) *dto.JsonFunctionResponse {
	var param dto.SendAsBotParams
	if err := json.Unmarshal(params.Input, &param); err != nil {
		return &dto.JsonFunctionResponse{
			Error: &dto.Error{
				Message: "failed to unmarshal the function",
			},
		}
	}

	_, err := h.client.WritePlainTextToGroup(
		ctx,
		appstoredto.PlainTextGroupMessage{
			ChannelID:     fnCtx.Channel.ID,
			GroupID:       param.GroupID,
			Broadcast:     param.Broadcast,
			RootMessageID: param.RootMessageID,
			Message:       sendAsBotMsg,
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
