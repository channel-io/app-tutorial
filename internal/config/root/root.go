package root

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/pkg/errors"
)

const mod = "go.mod"

var root string

func init() {
	r, err := Load()
	if err != nil {
		panic(err)
	}
	root = r
}

func Load() (string, error) {
	d, err := os.Getwd()
	if err != nil {
		return "", errors.Wrapf(err, "failed to get pwd")
	}

	r, err := findRoot(d)
	if err != nil {
		return "", errors.Wrapf(err, "failed to find package root")
	}

	return r, nil
}

func Get() (string, error) {
	if root == "" {
		r, err := Load()
		if err != nil {
			return "", err
		}
		root = r
	}
	return root, nil
}

func findRoot(dir string) (string, error) {
	if _, err := os.Stat(filepath.Join(dir, mod)); err == nil {
		return dir, nil
	} else if !os.IsNotExist(err) {
		return "", err
	}

	if parent := filepath.Dir(dir); parent == dir {
		return "", fmt.Errorf("failed to get parent of root %s", dir)
	} else {
		return findRoot(parent)
	}
}
