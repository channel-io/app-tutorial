package svc

import (
	"context"
	"fmt"

	"github.com/channel-io/app-tutorial/internal/auth/infra"
	"github.com/channel-io/app-tutorial/internal/auth/infra/dto"
	"github.com/channel-io/app-tutorial/internal/auth/model"
	"github.com/channel-io/app-tutorial/internal/auth/repo"
	"github.com/channel-io/app-tutorial/internal/config"
)

const (
	clientCredentialsGrantType = "client_credentials"
	refreshGrantType           = "refresh"
	scope                      = "scope=app-%s&scope=channel-%s"
)

type AuthSVC interface {
	GetValidToken(ctx context.Context, channelID string) (*model.AccessToken, error)
}

type authSVC struct {
	client infra.AuthClient
	repo   repo.AuthRepo
}

func NewAuthSVC(client infra.AuthClient, repo repo.AuthRepo) AuthSVC {
	return &authSVC{client, repo}
}

func (s *authSVC) GetValidToken(ctx context.Context, channelID string) (*model.AccessToken, error) {
	var nat model.AccessToken
	var nrt model.RefreshToken

	at, err := s.repo.Get(ctx, nat)
	if err != nil {
		return nil, err
	}

	if v, ok := at.(model.AccessToken); ok {
		return &v, nil
	}

	rt, err := s.repo.Get(ctx, nrt)
	if v, ok := rt.(model.RefreshToken); err != nil || !ok {
		a, r, err := s.issueToken(ctx, channelID)
		if err != nil {
			return nil, err
		}
		nat, nrt = a, r
	} else {
		a, r, err := s.refreshToken(ctx, v)
		if err != nil {
			return nil, err
		}
		nat, nrt = a, r
	}

	if _, err := s.repo.Save(ctx, nat); err != nil {
		return nil, err
	}

	if _, err := s.repo.Save(ctx, nrt); err != nil {
		return nil, err
	}

	return &nat, nil
}

func (s *authSVC) issueToken(
	ctx context.Context,
	channelID string,
) (model.AccessToken, model.RefreshToken, error) {
	cfg := config.Get()

	nt, err := s.client.IssueToken(
		ctx,
		&dto.TokenRequest{
			GrantType:    clientCredentialsGrantType,
			Scope:        fmt.Sprintf(scope, cfg.AppID, channelID),
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
		},
	)
	if err != nil {
		return "", "", err
	}

	return model.AccessToken(nt.AccessToken), model.RefreshToken(nt.RefreshToken), nil
}

func (s *authSVC) refreshToken(
	ctx context.Context,
	refreshToken model.RefreshToken,
) (model.AccessToken, model.RefreshToken, error) {
	cfg := config.Get()

	nt, err := s.client.IssueToken(
		ctx,
		&dto.TokenRequest{
			GrantType:    refreshGrantType,
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RefreshToken: string(refreshToken),
		},
	)
	if err != nil {
		return "", "", err
	}

	return model.AccessToken(nt.AccessToken), model.RefreshToken(nt.RefreshToken), nil
}
