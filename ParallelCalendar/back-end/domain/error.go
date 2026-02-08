package domain

import (
	"errors"
)

// domain共通エラーを定義
var (
	ErrNotFound = errors.New("指定されたリソースが見つかりませんでした")
)
