package main

import sdkgin "github.com/channel-io/app-sdk/go/server/gin"

// mountAppStoreFunctionRoot keeps the SDK's versioned route as the source of
// truth while accepting AppStore calls that target the configured root URL.
func mountAppStoreFunctionRoot(server *sdkgin.Server) {
	server.Engine().PUT("/functions", server.Handler().Handle)
}
