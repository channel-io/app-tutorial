package tool

import "runtime/debug"

// Build information. Populated at build-time.
var buildVersion string

func BuildInfo(key string) string {
	return func() string {
		if info, ok := debug.ReadBuildInfo(); ok {
			for _, setting := range info.Settings {
				if setting.Key == key {
					return setting.Value
				}
			}
		}
		return ""
	}()
}

func BuildVersion() string {
	return buildVersion
}
