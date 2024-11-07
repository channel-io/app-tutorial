package appstore

var (
	defaultWamArgKeys = []string{
		"rootMessageId", "broadcast", "isPrivate",
	}
)

func DefaultWamArgs() []string {
	return append([]string{}, defaultWamArgKeys...)
}
