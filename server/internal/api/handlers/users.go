package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rohits-web03/SilentEcho/server/internal/models"
	"github.com/rohits-web03/SilentEcho/server/internal/repositories"
	"gorm.io/gorm"
)

// GET /api/user/info
func GetUserInfo(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := repositories.DB.First(&user, "id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                  user.ID,
		"username":            user.Username,
		"email":               user.Email,
		"isVerified":          user.IsVerified,
		"isAcceptingMessages": user.IsAcceptingMessages,
		"createdAt":           user.CreatedAt,
		"updatedAt":           user.UpdatedAt,
	})
}

// GET /api/user/check-username?username=xyz
func CheckUsername(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "username query param required"})
		return
	}

	var user models.User
	err := repositories.DB.Where("username = ?", username).First(&user).Error
	if err == nil {
		// found → not unique
		c.JSON(http.StatusOK, gin.H{"success": true, "isUnique": false})
		return
	}

	// not found, username is unique
	c.JSON(http.StatusOK, gin.H{"success": true, "isUnique": true})
}

// PATCH /api/user/:id/accept-messages
func AcceptMessages(c *gin.Context) {
	userID := c.Param("id")
	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid user ID"})
		return
	}

	var input struct {
		IsAcceptingMessages bool `json:"isAcceptingMessages"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input"})
		return
	}

	result := repositories.DB.Model(&models.User{}).
		Where("id = ?", uid).
		Update("is_accepting_messages", input.IsAcceptingMessages)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update user"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":             true,
		"message":             "User preference updated",
		"isAcceptingMessages": input.IsAcceptingMessages,
	})
}
