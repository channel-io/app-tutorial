package svc

import (
	"context"

	"github.com/channel-io/app-tutorial/internal/auth/infra"
	"github.com/channel-io/app-tutorial/internal/auth/model"
	"github.com/channel-io/app-tutorial/internal/auth/repo"
	"github.com/pkg/errors"
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
	if t, err := s.tryAccessToken(ctx, channelID); err == nil {
		return t, nil
	}

	access, refresh, err := s.tryRefreshToken(ctx, channelID)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to get a valid token")
	}

	if _, err := s.repo.Save(ctx, *access); err != nil {
		return nil, errors.Wrapf(err, "failed to get a valid token")
	}

	if _, err := s.repo.Save(ctx, *refresh); err != nil {
		return nil, errors.Wrapf(err, "failed to get a valid token")
	}

	return access, nil
}

func (s *authSVC) tryAccessToken(ctx context.Context, channelID string) (*model.AccessToken, error) {
	t, err := s.repo.Get(ctx, &model.AccessToken{ChannelID: channelID})
	if err != nil {
		return nil, errors.Wrapf(err, "failed to get a token")
	}

	v, ok := t.(model.AccessToken)
	if !ok {
		return nil, errors.New("failed to get a token")
	}

	return &v, nil
}

func (s *authSVC) tryRefreshToken(ctx context.Context, channelID string) (*model.AccessToken, *model.RefreshToken, error) {
	if rt, err := s.repo.Get(ctx, &model.RefreshToken{ChannelID: channelID}); err == nil {
		v, ok := rt.(model.RefreshToken)
		if !ok {
			return nil, nil, errors.Wrapf(err, "failed to refresh the token")
		}

		if a, r, err := s.refreshToken(ctx, v); err != nil {
			return nil, nil, errors.Wrapf(err, "failed to refresh the token")
		} else {
			return a, r, nil
		}
	}

	if a, r, err := s.issueToken(ctx, channelID); err != nil {
		return nil, nil, errors.Wrapf(err, "failed to issue a new token")
	} else {
		return a, r, nil
	}
}

func (s *authSVC) issueToken(
	ctx context.Context,
	channelID string,
) (*model.AccessToken, *model.RefreshToken, error) {
	nt, err := s.client.IssueToken(ctx, channelID)
	if err != nil {
		return nil, nil, err
	}

	access := &model.AccessToken{
		ChannelID: channelID,
		Token:     nt.AccessToken,
	}
	refresh := &model.RefreshToken{
		ChannelID: channelID,
		Token:     nt.RefreshToken,
	}

	return access, refresh, nil
}

func (s *authSVC) refreshToken(
	ctx context.Context,
	refreshToken model.RefreshToken,
) (*model.AccessToken, *model.RefreshToken, error) {
	nt, err := s.client.RefreshToken(ctx, refreshToken.Token)
	if err != nil {
		return nil, nil, err
	}

	channelID := refreshToken.ChannelID
	access := &model.AccessToken{
		ChannelID: channelID,
		Token:     nt.AccessToken,
	}
	refresh := &model.RefreshToken{
		ChannelID: channelID,
		Token:     nt.RefreshToken,
	}

	return access, refresh, nil
}
