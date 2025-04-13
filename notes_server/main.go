package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rohits-web03/SilentEcho/notes_server/handlers"
	"github.com/rohits-web03/SilentEcho/notes_server/utils"
)

func main() {
	if os.Getenv("RENDER") == "" {
		log.Println("Running in development mode, loading .env")
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
	} else {
		log.Println("Running in production mode (Render)")
	}

	// Connect to MongoDB
	utils.ConnectDB()

	// Initialize Gin
	router := gin.Default()

	config := cors.Config{
		AllowOrigins: []string{"*"},
		// AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	router.Use(cors.New(config))

	// Routes
	router.POST("api/note", handlers.CreateNote)
	router.GET("api/note/:slug", handlers.GetNote)
	router.GET("/api/notes/user/:userId", handlers.GetUserNotes)
	router.GET("api/", handlers.Welcome)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server running on port " + port)
	router.Run(":" + port)
}
