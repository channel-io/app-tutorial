package dto

import "encoding/json"

type WriteMessageParams interface {
	ChatType() string
}

type WriteGroupMessageParams struct {
	ChannelID     string     `json:"channelId"`
	GroupID       string     `json:"groupId"`
	RootMessageID string     `json:"rootMessageId"`
	Broadcast     bool       `json:"broadcast"`
	DTO           MessageDTO `json:"dto"`
}

func (WriteGroupMessageParams) ChatType() string {
	return "group"
}

type WriteDirectChatMessageParams struct {
	ChannelID     string     `json:"channelId"`
	DirectChatID  string     `json:"directChatId"`
	RootMessageID string     `json:"rootMessageId"`
	Broadcast     bool       `json:"broadcast"`
	DTO           MessageDTO `json:"dto"`
}

func (WriteDirectChatMessageParams) ChatType() string {
	return "directChat"
}

type WriteUserChatMessageParams struct {
	ChannelID  string     `json:"channelId"`
	UserChatID string     `json:"userChatId"`
	DTO        MessageDTO `json:"dto"`
}

func (WriteUserChatMessageParams) ChatType() string {
	return "userChat"
}

type MessageDTO struct {
	Blocks    []json.RawMessage `json:"blocks"`
	PlainText string            `json:"plainText"`
	Buttons   []json.RawMessage `json:"buttons"`
	Files     []FileDTO         `json:"files"`
	WebPage   json.RawMessage   `json:"webPage"`
	Form      json.RawMessage   `json:"form"`
	Options   []MessageOption   `json:"options"`
	RequestID string            `json:"requestId"`

	BotName string `json:"botName,omitempty"`
	// ManagerID string `json:"managerId,omitempty"`
	// UserID    string `json:"userId,omitempty"`
}

type FileDTO struct {
	FileName string `json:"fileName"`
	URL      string `json:"url"`
	Mime     string `json:"mime"`
}

type MessageOption string

const IsPrivate MessageOption = "MESSAGE_OPTION_PRIVATE"
