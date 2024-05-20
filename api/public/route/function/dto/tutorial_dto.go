package dto

type TutorialWamArgs struct {
	ManagerID string `json:"managerId"`
	Message   string `json:"message"`
}

type TutorialResult struct {
	AppID    string          `json:"appId"`
	ClientID string          `json:"clientId"` // legacy
	Name     string          `json:"name"`
	WamArgs  TutorialWamArgs `json:"wamArgs"`
}

type SendAsBotParams struct {
	GroupID string `json:"groupId"`
}

type SendAsBotResult struct {
}
