package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rohits-web03/SilentEcho/notes_server/handlers"
	"github.com/rohits-web03/SilentEcho/notes_server/utils"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Connect to MongoDB
	utils.ConnectDB()

	// Initialize Gin
	r := gin.Default()

	// Routes
	r.POST("/note", handlers.CreateNote)
	r.GET("/note/:id", handlers.GetNote)
	r.GET("/", handlers.Welcome)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("🚀 Server running on port " + port)
	r.Run(":" + port)
}
