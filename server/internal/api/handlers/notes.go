package handlers

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rohits-web03/SilentEcho/server/internal/models"
	"github.com/rohits-web03/SilentEcho/server/internal/repositories"
	"gorm.io/gorm"
)

// CreateNote - POST /note
func CreateNote(c *gin.Context) {
	var input struct {
		CipherNote string     `json:"ciphertext"`
		UserID     string     `json:"userId"`
		ExpiresAt  *time.Time `json:"expiresAt,omitempty"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid input"})
		return
	}

	// Convert userId string -> UUID
	userID, err := uuid.Parse(input.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid userId format"})
		return
	}

	note := models.Note{
		Slug:       uuid.NewString(),
		CipherNote: input.CipherNote,
		UserID:     userID,
		CreatedAt:  time.Now(),
		ExpiresAt:  input.ExpiresAt,
	}

	if err := repositories.DB.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create note"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Note created successfully", "data": gin.H{"id": note.ID}})
}

// GET /note/:slug
func GetNote(c *gin.Context) {
	slugParam := c.Param("slug")

	if slugParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Slug parameter cannot be empty"})
		return
	}

	var note models.Note

	if err := repositories.DB.Where("slug = ?", slugParam).First(&note).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Note not found"})
		} else {
			log.Printf("Error fetching note by slug %s: %v\n", slugParam, err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to fetch note"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Note fetched successfully",
		"data": gin.H{
			"ciphernote": note.CipherNote,
			"createdAt":  note.CreatedAt,
			"expiresAt":  note.ExpiresAt,
		},
	})
}

// GET /notes/user/:userId
func GetUserNotes(c *gin.Context) {
	userIdParam := c.Param("userId")

	var notes []models.Note

	if err := repositories.DB.Where("user_id = ?", userIdParam).Find(&notes).Error; err != nil {
		log.Printf("Error finding notes for user %s: %v\n", userIdParam, err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to query notes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Notes fetched successfully", "data": notes})
}

// GET /
func Welcome(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Welcome to SilentNotes"})
}
