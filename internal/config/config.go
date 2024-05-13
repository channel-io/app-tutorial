package config

type Stage = string

const StageDevelopment Stage = "development"

type Config struct {
	Stage        string `required:"true" name:"config.stage"`
	AppID        string `required:"false"`
	ClientID     string `required:"false"`
	ClientSecret string `required:"false"`
	Meta         struct {
		Version   string
		Commit    string
		BuildTime string
		Dirty     bool
	}
	API struct {
		Public struct {
			HTTP struct {
				Port string
			}
		}
	}
	Auth struct {
		AuthGeneralURL string `required:"true"`
		AuthAdminURL   string `required:"true"`
		JWTServiceKey  string `required:"true"`
	}
	AppStore struct {
		BaseURL string `required:"true"`
	}
}

var config *Config

func init() {
	cfg, err := Load()
	if err != nil {
		panic(err)
	}
	config = cfg
}

func Get() *Config {
	return config
}
