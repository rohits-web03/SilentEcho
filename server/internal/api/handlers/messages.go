package handlers

import (
	"errors"
	"net/http"
	"time"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
	"github.com/rohits-web03/SilentEcho/server/internal/models"
	"github.com/rohits-web03/SilentEcho/server/internal/repositories"
)

// POST /api/messages
func SendMessage(c *gin.Context) {
	var input struct {
		Content  string `json:"content"`
		Username string `json:"username"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input"})
		return
	}

	if input.Content == "" || input.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Content and Username are required"})
		return
	}

	var user models.User
	if err := repositories.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		return
	}

	if !user.IsAcceptingMessages {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "User is not accepting messages"})
		return
	}

	newMessage := models.Message{
		Content:   input.Content,
		UserID:    user.ID,
		CreatedAt: time.Now(),
	}

	if err := repositories.DB.Create(&newMessage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Message sent successfully"})
}

// GET /api/messages
func GetMessages(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}

	var messages []models.Message
	if err := repositories.DB.Order("created_at desc").Where("user_id = ?", userID).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch messages"})
		return
	}

	if len(messages) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success":  true,
			"message":  "No messages received yet",
			"messages": []models.Message{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Messages fetched successfully", "messages": messages})
}

// DELETE /api/messages/:id
func DeleteMessage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized"})
		return
	}

	messageID := c.Param("id")

	if messageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Message ID is required"})
		return
	}

	var message models.Message

	if err := repositories.DB.Where("id = ? AND user_id = ?", messageID, userID).First(&message).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Message not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch message"})
		}
		return
	}

	if err := repositories.DB.Delete(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to delete message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Message deleted successfully"})
}
