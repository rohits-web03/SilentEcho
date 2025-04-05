package models

import "time"

type Note struct {
	ID        string     `json:"id" bson:"_id,omitempty"`
	Cipher    string     `json:"ciphertext" bson:"ciphertext"`
	UserID    string     `json:"userId" bson:"userId"`
	CreatedAt time.Time  `json:"createdAt" bson:"createdAt"`
	ExpiresAt *time.Time `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
}
