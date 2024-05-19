package dto

type IssueTokenParams struct {
	Secret    string `json:"secret"`
	ChannelID string `json:"channelId"`
}

type RefreshTokenParams struct {
	RefreshToken string `json:"refreshToken"`
}

type TokenResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    int64  `json:"expiresIn"`
}
