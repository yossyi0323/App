package presentation

import (
	"back-end/api"
	"back-end/domain"
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

// タイムスロット一覧取得
// (GET /timeSlots)
func (s *Server) GetTimeSlots(ctx context.Context, request api.GetTimeSlotsRequestObject) (api.GetTimeSlotsResponseObject, error) {
	// TODO: 認証機能実装後に、コンテキストからユーザーIDを取得する形に移行する
	timeSlots, err := s.Repos.TimeSlot.GetTimeSlots(ctx, uuid.UUID(request.Params.UserId), request.Params.StartAt, request.Params.EndAt)
	if err != nil {
		return nil, err
	}

	responseList := []api.TimeSlot{}
	for _, ts := range timeSlots {
		responseList = append(responseList, TimeSlotDomainToModel(ts))
	}

	return api.GetTimeSlots200JSONResponse{
		TimeSlots: &responseList,
	}, nil
}

// タイムスロット詳細取得
// (GET /timeSlots/{timeSlotId})
func (s *Server) GetTimeSlot(ctx context.Context, request api.GetTimeSlotRequestObject) (api.GetTimeSlotResponseObject, error) {
	// TODO: 認証機能実装後に、コンテキストからユーザーIDを取得する形に移行する
	timeSlot, err := s.Repos.TimeSlot.GetTimeSlot(ctx, uuid.UUID(request.TimeSlotId))
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			// OpenAPIに404がないためエラーを返す
			return nil, err
		}
		return nil, err
	}

	return api.GetTimeSlot200JSONResponse(TimeSlotDomainToModel(timeSlot)), nil
}

// タイムスロット作成
// (POST /timeSlots)
func (s *Server) CreateTimeSlot(ctx context.Context, request api.CreateTimeSlotRequestObject) (api.CreateTimeSlotResponseObject, error) {
	if request.Body == nil {
		return nil, errors.New("request body is required")
	}

	reqBody := request.Body

	now := time.Now()
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}

	newTimeSlot := domain.TimeSlot{
		TimeSlotId: id,
		UserId:     uuid.UUID(reqBody.UserId),
		TaskId:     uuid.UUID(reqBody.TaskId),
		Allocation: string(reqBody.Allocation),
		StartAt:    reqBody.StartAt,
		EndAt:      reqBody.EndAt,
		ExtData:    reqBody.ExtData,
		CreatedAt:  now,
		UpdatedAt:  now,
		// TODO: 認証機能実装後に修正
		CreatedBy: uuid.UUID(reqBody.CreatedBy),
		UpdatedBy: uuid.UUID(reqBody.UpdatedBy),
	}

	// バリデーション
	if err := newTimeSlot.Validate(); err != nil {
		return nil, err
	}

	createdTimeSlot, err := s.Repos.TimeSlot.CreateTimeSlot(ctx, newTimeSlot)
	if err != nil {
		return nil, err
	}

	return api.CreateTimeSlot201JSONResponse(TimeSlotDomainToModel(createdTimeSlot)), nil
}

// タイムスロット更新
// (PUT /timeSlots/{timeSlotId})
func (s *Server) UpdateTimeSlot(ctx context.Context, request api.UpdateTimeSlotRequestObject) (api.UpdateTimeSlotResponseObject, error) {
	if request.Body == nil {
		return nil, errors.New("request body is required")
	}

	reqBody := request.Body

	// 更新対象のデータを構築
	updateTimeSlot := domain.TimeSlot{
		TimeSlotId: uuid.UUID(request.TimeSlotId), // PathパラメータのIDを使用
		// UserId等は本来DBから取得して不整合がないかチェックすべきだが、
		// ここではリクエストボディの値を信頼する（または上書きする）
		// TODO: 認証機能実装後に修正
		UserId:     uuid.UUID(reqBody.UserId),
		TaskId:     uuid.UUID(reqBody.TaskId),
		Allocation: string(reqBody.Allocation),
		StartAt:    reqBody.StartAt,
		EndAt:      reqBody.EndAt,
		ExtData:    reqBody.ExtData,
		UpdatedAt:  reqBody.UpdatedAt,
		UpdatedBy:  uuid.UUID(reqBody.UpdatedBy),
	}

	// バリデーション
	if err := updateTimeSlot.Validate(); err != nil {
		return nil, err
	}

	updated, err := s.Repos.TimeSlot.UpdateTimeSlot(ctx, updateTimeSlot)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			// OpenAPIに404がないためエラーを返す
			return nil, err
		}
		return nil, err
	}

	return api.UpdateTimeSlot200JSONResponse(TimeSlotDomainToModel(updated)), nil
}

// タイムスロット削除
// (DELETE /timeSlots/{timeSlotId})
func (s *Server) DeleteTimeSlot(ctx context.Context, request api.DeleteTimeSlotRequestObject) (api.DeleteTimeSlotResponseObject, error) {
	err := s.Repos.TimeSlot.DeleteTimeSlot(ctx, uuid.UUID(request.TimeSlotId))
	if err != nil {
		return nil, err
	}
	return api.DeleteTimeSlot204Response{}, nil
}

func TimeSlotDomainToModel(timeSlot domain.TimeSlot) api.TimeSlot {
	return api.TimeSlot{
		TimeSlotId: openapi_types.UUID(timeSlot.TimeSlotId),
		UserId:     openapi_types.UUID(timeSlot.UserId),
		TaskId:     openapi_types.UUID(timeSlot.TaskId),
		Allocation: timeSlot.Allocation,
		StartAt:    timeSlot.StartAt,
		EndAt:      timeSlot.EndAt,
		ExtData:    timeSlot.ExtData,
		CreatedAt:  timeSlot.CreatedAt,
		UpdatedAt:  timeSlot.UpdatedAt,
		CreatedBy:  openapi_types.UUID(timeSlot.CreatedBy),
		UpdatedBy:  openapi_types.UUID(timeSlot.UpdatedBy),
	}
}
