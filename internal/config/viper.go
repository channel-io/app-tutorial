package config

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/channel-io/app-tutorial/internal/config/root"
	"github.com/channel-io/app-tutorial/tool"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
)

func Init() {
	fillDefaultValues()

	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	fillBuildInfo()
}

func Load() (*Config, error) {
	stage, err := readStage()
	if err != nil {
		return nil, errors.Wrapf(err, "viper failed to read stage")
	}

	viper.SetConfigName(stage)
	viper.SetConfigType("yaml")

	configDir, err := configDir()
	if err != nil {
		return nil, errors.Wrapf(err, "viper failed to get config directory")
	}

	viper.AddConfigPath(configDir)

	config := &Config{}

	if err := viper.ReadInConfig(); err != nil {
		return nil, errors.Wrapf(err, "viper failed to read config")
	}

	if err := bindEnvs(config); err != nil {
		return nil, errors.Wrapf(err, "viper failed to bind envs")
	}

	if err := viper.Unmarshal(config); err != nil {
		return nil, errors.Wrapf(err, "viper failed to unmarshal config")
	}

	return config, nil
}

func fillDefaultValues() {
	viper.SetDefault("stage", string(StageDevelopment))
	viper.SetDefault("api.public.http.port", "3021")
	viper.SetDefault("log.debug", true)
}

func fillBuildInfo() {
	viper.Set("meta.version", tool.BuildVersion())
	viper.Set("meta.commit", tool.BuildInfo("vcs.revision"))
	viper.Set("meta.buildTime", tool.BuildInfo("vcs.time"))
	viper.Set("meta.dirty", tool.BuildInfo("vcs.modified") == "true")
}

func readStage() (Stage, error) {
	stage := viper.GetString("stage")
	if stage == "" {
		return StageDevelopment, nil
	}

	switch stage {
	case string(StageDevelopment):
		return StageDevelopment, nil
	default:
		return "", errors.Errorf("invalid stage, %s", stage)
	}
}

func configDir() (string, error) {
	dir, err := root.Get()
	if err != nil {
		return "", err
	}
	return dir + "/config", nil
}

func bindEnvs(env *Config) error {
	return bindEnvToKey("", reflect.TypeOf(env))
}

func bindEnvToKey(prefix string, dataType reflect.Type) error {
	if dataType.Kind() == reflect.Ptr {
		dataType = dataType.Elem()
	}

	if dataType.Kind() == reflect.Struct {
		for i := 0; i < dataType.NumField(); i++ {
			field := dataType.Field(i)
			nextPrefix := ""
			if len(prefix) > 0 {
				nextPrefix = fmt.Sprintf("%s.%s", prefix, field.Name)
			} else {
				nextPrefix = field.Name
			}
			if err := bindEnvToKey(nextPrefix, field.Type); err != nil {
				return err
			}
		}
	} else if err := viper.BindEnv(prefix); err != nil {
		return err
	}

	return nil
}
