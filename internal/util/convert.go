package util

import "encoding/json"

func StructToMap(obj interface{}) (map[string]string, error) {
	b, err := json.Marshal(obj)
	if err != nil {
		return nil, err
	}

	var m map[string]string
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}

	return m, nil
}
