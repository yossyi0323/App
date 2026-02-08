package repository

import (
	"back-end/domain"
	"back-end/internal/db"
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type TimeSlotRepository struct {
	Queries *db.Queries
}

func NewTimeSlotRepository(queries *db.Queries) *TimeSlotRepository {
	return &TimeSlotRepository{Queries: queries}
}

func (r *TimeSlotRepository) CreateTimeSlot(ctx context.Context, timeSlot domain.TimeSlot) (domain.TimeSlot, error) {
	extDataBytes, err := marshalExtData(timeSlot.ExtData)
	if err != nil {
		return domain.TimeSlot{}, err
	}

	result, err := r.Queries.CreateTimeSlot(ctx, db.CreateTimeSlotParams{
		TimeSlotID: ConvertUUIDToPgtype(timeSlot.TimeSlotId),
		UserID:     ConvertUUIDToPgtype(timeSlot.UserId),
		TaskID:     ConvertUUIDToPgtype(timeSlot.TaskId),
		Allocation: timeSlot.Allocation,
		StartAt:    ConvertTimeStampToPgtype(timeSlot.StartAt),
		EndAt:      ConvertTimeStampToPgtype(timeSlot.EndAt),
		ExtData:    extDataBytes,
		CreatedAt:  ConvertTimeStampToPgtype(timeSlot.CreatedAt),
		UpdatedAt:  ConvertTimeStampToPgtype(timeSlot.UpdatedAt),
		CreatedBy:  ConvertUUIDToPgtype(timeSlot.CreatedBy),
		UpdatedBy:  ConvertUUIDToPgtype(timeSlot.UpdatedBy),
	})
	if err != nil {
		return domain.TimeSlot{}, err
	}
	return TimeSlotEntityToDomain(result)
}

func (r *TimeSlotRepository) GetTimeSlots(ctx context.Context, userId uuid.UUID, startAt, endAt time.Time) ([]domain.TimeSlot, error) {
	results, err := r.Queries.GetTimeSlots(ctx, db.GetTimeSlotsParams{
		UserID:  ConvertUUIDToPgtype(userId),
		StartAt: ConvertTimeStampToPgtype(startAt),
		EndAt:   ConvertTimeStampToPgtype(endAt),
	})
	if err != nil {
		return nil, err
	}

	timeSlots := []domain.TimeSlot{}
	for _, result := range results {
		ts, err := TimeSlotEntityToDomain(result)
		if err != nil {
			return nil, err
		}
		timeSlots = append(timeSlots, ts)
	}
	return timeSlots, nil
}

func (r *TimeSlotRepository) GetTimeSlot(ctx context.Context, timeSlotId uuid.UUID) (domain.TimeSlot, error) {
	result, err := r.Queries.GetTimeSlot(ctx, ConvertUUIDToPgtype(timeSlotId))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.TimeSlot{}, domain.ErrNotFound
		}
		return domain.TimeSlot{}, err
	}
	return TimeSlotEntityToDomain(result)
}

func (r *TimeSlotRepository) UpdateTimeSlot(ctx context.Context, timeSlot domain.TimeSlot) (domain.TimeSlot, error) {
	extDataBytes, err := marshalExtData(timeSlot.ExtData)
	if err != nil {
		return domain.TimeSlot{}, err
	}

	result, err := r.Queries.UpdateTimeSlot(ctx, db.UpdateTimeSlotParams{
		TimeSlotID: ConvertUUIDToPgtype(timeSlot.TimeSlotId),
		TaskID:     ConvertUUIDToPgtype(timeSlot.TaskId),
		Allocation: timeSlot.Allocation,
		StartAt:    ConvertTimeStampToPgtype(timeSlot.StartAt),
		EndAt:      ConvertTimeStampToPgtype(timeSlot.EndAt),
		ExtData:    extDataBytes,
		UpdatedAt:  ConvertTimeStampToPgtype(timeSlot.UpdatedAt),
		UpdatedBy:  ConvertUUIDToPgtype(timeSlot.UpdatedBy),
	})
	if err != nil {
		return domain.TimeSlot{}, err
	}
	return TimeSlotEntityToDomain(result)
}

func (r *TimeSlotRepository) DeleteTimeSlot(ctx context.Context, timeSlotId uuid.UUID) error {
	return r.Queries.DeleteTimeSlot(ctx, ConvertUUIDToPgtype(timeSlotId))
}

func TimeSlotEntityToDomain(entity db.TTimeSlot) (domain.TimeSlot, error) {
	var extData map[string]interface{}
	if entity.ExtData != nil {
		if err := json.Unmarshal(entity.ExtData, &extData); err != nil {
			return domain.TimeSlot{}, err
		}
	}

	return domain.TimeSlot{
		TimeSlotId: ConvertUUID(entity.TimeSlotID),
		UserId:     ConvertUUID(entity.UserID),
		TaskId:     ConvertUUID(entity.TaskID),
		Allocation: entity.Allocation,
		StartAt:    entity.StartAt.Time,
		EndAt:      entity.EndAt.Time,
		ExtData:    &extData,
		CreatedAt:  entity.CreatedAt.Time,
		UpdatedAt:  entity.UpdatedAt.Time,
		CreatedBy:  ConvertUUID(entity.CreatedBy),
		UpdatedBy:  ConvertUUID(entity.UpdatedBy),
	}, nil
}

func marshalExtData(data *map[string]interface{}) ([]byte, error) {
	if data == nil {
		return nil, nil
	}
	return json.Marshal(data)
}
