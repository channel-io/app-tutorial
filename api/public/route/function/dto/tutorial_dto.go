package dto

type TutorialWamArgs struct {
	ManagerID string `json:"managerId"`
	Message   string `json:"message"`
}

type TutorialResult struct {
	AppID   string          `json:"appId"`
	Name    string          `json:"name"`
	WamArgs TutorialWamArgs `json:"wamArgs"`
}

type SendAsBotParams struct {
	GroupID       string `json:"groupId"`
	RootMessageID string `json:"rootMessageId"`
	Broadcast     bool   `json:"broadcast"`
	Message       string `json:"message"`
}

type SendAsBotResult struct {
}
