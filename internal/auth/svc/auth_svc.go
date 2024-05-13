package svc

import (
	"context"

	"github.com/channel-io/app-tutorial/internal/auth/infra"
	"github.com/channel-io/app-tutorial/internal/auth/model"
	"github.com/channel-io/app-tutorial/internal/auth/repo"
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
	var validAT model.AccessToken
	var validRT model.RefreshToken

	at, err := s.repo.Get(ctx, validAT)
	if err != nil {
		return nil, err
	}

	if v, ok := at.(model.AccessToken); ok {
		return &v, nil
	}

	rt, err := s.repo.Get(ctx, validRT)
	if v, ok := rt.(model.RefreshToken); err != nil || !ok {
		a, r, err := s.issueToken(ctx, channelID)
		if err != nil {
			return nil, err
		}
		validAT, validRT = a, r
	} else {
		a, r, err := s.refreshToken(ctx, v)
		if err != nil {
			return nil, err
		}
		validAT, validRT = a, r
	}

	if _, err := s.repo.Save(ctx, validAT); err != nil {
		return nil, err
	}

	if _, err := s.repo.Save(ctx, validRT); err != nil {
		return nil, err
	}

	return &validAT, nil
}

func (s *authSVC) issueToken(
	ctx context.Context,
	channelID string,
) (model.AccessToken, model.RefreshToken, error) {
	nt, err := s.client.IssueToken(ctx, channelID)
	if err != nil {
		return "", "", err
	}
	return model.AccessToken(nt.AccessToken), model.RefreshToken(nt.RefreshToken), nil
}

func (s *authSVC) refreshToken(
	ctx context.Context,
	refreshToken model.RefreshToken,
) (model.AccessToken, model.RefreshToken, error) {
	nt, err := s.client.RefreshToken(ctx, string(refreshToken))
	if err != nil {
		return "", "", err
	}
	return model.AccessToken(nt.AccessToken), model.RefreshToken(nt.RefreshToken), nil
}
