package tutorial

import (
	"encoding/json"
	"os"
	"reflect"
	"sort"
	"strings"
	"testing"
)

func TestTutorialWAMArgsMatchPublicSchema(t *testing.T) {
	body, err := os.ReadFile("../../contracts/tutorial-wam-data.schema.json")
	if err != nil {
		t.Fatal(err)
	}

	var schema struct {
		Properties map[string]json.RawMessage `json:"properties"`
		Required   []string                   `json:"required"`
		WAMName    string                     `json:"x-channel-wam-name"`
		Functions  map[string]string          `json:"x-channel-functions"`
	}
	if err := json.Unmarshal(body, &schema); err != nil {
		t.Fatal(err)
	}

	contractFields := []string{"appId", "channelId"}
	requiredFields := []string{"appId", "channelId"}
	argsType := reflect.TypeOf(TutorialWAMArgs{})
	for index := 0; index < argsType.NumField(); index++ {
		field := argsType.Field(index)
		parts := strings.Split(field.Tag.Get("json"), ",")
		contractFields = append(contractFields, parts[0])
		if len(parts) == 1 || parts[1] != "omitempty" {
			requiredFields = append(requiredFields, parts[0])
		}
	}

	schemaFields := make([]string, 0, len(schema.Properties))
	for name := range schema.Properties {
		schemaFields = append(schemaFields, name)
	}
	sort.Strings(schemaFields)
	sort.Strings(contractFields)
	sort.Strings(schema.Required)
	sort.Strings(requiredFields)

	if !reflect.DeepEqual(schemaFields, contractFields) {
		t.Fatalf("schema fields %v do not match Go fields %v", schemaFields, contractFields)
	}
	if !reflect.DeepEqual(schema.Required, requiredFields) {
		t.Fatalf("schema required fields %v do not match Go required fields %v", schema.Required, requiredFields)
	}
	if schema.WAMName != TutorialWAMName || schema.Functions["open"] != TutorialOpenFunction ||
		schema.Functions["sendAsBot"] != TutorialSendBotFunction ||
		schema.Functions["writeAsManager"] != TutorialManagerFunction {
		t.Fatal("schema function names do not match Go contract constants")
	}
}
