package models

import (
	"time"

	"github.com/google/uuid"
)

type Note struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Slug       string     `json:"slug" gorm:"uniqueIndex;not null"`
	CipherNote string     `json:"ciphernote" gorm:"not null"`
	UserID     uuid.UUID  `json:"userId" gorm:"type:uuid;not null;index"`
	CreatedAt  time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	ExpiresAt  *time.Time `json:"expiresAt,omitempty"`
	User       User       `json:"-" gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
