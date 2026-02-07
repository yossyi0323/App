package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func ConvertUUIDToPgtype(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{Bytes: id, Valid: true}
}

func ConvertUUID(id pgtype.UUID) uuid.UUID {
	return uuid.UUID(id.Bytes)
}

func ConvertStringToPgtype(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: true}
}

func ConvertString(t pgtype.Text) string {
	return t.String
}

func ConvertTimeStampToPgtype(t time.Time) pgtype.Timestamp {
	return pgtype.Timestamp{Time: t, Valid: true}
}

func ConvertTimeStamp(t pgtype.Timestamp) time.Time {
	return t.Time
}
