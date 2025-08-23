package main

import (
	"log"

	"github.com/rohits-web03/SilentEcho/server/internal/api"
	"github.com/rohits-web03/SilentEcho/server/internal/config"
	"github.com/rohits-web03/SilentEcho/server/internal/queue"
	"github.com/rohits-web03/SilentEcho/server/internal/repositories"
)

func main() {
	// Connect DB
	repositories.ConnectDatabase()

	rmq, err := queue.NewRabbitMQ(config.Envs.MQ_URL)
	if err != nil {
		log.Fatalf("Failed to connect RabbitMQ: %v", err)
	}
	defer rmq.Close()

	_, err = rmq.DeclareQueue(config.Envs.EMAIL_QUEUE)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}
	// Setup Gin router
	r := api.SetupRouter(rmq)

	port := config.Envs.Port
	if port == "" {
		port = "8080"
	}

	// Run server
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
