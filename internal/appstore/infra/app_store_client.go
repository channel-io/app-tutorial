package infra

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/channel-io/app-tutorial/internal/appstore/infra/dto"
	"github.com/channel-io/app-tutorial/internal/config"
	native "github.com/channel-io/app-tutorial/internal/native/dto"

	"github.com/go-resty/resty/v2"
)

const path = "/general/v1/native/functions"

type AppStoreClient interface {
	WriteGroupMessage(
		ctx context.Context,
		token string,
		params dto.WriteGroupMessageParams,
	) (json.RawMessage, error)
	WriteDirectChatMessage(
		ctx context.Context,
		token string,
		params dto.WriteDirectChatMessageParams,
	) (json.RawMessage, error)
	WriteUserChatMessage(
		ctx context.Context,
		token string,
		params dto.WriteUserChatMessageParams,
	) (json.RawMessage, error)
}

func NewAppStoreClient(client *resty.Client, e *config.Config) AppStoreClient {
	return &appStoreClient{
		client.
			SetDebug(e.Log.Debug).
			SetBaseURL(e.AppStore.BaseURL),
	}
}

type appStoreClient struct {
	*resty.Client
}

func (c *appStoreClient) WriteGroupMessage(
	ctx context.Context,
	token string,
	params dto.WriteGroupMessageParams,
) (json.RawMessage, error) {
	resp, err := c.R().
		SetContext(ctx).
		SetHeader("x-access-token", token).
		SetBody(
			native.NativeFunctionRequest[dto.WriteGroupMessageParams]{
				Method: "writeGroupMessage",
				Params: params,
			},
		).
		Put(path)
	if err != nil || resp.IsError() {
		return nil, err
	}

	return unmarshalJson(resp, &native.NativeFunctionResponse{})
}

func (c *appStoreClient) WriteDirectChatMessage(
	ctx context.Context,
	token string,
	params dto.WriteDirectChatMessageParams,
) (json.RawMessage, error) {
	resp, err := c.R().
		SetContext(ctx).
		SetHeader("x-access-token", token).
		SetBody(
			native.NativeFunctionRequest[dto.WriteDirectChatMessageParams]{
				Method: "writeDirectChatMessage",
				Params: params,
			},
		).
		Put(path)
	if err != nil || resp.IsError() {
		return nil, err
	}

	return unmarshalJson(resp, &native.NativeFunctionResponse{})
}

func (c *appStoreClient) WriteUserChatMessage(
	ctx context.Context,
	token string,
	params dto.WriteUserChatMessageParams,
) (json.RawMessage, error) {
	resp, err := c.R().
		SetContext(ctx).
		SetHeader("x-access-token", token).
		SetBody(
			native.NativeFunctionRequest[dto.WriteUserChatMessageParams]{
				Method: "writeUserChatMessage",
				Params: params,
			},
		).
		Put(path)
	if err != nil || resp.IsError() {
		return nil, err
	}

	return unmarshalJson(resp, &native.NativeFunctionResponse{})
}

func unmarshalJson(
	response *resty.Response,
	nativeResponse *native.NativeFunctionResponse,
) (json.RawMessage, error) {
	if err := json.Unmarshal(response.Body(), &nativeResponse); err != nil {
		return nil, err
	}
	if nativeResponse.Error.Type != "" || nativeResponse.Error.Message != "" {
		return nil, errors.New(nativeResponse.Error.Message)
	}
	return nativeResponse.Result, nil
}
