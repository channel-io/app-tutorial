package svc

import (
	"context"
	"encoding/json"

	"github.com/channel-io/app-tutorial/internal/appstore/infra"
	infradto "github.com/channel-io/app-tutorial/internal/appstore/infra/dto"
	"github.com/channel-io/app-tutorial/internal/appstore/svc/dto"
	"github.com/channel-io/app-tutorial/internal/auth/svc"
	"github.com/channel-io/app-tutorial/internal/config"
	"github.com/pkg/errors"
)

type AppStoreSVC interface {
	RegisterCommands(ctx context.Context) (json.RawMessage, error)
	WritePlainTextToGroup(ctx context.Context, msg dto.PlainTextGroupMessage) (json.RawMessage, error)
}

func NewAppStoreSVC(client infra.AppStoreClient, svc svc.AuthSVC) AppStoreSVC {
	return &appStoreSVC{client, svc}
}

type appStoreSVC struct {
	client infra.AppStoreClient
	svc    svc.AuthSVC
}

func (s *appStoreSVC) RegisterCommands(ctx context.Context) (json.RawMessage, error) {
	token, err := s.svc.GetAppToken(ctx)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to register commands")
	}
	if token == "" {
		return nil, errors.New("empty token")
	}

	resp, err := s.client.RegisterCommands(ctx, token)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to register commands")
	}

	return resp, nil
}

func (s *appStoreSVC) WritePlainTextToGroup(
	ctx context.Context,
	msg dto.PlainTextGroupMessage,
) (json.RawMessage, error) {
	t, err := s.svc.GetValidToken(ctx, msg.ChannelID)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to send a plaintext message to the group")
	}
	if t == nil {
		return nil, errors.New("nil access token")
	}

	resp, err := s.client.WriteGroupMessage(
		ctx,
		t.Token,
		infradto.WriteGroupMessageParams{
			ChannelID:     msg.ChannelID,
			GroupID:       msg.GroupID,
			RootMessageID: msg.RootMessageID,
			Broadcast:     msg.Broadcast,
			DTO: infradto.MessageDTO{
				PlainText: msg.Message,
				BotName:   config.Get().Bot.Name,
			},
		},
	)
	if err != nil {
		return nil, errors.Wrapf(err, "failed to send a plaintext message to the group")
	}

	return resp, nil
}
