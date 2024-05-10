package infra

import (
	"context"
	"encoding/json"

	"github.com/channel-io/app-tutorial/internal/auth/infra/dto"
	"github.com/channel-io/app-tutorial/internal/config"
	"github.com/channel-io/app-tutorial/internal/util"

	"github.com/go-resty/resty/v2"
)

const path = "/general/auth/v1/token"

type AuthClient interface {
	IssueToken(ctx context.Context, req *dto.TokenRequest) (*dto.TokenResponse, error)
}

func NewAuthClient(client *resty.Client) AuthClient {
	cfg := config.Get()

	return &authClient{
		client.
			SetDebug(cfg.Log.Debug).
			SetBaseURL(cfg.Auth.AuthGeneralURL),
	}
}

type authClient struct {
	*resty.Client
}

func (c *authClient) IssueToken(ctx context.Context, req *dto.TokenRequest) (*dto.TokenResponse, error) {
	form, err := util.StructToMap(req)
	if err != nil {
		return nil, err
	}

	res, err := c.R().
		SetHeader("Content-Type", "application/x-www-form-urlencoded").
		SetFormData(form).
		Post(path)
	if err != nil || res.IsError() {
		return nil, err
	}

	var tres dto.TokenResponse
	if err := json.Unmarshal(res.Body(), &tres); err != nil {
		return nil, err
	}
	return &tres, nil
}
