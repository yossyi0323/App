package domain

import (
	"time"

	"github.com/google/uuid"
)

// domainエラーを定義
var ()

type User struct {
	UserId    uuid.UUID
	Name      string
	Email     string
	CreatedAt time.Time
	UpdatedAt time.Time
	CreatedBy uuid.UUID
	UpdatedBy uuid.UUID
}

func (t *User) Validate() error {
	return nil
}
