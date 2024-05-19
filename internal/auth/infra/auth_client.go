package infra

import (
	"context"
	"encoding/json"

	"github.com/channel-io/app-tutorial/internal/auth/infra/dto"
	"github.com/channel-io/app-tutorial/internal/config"
	native "github.com/channel-io/app-tutorial/internal/native/dto"
	"github.com/pkg/errors"

	"github.com/go-resty/resty/v2"
)

const accessTokenPath = "/general/v1/native/functions"

const (
	issueTokenMethod   = "issueToken"
	refreshTokenMethod = "refreshToken"
)

type AuthClient interface {
	IssueToken(ctx context.Context, channelID string) (*dto.TokenResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*dto.TokenResponse, error)
}

func NewAuthClient(client *resty.Client, e *config.Config) AuthClient {
	return &authClient{
		client.
			SetDebug(e.Log.Debug).
			SetBaseURL(e.AppStore.BaseURL),
	}
}

type authClient struct {
	*resty.Client
}

func (c *authClient) IssueToken(ctx context.Context, channelID string) (*dto.TokenResponse, error) {
	body := native.NativeFunctionRequest[dto.IssueTokenParams]{
		Method: issueTokenMethod,
		Params: dto.IssueTokenParams{
			Secret:    config.Get().AppSecret,
			ChannelID: channelID,
		},
	}

	res, err := c.R().
		SetHeader("Content-Type", "application/json").
		SetBody(body).
		Put(accessTokenPath)
	if err != nil || res.IsError() {
		return nil, errors.Wrapf(err, "failed to request issueToken")
	}

	var nres native.NativeFunctionResponse
	if err := json.Unmarshal(res.Body(), &nres); err != nil {
		return nil, errors.Wrapf(err, "failed to request issueToken")
	}

	var tres dto.TokenResponse
	if err := json.Unmarshal(nres.Result, &tres); err != nil {
		return nil, errors.Wrapf(err, "failed to request issueToken")
	}
	return &tres, nil
}

func (c *authClient) RefreshToken(ctx context.Context, refreshToken string) (*dto.TokenResponse, error) {
	body := native.NativeFunctionRequest[dto.RefreshTokenParams]{
		Method: refreshTokenMethod,
		Params: dto.RefreshTokenParams{
			RefreshToken: refreshToken,
		},
	}

	res, err := c.R().
		SetHeader("Content-Type", "application/json").
		SetBody(body).
		Put(accessTokenPath)
	if err != nil || res.IsError() {
		return nil, errors.Wrapf(err, "failed to request refreshToken")
	}

	var nres native.NativeFunctionResponse
	if err := json.Unmarshal(res.Body(), &nres); err != nil {
		return nil, errors.Wrapf(err, "failed to request refreshToken")
	}

	var tres dto.TokenResponse
	if err := json.Unmarshal(nres.Result, &tres); err != nil {
		return nil, errors.Wrapf(err, "failed to request refreshToken")
	}
	return &tres, nil
}
