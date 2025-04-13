package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Note struct {
	ID         string             `json:"id" bson:"_id,omitempty"`
	Slug       string             `json:"slug" bson:"slug"`
	CipherNote string             `json:"ciphernote" bson:"ciphernote"`
	UserID     primitive.ObjectID `json:"userId" bson:"userId"`
	CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
	ExpiresAt  *time.Time         `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
}
