package tutorial

const (
	TutorialWAMName         = "tutorial"
	TutorialOpenFunction    = "tutorial.open"
	TutorialSendBotFunction = "tutorial.sendAsBot"
	TutorialManagerFunction = "writeGroupMessageAsManager"
)

type TutorialWAMArgs struct {
	ManagerID     string `json:"managerId"`
	ChatID        string `json:"chatId"`
	ChatType      string `json:"chatType"`
	ChatTitle     string `json:"chatTitle"`
	RootMessageID string `json:"rootMessageId,omitempty"`
	Broadcast     bool   `json:"broadcast"`
	Message       string `json:"message"`
	TargetToken   string `json:"targetToken,omitempty"`
}

func (args TutorialWAMArgs) Map() map[string]any {
	values := map[string]any{
		"managerId": args.ManagerID,
		"chatId":    args.ChatID,
		"chatType":  args.ChatType,
		"chatTitle": args.ChatTitle,
		"broadcast": args.Broadcast,
		"message":   args.Message,
	}
	if args.RootMessageID != "" {
		values["rootMessageId"] = args.RootMessageID
	}
	if args.TargetToken != "" {
		values["targetToken"] = args.TargetToken
	}
	return values
}
