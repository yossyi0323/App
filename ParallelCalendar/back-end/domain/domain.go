package domain

import (
	"time"

	"github.com/google/uuid"
)

type user struct {
	UserId    uuid.UUID
	Name      string
	Email     string
	CreatedAt time.Time
	UpdatedAt time.Time
	CreatedBy uuid.UUID
	UpdatedBy uuid.UUID
}

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

type timeslot struct {
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
