package repository

import (
	"back-end/domain"
	"back-end/internal/db"
	"context"

	"github.com/google/uuid"
)

func CreateTask(ctx context.Context, q *db.Queries, task domain.Task) (domain.Task, error) {

	taskDomain, err := q.CreateTask(ctx, db.CreateTaskParams{
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

func GetTask(ctx context.Context, q *db.Queries, taskId uuid.UUID) (domain.Task, error) {
	taskDomain, err := q.GetTask(ctx, ConvertUUIDToPgtype(taskId))
	return TaskEntityToDomain(taskDomain), err
}

func DeleteTask(ctx context.Context, q *db.Queries, taskId uuid.UUID) error {
	err := q.DeleteTask(ctx, ConvertUUIDToPgtype(taskId))
	return err
}

func UpdateTask(ctx context.Context, q *db.Queries, task domain.Task) (domain.Task, error) {
	taskDomain, err := q.UpdateTask(ctx, db.UpdateTaskParams{
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
