package dto

type TutorialResult struct {
	AppID    string            `json:"appId"`
	ClientID string            `json:"clientId"` // legacy
	Name     string            `json:"name"`
	WamArgs  map[string]string `json:"wamArgs"`
}

type SendAsBotParams struct {
	GroupID       string `json:"groupId"`
	RootMessageID string `json:"rootMessageId"`
	Broadcast     bool   `json:"broadcast"`
}

type SendAsBotResult struct {
}
