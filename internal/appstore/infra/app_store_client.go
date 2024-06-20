package infra

import (
	"context"
	"encoding/json"

	"github.com/channel-io/app-tutorial/internal/appstore/infra/dto"
	"github.com/channel-io/app-tutorial/internal/config"
	native "github.com/channel-io/app-tutorial/internal/native/dto"
	"github.com/pkg/errors"

	"github.com/go-resty/resty/v2"
)

const path = "/general/v1/native/functions"

type AppStoreClient interface {
	RegisterCommands(ctx context.Context, token string) (json.RawMessage, error)
	WriteGroupMessage(ctx context.Context, token string, params dto.WriteGroupMessageParams) (json.RawMessage, error)
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

func (c *appStoreClient) RegisterCommands(
	ctx context.Context,
	token string,
) (json.RawMessage, error) {
	commands := []dto.Command{
		{
			Name:               "tutorial",
			Scope:              "desk",
			Description:        "This is a desk command of App-tutorial",
			ActionFunctionName: "tutorial",
			ALFMode:            "disable",
			EnabledByDefault:   true,
		},
		// {
		// 	Name:               "tutorial",
		// 	Scope:              "front",
		// 	Description:        "This is a front command of App-tutorial",
		// 	ActionFunctionName: "tutorial",
		// 	ALFMode:            "disable",
		// 	EnabledByDefault:   true,
		// },
	}

	resp, err := c.R().
		SetContext(ctx).
		SetHeader("x-access-token", token).
		SetBody(
			native.NativeFunctionRequest[dto.RegisterCommandsParam]{
				Method: "registerCommands",
				Params: dto.RegisterCommandsParam{
					AppID:    config.Get().AppID,
					Commands: commands,
				},
			},
		).
		Put(path)
	if err != nil || resp.IsError() {
		return nil, errors.Wrapf(err, "failed to request registerCommands")
	}

	return unmarshalJson(resp, &native.NativeFunctionResponse{})
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
		return nil, errors.Wrapf(err, "failed to request writeGroupMessage")
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
		return nil, errors.Errorf(nativeResponse.Error.Message)
	}
	return nativeResponse.Result, nil
}
