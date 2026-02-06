package handler

import (
	"back-end/api"
	"back-end/internal/db"
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type Server struct {
	Queries *db.Queries
}

func NewServer(queries *db.Queries) *Server {
	return &Server{
		Queries: queries,
	}
}

// タスク一覧取得
// (GET /tasks)
func (s *Server) GetTasks(ctx context.Context, request api.GetTasksRequestObject) (api.GetTasksResponseObject, error) {
	return api.GetTasks200JSONResponse{}, nil
}

// タスク詳細取得
// (GET /tasks/{taskId})
func (s *Server) GetTask(ctx context.Context, request api.GetTaskRequestObject) (api.GetTaskResponseObject, error) {

	// TODO: UUIDをpgtype.UUIDに変換してDBからデータ取得して戻り値にセットする
	// ctx := r.Context()
	// task, err := s.Queries.GetTask(ctx, pgtype.UUID{})
	// var res api.Task

	return api.GetTask200JSONResponse{}, nil
}

// タスク作成
// (POST /tasks)
func (s *Server) CreateTask(ctx context.Context, request api.CreateTaskRequestObject) (api.CreateTaskResponseObject, error) {
	task, err := s.Queries.CreateTask(ctx, db.CreateTaskParams{
		TaskID:          pgtype.UUID{Bytes: request.Body.TaskId, Valid: true},
		UserID:          pgtype.UUID{Bytes: request.Body.UserId, Valid: true},
		Title:           request.Body.Title,
		TaskDescription: pgtype.Text{String: *request.Body.TaskDescription, Valid: request.Body.TaskDescription != nil},
		CreatedAt:       pgtype.Timestamp{Time: request.Body.CreatedAt, Valid: true},
		UpdatedAt:       pgtype.Timestamp{Time: request.Body.UpdatedAt, Valid: true},
		CreatedBy:       pgtype.UUID{Bytes: request.Body.CreatedBy, Valid: true},
		UpdatedBy:       pgtype.UUID{Bytes: request.Body.UpdatedBy, Valid: true},
	})

	if err != nil {
		return nil, err // これで自動的に Internal Server Error になります
	}

	// 取得した task (db型) を api.Task (API型) に変換して返す
	return api.CreateTask201JSONResponse{
		TaskId:          openapi_types.UUID(task.TaskID.Bytes),
		UserId:          openapi_types.UUID(task.UserID.Bytes),
		Title:           task.Title,
		TaskDescription: &task.TaskDescription.String,
		CreatedAt:       task.CreatedAt.Time,
		UpdatedAt:       task.UpdatedAt.Time,
		CreatedBy:       openapi_types.UUID(task.CreatedBy.Bytes),
		UpdatedBy:       openapi_types.UUID(task.UpdatedBy.Bytes),
	}, nil
}

// タスク更新
// (PUT /tasks/{taskId})
func (s *Server) UpdateTask(ctx context.Context, request api.UpdateTaskRequestObject) (api.UpdateTaskResponseObject, error) {
	return api.UpdateTask200JSONResponse{}, nil
}

// タスク削除
// (DELETE /tasks/{taskId})
func (s *Server) DeleteTask(ctx context.Context, request api.DeleteTaskRequestObject) (api.DeleteTaskResponseObject, error) {
	return api.DeleteTask204Response{}, nil
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
