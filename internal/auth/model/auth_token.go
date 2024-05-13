package model

import (
	"fmt"
	"time"

	"github.com/channel-io/app-tutorial/internal/config"
)

type AppSecret string

type Token interface {
	Key() string
	Duration() time.Duration
}

type AccessToken string

func (AccessToken) Key() string {
	return fmt.Sprintf("app-%s-access-token", config.Get().AppID)
}

// real duration is 30 minutes
func (AccessToken) Duration() time.Duration {
	return time.Minute*30 - time.Minute*1
}

type RefreshToken string

func (RefreshToken) Key() string {
	return fmt.Sprintf("app-%s-refresh-token", config.Get().AppID)
}

// real duration is 7 days
func (RefreshToken) Duration() time.Duration {
	return time.Hour*24*7 - time.Minute*1
}
