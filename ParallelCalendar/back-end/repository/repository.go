package repository

import (
	"back-end/domain"
	"back-end/internal/db"
	"context"
	"time"

	"github.com/google/uuid"
)

type ITaskRepository interface {
	CreateTask(ctx context.Context, task domain.Task) (domain.Task, error)
	GetTasks(ctx context.Context, userId uuid.UUID) ([]domain.Task, error)
	GetTask(ctx context.Context, taskId uuid.UUID) (domain.Task, error)
	DeleteTask(ctx context.Context, taskId uuid.UUID) error
	UpdateTask(ctx context.Context, task domain.Task) (domain.Task, error)
}
type ITimeSlotRepository interface {
	CreateTimeSlot(ctx context.Context, timeSlot domain.TimeSlot) (domain.TimeSlot, error)
	GetTimeSlots(ctx context.Context, userId uuid.UUID, startAt, endAt time.Time) ([]domain.TimeSlot, error)
	GetTimeSlot(ctx context.Context, timeSlotId uuid.UUID) (domain.TimeSlot, error)
	DeleteTimeSlot(ctx context.Context, timeSlotId uuid.UUID) error
	UpdateTimeSlot(ctx context.Context, timeSlot domain.TimeSlot) (domain.TimeSlot, error)
}

type Repositories struct {
	Task     ITaskRepository
	TimeSlot ITimeSlotRepository
}

func NewRepositories(q *db.Queries) *Repositories {
	return &Repositories{
		Task:     NewTaskRepository(q),
		TimeSlot: NewTimeSlotRepository(q),
	}
}
