package dto

type Command struct {
	Name               string `json:"name"`
	Scope              string `json:"scope"`
	Description        string `json:"description"`
	ActionFunctionName string `json:"actionFunctionName"`
	ALFMode            string `json:"alfMode"`
}

type RegisterCommandsParam struct {
	AppID           string    `json:"appId"`
	EnableByDefault bool      `json:"enableByDefault"`
	Commands        []Command `json:"commands"`
}
