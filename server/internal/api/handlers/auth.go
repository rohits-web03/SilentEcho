package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"time"

	"crypto/rand"
	"encoding/binary"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rohits-web03/SilentEcho/server/internal/config"
	"github.com/rohits-web03/SilentEcho/server/internal/models"
	"github.com/rohits-web03/SilentEcho/server/internal/queue"
	"github.com/rohits-web03/SilentEcho/server/internal/repositories"
	"github.com/rohits-web03/SilentEcho/server/internal/worker"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	rmq *queue.RabbitMQ
}

func NewAuthHandler(rmq *queue.RabbitMQ) *AuthHandler {
	return &AuthHandler{rmq: rmq}
}

// POST /auth/sign-up
func (h *AuthHandler) RegisterUser(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input"})
		return
	}

	// Check if username exists and is verified
	var existingUser models.User
	if err := repositories.DB.Where("username = ? AND is_verified = ?", input.Username, true).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Username is already taken"})
		return
	}

	// Check if email exists
	err := repositories.DB.Where("email = ?", input.Email).First(&existingUser).Error
	verifyCode, codeErr := generateVerifyCode()
	if codeErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to generate verification code"})
		return
	}

	expiresAt := time.Now().Add(1 * time.Hour)
	if err == nil { // email exists
		if existingUser.IsVerified {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "User already exists with this email"})
			return
		}

		// Update existing user
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		existingUser.Password = string(hashedPassword)
		existingUser.VerifyCode = verifyCode
		existingUser.VerifyCodeExpiry = &expiresAt

		if err := repositories.DB.Save(&existingUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database update failed"})
			return
		}
	} else { // new user
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		newUser := models.User{
			ID:                  uuid.New(), // Postgres UUID
			Username:            input.Username,
			Email:               input.Email,
			Password:            string(hashedPassword),
			VerifyCode:          verifyCode,
			VerifyCodeExpiry:    &expiresAt,
			IsVerified:          false,
			IsAcceptingMessages: true,
		}

		if err := repositories.DB.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database insert failed"})
			return
		}
	}

	job := worker.EmailJob{
		To:        input.Email,
		Subject:   "Verify your account",
		PlainBody: fmt.Sprintf("Hello %s, please verify your account using code: %s", input.Username, verifyCode),
		HTMLBody:  fmt.Sprintf("<p>Hello %s,</p><p>Please verify your account using code: <b>%s</b></p>", input.Username, verifyCode),
	}

	body, err := json.Marshal(job)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to encode email job"})
		return
	}

	if err := h.rmq.Publish(config.Envs.EMAIL_QUEUE, body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to enqueue email job"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User registered successfully. Please verify your account.",
	})
}

// --- Secure 6-digit random code generator ---
func generateVerifyCode() (string, error) {
	var b [4]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	// Convert 4 random bytes to uint32
	n := binary.BigEndian.Uint32(b[:])
	// Fit into 6-digit number
	code := 100000 + (n % 900000)
	return fmt.Sprintf("%06d", code), nil
}

func (h *AuthHandler) VerifyUserCode(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Code     string `json:"code"`
	}

	// Parse input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input"})
		return
	}

	// Decode username (in case of URL encoding issues)
	decodedUsername, err := url.QueryUnescape(input.Username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid username encoding"})
		return
	}

	// Find user
	var user models.User
	if err := repositories.DB.Where("username = ?", decodedUsername).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database error"})
		}
		return
	}

	// Check code validity
	if user.VerifyCode != input.Code {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Incorrect verification code"})
		return
	}

	// Check expiry
	if user.VerifyCodeExpiry != nil && time.Now().After(*user.VerifyCodeExpiry) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Verification code has expired. Please request a new one.",
		})
		return
	}

	// Update user as verified
	user.IsVerified = true
	if err := repositories.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Error updating user verification"})
		return
	}

	// Success response
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Account verified successfully"})
}

// JWT Claims struct
type Claims struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (h *AuthHandler) LoginUser(c *gin.Context) {
	log.Println("LoginUser called")

	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// Parse request
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input"})
		return
	}

	// Find user in Postgres
	var user models.User
	if err := repositories.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid username or password"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Database error"})
		}
		return
	}

	// Check if verified
	if !user.IsVerified {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Account not verified"})
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid username or password"})
		return
	}

	// Load JWT secret
	secret := config.Envs.JWTSecret
	if secret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Server config error"})
		return
	}

	// Build JWT claims
	expiration := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   user.ID.String(), // UUID from Postgres
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Sign token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create token"})
		return
	}

	// Cookie max-age (in seconds)
	maxAge := int(expiration.Unix() - time.Now().Unix())

	// Decide if we’re in production
	isProd := config.Envs.GINMode == "release"

	// Use SameSite=Lax for local dev, None for prod (needed if frontend + backend are on different domains)
	sameSite := http.SameSiteLaxMode
	if isProd {
		sameSite = http.SameSiteNoneMode
	}

	c.SetSameSite(sameSite)

	c.SetCookie(
		"token",
		tokenString,
		maxAge,
		"/",
		"",     // "" works for localhost and Render domain
		isProd, // Secure = true only in prod
		true,   // HttpOnly
	)

	// Response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
	})
}

// POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	isProd := config.Envs.GINMode == "release"

	// Delete the token cookie
	c.SetCookie(
		"token",
		"", // empty value
		-1, // maxAge < 0 deletes the cookie
		"/",
		"",     // domain
		isProd, // Secure only in production
		true,   // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}
