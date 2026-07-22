package tutorial

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/channel-io/cht-app-sdk/go/appsdk"
)

type fakeSender struct {
	called    bool
	channelID string
	groupID   string
}

func (s *fakeSender) SendGroupMessage(_ context.Context, channelID, groupID string, _ SendAsBotInput, _, _ string) error {
	s.called = true
	s.channelID = channelID
	s.groupID = groupID
	return nil
}

func TestTutorialAppUsesSDKFunctionRegistry(t *testing.T) {
	sender := &fakeSender{}
	app, err := NewApp(Config{AppID: "app-id", AppSecret: "secret", BotName: "bot"}, sender)
	if err != nil {
		t.Fatal(err)
	}

	open := app.HandleRequest(context.Background(), appsdk.FunctionRequest{
		Method: TutorialOpenFunction,
		Params: json.RawMessage(`{"chat":{"type":"group","id":"group"},"trigger":{"type":"command","attributes":{}},"input":{}}`),
		Context: appsdk.Context{
			Caller:  appsdk.Caller{Type: appsdk.CallerTypeManager, ID: "manager"},
			Channel: appsdk.Channel{ID: "channel"},
		},
	})
	if open.Error != nil {
		t.Fatalf("open failed: %+v", open.Error)
	}
	var action struct {
		Attributes struct {
			WAMArgs map[string]any `json:"wamArgs"`
		} `json:"attributes"`
	}
	if err := json.Unmarshal(open.Result, &action); err != nil {
		t.Fatal(err)
	}
	targetToken, ok := action.Attributes.WAMArgs["targetToken"].(string)
	if !ok || targetToken == "" {
		t.Fatal("expected a signed target token")
	}

	sent := app.HandleRequest(context.Background(), appsdk.FunctionRequest{
		Method: TutorialSendBotFunction,
		Params: json.RawMessage(`{"targetToken":"` + targetToken + `"}`),
		Context: appsdk.Context{
			Caller:  appsdk.Caller{Type: appsdk.CallerTypeManager, ID: "manager"},
			Channel: appsdk.Channel{ID: "channel"},
		},
	})
	if sent.Error != nil {
		t.Fatalf("send failed: %+v", sent.Error)
	}
	if !sender.called {
		t.Fatal("expected message sender to be called")
	}
	if sender.channelID != "channel" || sender.groupID != "group" {
		t.Fatalf("unexpected trusted target: channel=%q group=%q", sender.channelID, sender.groupID)
	}

	rejected := app.HandleRequest(context.Background(), appsdk.FunctionRequest{
		Method: TutorialSendBotFunction,
		Params: json.RawMessage(`{"targetToken":"` + targetToken + `tampered"}`),
		Context: appsdk.Context{
			Caller:  appsdk.Caller{Type: appsdk.CallerTypeManager, ID: "manager"},
			Channel: appsdk.Channel{ID: "channel"},
		},
	})
	if rejected.Error == nil || rejected.Error.Type != "invalidTarget" {
		t.Fatalf("expected invalidTarget, got %+v", rejected.Error)
	}
}
