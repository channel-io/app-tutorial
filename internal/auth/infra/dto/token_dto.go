package dto

type IssueTokenParams struct {
	Secret    string `json:"secret"`
	ChannelID string `json:"channelId"`
}

type RefreshTokenParams struct {
	RefreshToken string `json:"refreshToken"`
}

type TokenResponse struct {
	AccessToken           string   `json:"access_token"`
	RefreshToken          string   `json:"refresh_token"`
	TokenType             string   `json:"token_type"`
	ExpiresAt             int64    `json:"expires_at"`
	ExpiresIn             int64    `json:"expires_in"`
	RefreshTokenExpiresAt int64    `json:"refresh_token_expires_at"`
	RefreshTokenExpiresIn int64    `json:"refresh_token_expires_in"`
	Scope                 []string `json:"scope"`
}
