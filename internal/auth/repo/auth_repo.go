package repo

import (
	"context"
	"errors"

	"github.com/channel-io/app-tutorial/internal/auth/model"
	"github.com/channel-io/app-tutorial/internal/cache"
)

type AuthRepo interface {
	Save(ctx context.Context, token model.Token) (model.Token, error)
	Get(ctx context.Context, mock model.Token) (model.Token, error)
}

func NewAuthRepo() AuthRepo {
	return &authRepo{}
}

type authRepo struct{}

func (r *authRepo) Save(ctx context.Context, token model.Token) (model.Token, error) {
	cc := cache.Get()
	cc.Set(token.Key(), token, token.Duration())

	saved, err := r.Get(ctx, token)
	if err != nil {
		return nil, err
	}

	return saved, nil
}

func (r *authRepo) Get(ctx context.Context, mock model.Token) (model.Token, error) {
	cc := cache.Get()
	v, found := cc.Get(mock.Key())
	if !found {
		return nil, errors.New("token not found")
	}

	save, ok := v.(model.Token)
	if !ok {
		return nil, errors.New("broken token")
	}

	return save, nil
}
