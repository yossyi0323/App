package handler

import (
	"back-end/api"
	"back-end/internal/db"
	"encoding/json"
	"net/http"

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
func (s *Server) GetTasks(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode([]api.Task{})
}

// タスク詳細取得
// (GET /tasks/{taskId})
func (s *Server) GetTask(w http.ResponseWriter, r *http.Request, taskId openapi_types.UUID) {

	// TODO: UUIDをpgtype.UUIDに変換してDBからデータ取得して戻り値にセットする
	ctx := r.Context()
	task, err := s.Queries.GetTask(ctx, pgtype.UUID{})
	var res api.Task

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(api.Task{})
}

// タスク作成
// (POST /tasks)
func (s *Server) CreateTask(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusCreated)
}

// タスク更新
// (PUT /tasks/{taskId})
func (s *Server) UpdateTask(w http.ResponseWriter, r *http.Request, taskId openapi_types.UUID) {
	w.WriteHeader(http.StatusOK)
}

// タスク削除
// (DELETE /tasks/{taskId})
func (s *Server) DeleteTask(w http.ResponseWriter, r *http.Request, taskId openapi_types.UUID) {
	w.WriteHeader(http.StatusNoContent)
}

// タイムスロット一覧取得
// (GET /timeSlots)
func (s *Server) GetTimeSlots(w http.ResponseWriter, r *http.Request, params api.GetTimeSlotsParams) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(api.TimeSlotList{TimeSlots: &[]api.TimeSlot{}})
}

// タイムスロット詳細取得
// (GET /timeSlots/{timeSlotId})
func (s *Server) GetTimeSlot(w http.ResponseWriter, r *http.Request, timeSlotId openapi_types.UUID) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(api.TimeSlot{})
}

// タイムスロット作成
// (POST /timeSlots)
func (s *Server) CreateTimeSlot(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusCreated)
}

// タイムスロット更新
// (PUT /timeSlots/{timeSlotId})
func (s *Server) UpdateTimeSlot(w http.ResponseWriter, r *http.Request, timeSlotId openapi_types.UUID) {
	w.WriteHeader(http.StatusOK)
}

// タイムスロット削除
// (DELETE /timeSlots/{timeSlotId})
func (s *Server) DeleteTimeSlot(w http.ResponseWriter, r *http.Request, timeSlotId openapi_types.UUID) {
	w.WriteHeader(http.StatusNoContent)
}
