package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// domainエラーを定義
var (
	ErrTitleRequired = errors.New("タイトルは必須です。")
)

type Task struct {
	TaskId          uuid.UUID
	UserId          uuid.UUID
	Title           string
	TaskDescription *string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	CreatedBy       uuid.UUID
	UpdatedBy       uuid.UUID
}

func (t *Task) Validate() error {
	if t.Title == "" {
		return ErrTitleRequired
	}
	return nil
}
