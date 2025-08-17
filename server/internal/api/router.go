package api

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rohits-web03/SilentEcho/server/internal/api/handlers"
	"github.com/rohits-web03/SilentEcho/server/internal/api/middleware"
	"github.com/rohits-web03/SilentEcho/server/internal/config"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(cors.New(config.Envs.CorsConfig))
	// Routes
	{
		apiRouter := router.Group("/api")
		// Auth
		apiRouter.POST("/auth/sign-up", handlers.RegisterUser)
		apiRouter.POST("/auth/login", handlers.LoginUser)
		apiRouter.POST("/auth/verify-code", handlers.VerifyUserCode)

		// Notes
		{
			noteRouter := apiRouter.Group("/notes")
			noteRouter.Use(middleware.AuthMiddleware())
			noteRouter.POST("/", handlers.CreateNote)
			noteRouter.GET("/:slug", handlers.GetNote)
			noteRouter.GET("/user/:userId", handlers.GetUserNotes)
		}

		// Users
		{
			userRouter := apiRouter.Group("/user")
			// GET /api/user/check-username?username=xyz
			userRouter.GET("/check-username", handlers.CheckUsername)
			userRouter.Use(middleware.AuthMiddleware())
			// GET /api/user/info
			userRouter.GET("/info", handlers.GetUserInfo)
			// PATCH /api/user/:id/accept-messages
			userRouter.PATCH("/:id/accept-messages", handlers.AcceptMessages)
		}

		// Welcome
		apiRouter.GET("/", handlers.Welcome)

		// Test
		apiRouter.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "pong"})
		})

		apiRouter.GET("/test-cors", func(c *gin.Context) {
			c.JSON(200, gin.H{"msg": "CORS working"})
		})
	}

	return router
}
