package interfaces

import (
	"back-end/api"
	"context"
)

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
