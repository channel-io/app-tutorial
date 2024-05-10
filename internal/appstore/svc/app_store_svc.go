package svc

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/channel-io/app-tutorial/internal/appstore/infra"
	infradto "github.com/channel-io/app-tutorial/internal/appstore/infra/dto"
	"github.com/channel-io/app-tutorial/internal/appstore/svc/dto"
	"github.com/channel-io/app-tutorial/internal/auth/svc"
	"github.com/channel-io/app-tutorial/internal/config"
)

type AppStoreSVC interface {
	WritePlainTextToGroup(ctx context.Context, msg dto.PlainTextGroupMessage) (json.RawMessage, error)
}

func NewAppStoreSVC(client infra.AppStoreClient, svc svc.AuthSVC) AppStoreSVC {
	return &appStoreSVC{client, svc}
}

type appStoreSVC struct {
	client infra.AppStoreClient
	svc    svc.AuthSVC
}

func (s *appStoreSVC) WritePlainTextToGroup(
	ctx context.Context,
	msg dto.PlainTextGroupMessage,
) (json.RawMessage, error) {
	t, err := s.svc.GetValidToken(ctx, msg.ChannelID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, errors.New("nil access token")
	}

	resp, err := s.client.WriteGroupMessage(
		ctx,
		string(*t),
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
		return nil, err
	}

	return resp, nil
}
