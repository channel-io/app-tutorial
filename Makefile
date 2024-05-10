# Project directory structure
MODULE_NAME := $(shell go list -m)
PROJECT_PATH := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
PROJECT_NAME := $(shell basename $(PROJECT_PATH))
export PATH := ${PATH}:${GOPATH}/bin

# Artifacts
TARGET_DIR ?= ${PROJECT_PATH}/target
TARGET_BIN_DIR ?= ${TARGET_DIR}/bin

# Application environment
STAGE ?= development
VERSION := $(shell git describe --exact-match --tags HEAD 2>/dev/null || git rev-parse --abbrev-ref HEAD)

# Go environment
GOVERSION := $(shell go version | awk '{print $$3}')
GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)
LDFLAGS := -ldflags="-X ${MODULE_NAME}/tool.buildVersion=${VERSION}"

.PHONY: env init build run dev clean

env:
	@echo "PROJECT_PATH:\t${PROJECT_PATH}"
	@echo "PROJECT_NAME:\t${PROJECT_NAME}"
	@echo "MODULE_NAME:\t${MODULE_NAME}"
	@echo "GOVERSION:\t${GOVERSION}"
	@echo "GOOS:\t\t${GOOS}"
	@echo "GOARCH:\t\t${GOARCH}"
	@echo "STAGE:\t\t${STAGE}"
	@echo "VERSION:\t${VERSION}"

init:
	go mod tidy

build: init
	GOOS=${GOOS} \
	GOARCH=${GOARCH} \
	go build ${LDFLAGS} \
	-o ${TARGET_BIN_DIR}/${PROJECT_NAME}.${GOOS}.${GOARCH} \
	${PROJECT_PATH}/cmd

run:
	${TARGET_BIN_DIR}/${PROJECT_NAME}.${GOOS}.${GOARCH}

dev: build run

clean:
	rm -rf ${TARGET_DIR}
