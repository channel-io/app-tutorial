package config

type Stage = string

const StageDevelopment Stage = "development"

type Config struct {
	Stage     string `required:"true" name:"config.stage"`
	AppID     string `required:"false"`
	AppSecret string `required:"true"`
	ClientID  string `required:"false"`
	Meta      struct {
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
	AppStore struct {
		BaseURL string `required:"true"`
	}
	Log struct {
		Debug bool
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
