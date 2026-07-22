package tutorial

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/channel-io/cht-app-sdk/go/appsdk"
	"github.com/channel-io/cht-app-sdk/go/extension/command"
	"google.golang.org/protobuf/types/known/structpb"
)

const (
	tutorialMessage = "This is a test message sent by a manager."
	botMessage      = "This is a test message sent by a bot."
	targetDomain    = "channel-app-tutorial-target\x00"
)

type Config struct {
	AppID     string
	AppSecret string
	BotName   string
}

type MessageSender interface {
	SendGroupMessage(ctx context.Context, channelID, groupID string, input SendAsBotInput, message, botName string) error
}

type SendAsBotInput struct {
	TargetToken   string `json:"targetToken"`
	RootMessageID string `json:"rootMessageId,omitempty"`
	Broadcast     bool   `json:"broadcast"`
}

type EmptyOutput struct{}

type tutorialTarget struct {
	ChannelID string `json:"channelId"`
	GroupID   string `json:"groupId"`
	ManagerID string `json:"managerId"`
	ExpiresAt int64  `json:"expiresAt"`
}

func NewApp(cfg Config, sender MessageSender) (*appsdk.App, error) {
	if cfg.AppID == "" {
		return nil, fmt.Errorf("appId is required")
	}
	if cfg.AppSecret == "" {
		return nil, fmt.Errorf("appSecret is required")
	}
	if sender == nil {
		return nil, fmt.Errorf("message sender is required")
	}

	app := appsdk.New(appsdk.Options{AppID: cfg.AppID, AppSecret: cfg.AppSecret})
	if err := app.Use(command.Extension().
		GetCommands(command.StaticCommands(&command.Config{
			Name:               TutorialWAMName,
			Scope:              command.ScopeDesk,
			Description:        "Open the Channel App SDK tutorial WAM",
			ActionFunctionName: TutorialOpenFunction,
			AlfMode:            command.AlfModeDisable,
			EnabledByDefault:   true,
		})).
		Execute(TutorialOpenFunction, openTutorial(cfg.AppID, cfg.AppSecret))); err != nil {
		return nil, err
	}

	if err := appsdk.Register(app, TutorialSendBotFunction,
		func(ctx context.Context, fnCtx appsdk.Context, input *SendAsBotInput) (*EmptyOutput, error) {
			target, err := readTutorialTargetToken(input.TargetToken, cfg.AppSecret)
			if err != nil || target.ExpiresAt <= time.Now().Unix() ||
				target.ChannelID != fnCtx.Channel.ID || fnCtx.Caller.Type != appsdk.CallerTypeManager ||
				target.ManagerID != fnCtx.Caller.ID {
				return nil, appsdk.NewError(appsdk.CodeBadRequest, "invalidTarget", "the tutorial target is invalid or expired")
			}
			if err := sender.SendGroupMessage(ctx, target.ChannelID, target.GroupID, *input, botMessage, cfg.BotName); err != nil {
				return nil, err
			}
			return &EmptyOutput{}, nil
		}); err != nil {
		return nil, err
	}

	return app, nil
}

func openTutorial(appID, appSecret string) appsdk.TypedHandlerFunc[command.ExecuteRequest, command.ActionResult] {
	return func(_ context.Context, fnCtx appsdk.Context, input *command.ExecuteRequest) (*command.ActionResult, error) {
		chat := input.GetChat()
		triggerAttributes := input.GetTrigger().GetAttributes()
		wamArgs := TutorialWAMArgs{
			ManagerID:     fnCtx.Caller.ID,
			ChatID:        chat.GetId(),
			ChatType:      chat.GetType(),
			ChatTitle:     triggerAttributes["chatTitle"],
			RootMessageID: triggerAttributes["rootMessageId"],
			Broadcast:     triggerAttributes["broadcast"] == "true",
			Message:       tutorialMessage,
		}
		if chat.GetType() == "group" && chat.GetId() != "" &&
			fnCtx.Caller.Type == appsdk.CallerTypeManager && fnCtx.Caller.ID != "" {
			targetToken, err := createTutorialTargetToken(tutorialTarget{
				ChannelID: fnCtx.Channel.ID,
				GroupID:   chat.GetId(),
				ManagerID: fnCtx.Caller.ID,
				ExpiresAt: time.Now().Add(5 * time.Minute).Unix(),
			}, appSecret)
			if err != nil {
				return nil, err
			}
			wamArgs.TargetToken = targetToken
		}

		attributes, err := structpb.NewStruct(map[string]any{
			"appId":   appID,
			"name":    TutorialWAMName,
			"wamArgs": wamArgs.Map(),
		})
		if err != nil {
			return nil, err
		}
		return &command.ActionResult{Type: "wam", Attributes: attributes}, nil
	}
}

func createTutorialTargetToken(target tutorialTarget, secret string) (string, error) {
	body, err := json.Marshal(target)
	if err != nil {
		return "", err
	}
	encoded := base64.RawURLEncoding.EncodeToString(body)
	signature := hmac.New(sha256.New, []byte(secret))
	_, _ = signature.Write([]byte(targetDomain))
	_, _ = signature.Write([]byte(encoded))
	return encoded + "." + base64.RawURLEncoding.EncodeToString(signature.Sum(nil)), nil
}

func readTutorialTargetToken(token, secret string) (tutorialTarget, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return tutorialTarget{}, fmt.Errorf("invalid target token")
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return tutorialTarget{}, fmt.Errorf("invalid target signature")
	}
	expected := hmac.New(sha256.New, []byte(secret))
	_, _ = expected.Write([]byte(targetDomain))
	_, _ = expected.Write([]byte(parts[0]))
	if !hmac.Equal(signature, expected.Sum(nil)) {
		return tutorialTarget{}, fmt.Errorf("invalid target signature")
	}
	body, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return tutorialTarget{}, fmt.Errorf("invalid target payload")
	}
	var target tutorialTarget
	if err := json.Unmarshal(body, &target); err != nil {
		return tutorialTarget{}, fmt.Errorf("invalid target payload")
	}
	if target.ChannelID == "" || target.GroupID == "" || target.ManagerID == "" || target.ExpiresAt <= 0 {
		return tutorialTarget{}, fmt.Errorf("incomplete target payload")
	}
	return target, nil
}
