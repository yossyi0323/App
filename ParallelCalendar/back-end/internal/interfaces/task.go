package interfaces

import (
	"back-end/api"
	"back-end/domain"
	"context"
	"errors"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

// タスク作成
// (POST /tasks)
func (s *Server) CreateTask(ctx context.Context, request api.CreateTaskRequestObject) (api.CreateTaskResponseObject, error) {

	taskDomain := domain.Task{
		TaskId:          request.Body.TaskId,
		UserId:          request.Body.UserId,
		Title:           request.Body.Title,
		TaskDescription: request.Body.TaskDescription,
		CreatedAt:       request.Body.CreatedAt,
		UpdatedAt:       request.Body.UpdatedAt,
		CreatedBy:       request.Body.CreatedBy,
		UpdatedBy:       request.Body.UpdatedBy,
	}
	if err := taskDomain.Validate(); err != nil {
		// TODO CreateTask400JSONResponseとか、バリデーションチェックに引っかかった場合のエラーを定義する
		return nil, err
	}
	task, err := s.Repos.Task.CreateTask(ctx, taskDomain)
	if err != nil {
		return nil, err
	}
	return api.CreateTask201JSONResponse(TaskDomainToModel(task)), nil
}

// タスク一覧取得
// (GET /tasks)
func (s *Server) GetTasks(ctx context.Context, request api.GetTasksRequestObject) (api.GetTasksResponseObject, error) {

	return api.GetTasks200JSONResponse{}, nil
}

// タスク詳細取得
// (GET /tasks/{taskId})
func (s *Server) GetTask(ctx context.Context, request api.GetTaskRequestObject) (api.GetTaskResponseObject, error) {

	taskDomain, err := s.Repos.Task.GetTask(ctx, request.TaskId)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			return api.GetTask404JSONResponse{}, nil
		}
		return nil, err
	}
	return api.GetTask200JSONResponse(TaskDomainToModel(taskDomain)), nil
}

// タスク更新
// (PUT /tasks/{taskId})
func (s *Server) UpdateTask(ctx context.Context, request api.UpdateTaskRequestObject) (api.UpdateTaskResponseObject, error) {
	taskDomain := domain.Task{
		TaskId:          request.Body.TaskId,
		UserId:          request.Body.UserId,
		Title:           request.Body.Title,
		TaskDescription: request.Body.TaskDescription,
		CreatedAt:       request.Body.CreatedAt,
		UpdatedAt:       request.Body.UpdatedAt,
		CreatedBy:       request.Body.CreatedBy,
		UpdatedBy:       request.Body.UpdatedBy,
	}
	if err := taskDomain.Validate(); err != nil {
		// TODO CreateTask400JSONResponseとか、バリデーションチェックに引っかかった場合のエラーを定義する
		return nil, err
	}
	task, err := s.Repos.Task.UpdateTask(ctx, taskDomain)
	if err != nil {
		return nil, err
	}
	return api.UpdateTask200JSONResponse(TaskDomainToModel(task)), nil
}

// タスク削除
// (DELETE /tasks/{taskId})
func (s *Server) DeleteTask(ctx context.Context, request api.DeleteTaskRequestObject) (api.DeleteTaskResponseObject, error) {
	err := s.Repos.Task.DeleteTask(ctx, request.TaskId)
	if err != nil {
		return nil, err
	}
	return api.DeleteTask204Response{}, nil
}

func TaskDomainToModel(task domain.Task) api.Task {
	return api.Task{
		TaskId:          openapi_types.UUID(task.TaskId),
		UserId:          openapi_types.UUID(task.UserId),
		Title:           task.Title,
		TaskDescription: task.TaskDescription,
		CreatedAt:       task.CreatedAt,
		UpdatedAt:       task.UpdatedAt,
		CreatedBy:       openapi_types.UUID(task.CreatedBy),
		UpdatedBy:       openapi_types.UUID(task.UpdatedBy),
	}
}
