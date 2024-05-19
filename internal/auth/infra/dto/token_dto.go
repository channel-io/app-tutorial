package dto

type IssueTokenParams struct {
	Secret    string `json:"secret"`
	ChannelID string `json:"channelId"`
}

type RefreshTokenParams struct {
	RefreshToken string `json:"refreshToken"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}
