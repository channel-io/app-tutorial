package dto

type PlainTextGroupMessage struct {
	ChannelID     string
	GroupID       string
	RootMessageID string
	Broadcast     bool
	IsPrivate     bool
	Message       string
}
