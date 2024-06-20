package dto

type Command struct {
	Name               string `json:"name"`
	Scope              string `json:"scope"`
	Description        string `json:"description"`
	ActionFunctionName string `json:"actionFunctionName"`
	ALFMode            string `json:"alfMode"`
	EnabledByDefault   bool   `json:"enabledByDefault"`
}

type RegisterCommandsParam struct {
	AppID    string    `json:"appId"`
	Commands []Command `json:"commands"`
}
