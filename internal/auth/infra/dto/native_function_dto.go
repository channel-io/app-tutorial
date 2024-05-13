package dto

type NativeFunctionRequest[REQ any] struct {
	Method string `json:"method"`
	Params REQ    `json:"params"`
}
