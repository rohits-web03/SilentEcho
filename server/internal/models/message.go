package models

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	UserID    uuid.UUID `json:"userId" gorm:"type:uuid;not null;index"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	User      User      `json:"-" gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
