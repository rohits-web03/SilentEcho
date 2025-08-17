package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                  uuid.UUID  `json:"id" gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Username            string     `json:"username" gorm:"uniqueIndex;not null"`
	Email               string     `json:"email" gorm:"uniqueIndex;not null"`
	Password            string     `json:"-" gorm:"not null"`
	VerifyCode          string     `json:"-" gorm:"size:6"` // 6-digit OTP
	VerifyCodeExpiry    *time.Time `json:"verifyCodeExpiry,omitempty"`
	IsVerified          bool       `json:"isVerified" gorm:"not null;default:false"`
	IsAcceptingMessages bool       `json:"isAcceptingMessages" gorm:"not null;default:true"`
	CreatedAt           time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt           time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}
