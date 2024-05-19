package wam

import (
	"embed"
	"io/fs"
	"net/http"

	libhttp "github.com/channel-io/app-tutorial/internal/http"
)

//go:embed resources/*
var resources embed.FS

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Path() string {
	return "/resource/wam"
}

func (h *Handler) Register(router libhttp.Router) {
	static, err := fs.Sub(resources, "resources/wam")
	if err != nil {
		panic(err)
	}
	router.StaticFS("", http.FS(static))
}
