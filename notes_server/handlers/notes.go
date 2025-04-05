package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rohits-web03/SilentEcho/notes_server/models"
	"github.com/rohits-web03/SilentEcho/notes_server/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func getNoteCollection() *mongo.Collection {
	return utils.GetCollection("notes")
}

// POST /note
func CreateNote(c *gin.Context) {
	var input struct {
		Ciphertext string     `json:"ciphertext"`
		UserID     string     `json:"userId"`
		ExpiresAt  *time.Time `json:"expiresAt,omitempty"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	note := models.Note{
		Cipher:    input.Ciphertext,
		UserID:    input.UserID,
		CreatedAt: time.Now(),
		ExpiresAt: input.ExpiresAt,
	}

	collection := getNoteCollection()
	result, err := collection.InsertOne(context.TODO(), note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": result.InsertedID})
}

// GET /note/:id
func GetNote(c *gin.Context) {
	idParam := c.Param("id")

	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
		return
	}

	var note models.Note
	collection := getNoteCollection()
	err = collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&note)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch note"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ciphertext": note.Cipher,
		"createdAt":  note.CreatedAt,
		"expiresAt":  note.ExpiresAt,
		"userId":     note.UserID,
	})
}

// GET /
func Welcome(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Welcome to SilentNotes"})
}
