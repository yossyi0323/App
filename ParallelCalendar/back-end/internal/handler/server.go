package handler

import (
	"back-end/api"
	"back-end/domain"
	"back-end/repository"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type Server struct {
	Repos *repository.Repositories
}

func NewServer(repos *repository.Repositories) *Server {
	return &Server{
		Repos: repos,
	}
}

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
		if errors.Is(err, pgx.ErrNoRows) {
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

// タイムスロット一覧取得
// (GET /timeSlots)
func (s *Server) GetTimeSlots(ctx context.Context, request api.GetTimeSlotsRequestObject) (api.GetTimeSlotsResponseObject, error) {
	return api.GetTimeSlots200JSONResponse{}, nil
}

// タイムスロット詳細取得
// (GET /timeSlots/{timeSlotId})
func (s *Server) GetTimeSlot(ctx context.Context, request api.GetTimeSlotRequestObject) (api.GetTimeSlotResponseObject, error) {
	return api.GetTimeSlot200JSONResponse{}, nil
}

// タイムスロット作成
// (POST /timeSlots)
func (s *Server) CreateTimeSlot(ctx context.Context, request api.CreateTimeSlotRequestObject) (api.CreateTimeSlotResponseObject, error) {
	return api.CreateTimeSlot201JSONResponse{}, nil
}

// タイムスロット更新
// (PUT /timeSlots/{timeSlotId})
func (s *Server) UpdateTimeSlot(ctx context.Context, request api.UpdateTimeSlotRequestObject) (api.UpdateTimeSlotResponseObject, error) {
	return api.UpdateTimeSlot200JSONResponse{}, nil
}

// タイムスロット削除
// (DELETE /timeSlots/{timeSlotId})
func (s *Server) DeleteTimeSlot(ctx context.Context, request api.DeleteTimeSlotRequestObject) (api.DeleteTimeSlotResponseObject, error) {
	return api.DeleteTimeSlot204Response{}, nil
}
