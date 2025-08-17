package main

import (
	"log"

	"github.com/rohits-web03/SilentEcho/server/internal/api"
	"github.com/rohits-web03/SilentEcho/server/internal/config"
	"github.com/rohits-web03/SilentEcho/server/internal/repositories"
)

func main() {
	// Connect DB
	repositories.ConnectDatabase()

	// Setup Gin router
	r := api.SetupRouter()

	port := config.Envs.Port
	if port == "" {
		port = "8080"
	}

	// Run server
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
