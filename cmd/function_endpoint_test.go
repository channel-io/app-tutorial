package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	sdkgin "github.com/channel-io/app-sdk/go/server/gin"
	"github.com/channel-io/app-tutorial/internal/tutorial"
)

type compatibilitySender struct{}

func (compatibilitySender) SendGroupMessage(_ context.Context, _, _ string, _ tutorial.SendAsBotInput, _, _ string) error {
	return nil
}

func TestAppStoreFunctionRootUsesTheSDKHandler(t *testing.T) {
	app, err := tutorial.NewApp(
		tutorial.Config{AppID: "app-id", AppSecret: "secret", BotName: "bot"},
		compatibilitySender{},
	)
	if err != nil {
		t.Fatal(err)
	}
	server := sdkgin.NewServer(app)
	mountAppStoreFunctionRoot(server)

	body := `{"method":"tutorial.open","params":{"chat":{"type":"group","id":"group"},"trigger":{"type":"command","attributes":{}},"input":{}},"context":{"caller":{"type":"manager","id":"manager"},"channel":{"id":"channel"}}}`
	req := httptest.NewRequest(http.MethodPut, "/functions", strings.NewReader(body))
	rec := httptest.NewRecorder()
	server.Engine().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
}
