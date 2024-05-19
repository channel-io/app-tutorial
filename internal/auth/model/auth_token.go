package model

import (
	"fmt"
	"time"

	"github.com/channel-io/app-tutorial/internal/config"
)

type Token interface {
	Key() string
	Duration() time.Duration
}

type AccessToken struct {
	ChannelID string
	Token     string
}

func (t AccessToken) Key() string {
	return fmt.Sprintf("app-%s-access-token-%s", config.Get().AppID, t.ChannelID)
}

// real duration is 30 minutes
func (AccessToken) Duration() time.Duration {
	return time.Minute*30 - time.Minute*1
}

type RefreshToken struct {
	ChannelID string
	Token     string
}

func (t RefreshToken) Key() string {
	return fmt.Sprintf("app-%s-refresh-token-%s", config.Get().AppID, t.ChannelID)
}

// real duration is 7 days
func (RefreshToken) Duration() time.Duration {
	return time.Hour*24*7 - time.Minute*1
}
