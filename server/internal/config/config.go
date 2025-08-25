package config

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
)

type Config struct {
	GINMode     string
	DB_URL      string
	MQ_URL      string
	Port        string
	JWTSecret   string
	CorsConfig  cors.Config
	EMAIL_QUEUE string
}

var Envs = initConfig()

func initConfig() Config {
	if os.Getenv("RENDER") == "" {
		log.Println("Running in development mode, loading .env")
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
	} else {
		log.Println("Running in production mode (Render)")
	}

	return Config{
		GINMode:     getEnv("GIN_MODE", "debug"),
		DB_URL:      getEnv("DB_URL", ""),
		MQ_URL:      getEnv("MQ_URL", "amqp://guest:guest@localhost:5672/"),
		Port:        getEnv("PORT", "8080"),
		JWTSecret:   getEnv("JWT_SECRET", "not-so-secret-now-is-it?"),
		CorsConfig:  CorsConfig(),
		EMAIL_QUEUE: getEnv("EMAIL_QUEUE", "email_queue"),
	}
}

// Gets the env by key or fallbacks
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func CorsConfig() cors.Config {
	return cors.Config{
		AllowOrigins: []string{"https://silentecho.vercel.app"}, // frontend URL
		// AllowOrigins:     []string{"http://localhost:3000"}, // frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
}
