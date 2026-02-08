package domain

import (
	"time"

	"github.com/google/uuid"
)

// domainエラーを定義
var ()

type TimeSlot struct {
	TimeSlotId uuid.UUID
	UserId     uuid.UUID
	TaskId     uuid.UUID
	Allocation string
	StartAt    time.Time
	EndAt      time.Time
	ExtData    *map[string]interface{}
	CreatedAt  time.Time
	UpdatedAt  time.Time
	CreatedBy  uuid.UUID
	UpdatedBy  uuid.UUID
}

func (t *TimeSlot) Validate() error {
	return nil
}
