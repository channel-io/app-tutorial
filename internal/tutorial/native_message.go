package tutorial

import (
	"context"
	"fmt"

	"github.com/channel-io/app-sdk/go/native"
)

type NativeMessageSender struct {
	tokens *native.TokenManager
	client *native.Client
}

func NewNativeMessageSender(tokens *native.TokenManager, client *native.Client) *NativeMessageSender {
	return &NativeMessageSender{tokens: tokens, client: client}
}

func (s *NativeMessageSender) SendGroupMessage(
	ctx context.Context,
	channelID, groupID string,
	input SendAsBotInput,
	message string,
	botName string,
) error {
	token, err := s.tokens.GetChannelToken(ctx, channelID)
	if err != nil {
		return fmt.Errorf("get channel token: %w", err)
	}

	_, err = s.client.CreateProxyAPI(token.AccessToken).WriteGroupMessage(
		ctx,
		native.WriteGroupMessageParams{
			ChannelID:     channelID,
			GroupID:       groupID,
			RootMessageID: input.RootMessageID,
			Broadcast:     input.Broadcast,
			DTO: native.WriteMessageDTO{
				PlainText: message,
				BotName:   botName,
			},
		},
	)
	if err != nil {
		return fmt.Errorf("write group message: %w", err)
	}
	return nil
}
