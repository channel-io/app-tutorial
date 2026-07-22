package tutorial

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/channel-io/app-sdk/go/native"
)

type NativeMessageSender struct {
	tokens      *native.TokenManager
	appStoreURL string
	httpClient  *http.Client
}

func NewNativeMessageSender(tokens *native.TokenManager, appStoreURL string) *NativeMessageSender {
	return &NativeMessageSender{
		tokens:      tokens,
		appStoreURL: strings.TrimRight(appStoreURL, "/"),
		httpClient:  &http.Client{Timeout: 15 * time.Second},
	}
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

	payload := map[string]any{
		"method": "writeGroupMessage",
		"params": map[string]any{
			"channelId":     channelID,
			"groupId":       groupID,
			"rootMessageId": input.RootMessageID,
			"broadcast":     input.Broadcast,
			"dto": map[string]any{
				"plainText": message,
				"botName":   botName,
			},
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPut,
		s.appStoreURL+"/general/v1/native/functions",
		bytes.NewReader(body),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-access-token", token.AccessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("native function returned HTTP %d", resp.StatusCode)
	}

	var result struct {
		Error *struct {
			Message string `json:"message"`
		} `json:"error,omitempty"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}
	if result.Error != nil {
		return fmt.Errorf("native function error: %s", result.Error.Message)
	}
	return nil
}
