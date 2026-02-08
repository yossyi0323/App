package repository

import (
	"back-end/domain"
	"back-end/internal/db"
	"context"

	"github.com/google/uuid"
)

type TaskRepository struct {
	Queries *db.Queries
}

func NewTaskRepository(queries *db.Queries) *TaskRepository {
	return &TaskRepository{Queries: queries}
}

func (r *TaskRepository) CreateTask(ctx context.Context, task domain.Task) (domain.Task, error) {

	taskDomain, err := r.Queries.CreateTask(ctx, db.CreateTaskParams{
		TaskID:          ConvertUUIDToPgtype(task.TaskId),
		UserID:          ConvertUUIDToPgtype(task.UserId),
		Title:           task.Title,
		TaskDescription: ConvertStringToPgtype(*task.TaskDescription),
		CreatedAt:       ConvertTimeStampToPgtype(task.CreatedAt),
		UpdatedAt:       ConvertTimeStampToPgtype(task.UpdatedAt),
		CreatedBy:       ConvertUUIDToPgtype(task.CreatedBy),
		UpdatedBy:       ConvertUUIDToPgtype(task.UpdatedBy),
	})
	return TaskEntityToDomain(taskDomain), err
}

func (r *TaskRepository) GetTasks(ctx context.Context, userId uuid.UUID) ([]domain.Task, error) {
	taskDomains, err := r.Queries.GetTasks(ctx, ConvertUUIDToPgtype(userId))
	tasks := []domain.Task{}
	for _, taskDomain := range taskDomains {
		tasks = append(tasks, TaskEntityToDomain(taskDomain))
	}
	return tasks, err
}

func (r *TaskRepository) GetTask(ctx context.Context, taskId uuid.UUID) (domain.Task, error) {
	taskDomain, err := r.Queries.GetTask(ctx, ConvertUUIDToPgtype(taskId))
	return TaskEntityToDomain(taskDomain), err
}

func (r *TaskRepository) DeleteTask(ctx context.Context, taskId uuid.UUID) error {
	err := r.Queries.DeleteTask(ctx, ConvertUUIDToPgtype(taskId))
	return err
}

func (r *TaskRepository) UpdateTask(ctx context.Context, task domain.Task) (domain.Task, error) {
	taskDomain, err := r.Queries.UpdateTask(ctx, db.UpdateTaskParams{
		TaskID:          ConvertUUIDToPgtype(task.TaskId),
		Title:           task.Title,
		TaskDescription: ConvertStringToPgtype(*task.TaskDescription),
		UpdatedAt:       ConvertTimeStampToPgtype(task.UpdatedAt),
		UpdatedBy:       ConvertUUIDToPgtype(task.UpdatedBy),
	})
	return TaskEntityToDomain(taskDomain), err
}

func TaskEntityToDomain(tt db.TTask) domain.Task {
	return domain.Task{
		TaskId:          ConvertUUID(tt.TaskID),
		UserId:          ConvertUUID(tt.UserID),
		Title:           tt.Title,
		TaskDescription: &tt.TaskDescription.String,
		CreatedAt:       tt.CreatedAt.Time,
		UpdatedAt:       tt.UpdatedAt.Time,
		CreatedBy:       ConvertUUID(tt.CreatedBy),
		UpdatedBy:       ConvertUUID(tt.UpdatedBy),
	}
}
