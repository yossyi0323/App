package repository

import (
	"back-end/domain"
	"back-end/internal/db"
	"context"

	"github.com/google/uuid"
)

type ITaskRepository interface {
	CreateTask(ctx context.Context, task domain.Task) (domain.Task, error)
	GetTasks(ctx context.Context, userId uuid.UUID) ([]domain.Task, error)
	GetTask(ctx context.Context, taskId uuid.UUID) (domain.Task, error)
	DeleteTask(ctx context.Context, taskId uuid.UUID) error
	UpdateTask(ctx context.Context, task domain.Task) (domain.Task, error)
}
type Repositories struct {
	Task ITaskRepository
}

func NewRepositories(q *db.Queries) *Repositories {
	return &Repositories{
		Task: NewTaskRepository(q),
	}
}
