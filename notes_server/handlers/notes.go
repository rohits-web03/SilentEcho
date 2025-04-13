package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
		CipherNote string     `json:"ciphertext"`
		UserID     string     `json:"userId"`
		ExpiresAt  *time.Time `json:"expiresAt,omitempty"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userIDObj, err := primitive.ObjectIDFromHex(input.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId format"})
		return
	}

	note := models.Note{
		Slug:       uuid.NewString(),
		CipherNote: input.CipherNote,
		UserID:     userIDObj,
		CreatedAt:  time.Now(),
		ExpiresAt:  input.ExpiresAt,
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
	slugParam := c.Param("slug")

	if slugParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Slug parameter cannot be empty"})
		return
	}

	collection := getNoteCollection()
	ctx := c.Request.Context()

	filter := bson.M{"slug": slugParam}

	var note models.Note
	err := collection.FindOne(ctx, filter).Decode(&note)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		} else {
			log.Printf("Error fetching note by slug %s: %v\n", slugParam, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch note"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ciphernote": note.CipherNote,
		"createdAt":  note.CreatedAt,
		"expiresAt":  note.ExpiresAt,
	})
}

// GET notes/user/:userId
func GetUserNotes(c *gin.Context) {
	userIdParam := c.Param("userId")

	userIDObj, err := primitive.ObjectIDFromHex(userIdParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	collection := getNoteCollection()

	filter := bson.M{"userId": userIDObj}

	ctx := c.Request.Context()

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		log.Printf("Error finding notes for user %s: %v\n", userIdParam, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query notes"})
		return
	}

	defer cursor.Close(ctx)

	var notes []models.Note

	for cursor.Next(ctx) {
		var note models.Note
		if err := cursor.Decode(&note); err != nil {
			log.Printf("Error decoding note for user %s: %v\n", userIdParam, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process notes"})
			return
		}
		notes = append(notes, note)
	}

	if err := cursor.Err(); err != nil {
		log.Printf("Error during cursor iteration for user %s: %v\n", userIdParam, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve all notes"})
		return
	}

	c.JSON(http.StatusOK, notes)
}

// GET /
func Welcome(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Welcome to SilentNotes"})
}
