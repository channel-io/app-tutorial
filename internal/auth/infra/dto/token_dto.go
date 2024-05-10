package dto

type TokenRequest struct {
	GrantType    string `json:"grant_type"`
	Scope        string `json:"scope"`
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	RefreshToken string `json:"refresh_token"`
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
