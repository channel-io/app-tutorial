package dto

import "encoding/json"

type NativeFunctionRequest[REQ any] struct {
	Method string
	Params REQ
}

type NativeFunctionResponse struct {
	Error  NativeError     `json:"error,omitempty"`
	Result json.RawMessage `json:"result,omitempty"`
}

type NativeError struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}
