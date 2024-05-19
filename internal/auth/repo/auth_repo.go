package repo

import (
	"context"

	"github.com/channel-io/app-tutorial/internal/auth/model"
	"github.com/channel-io/app-tutorial/internal/cache"

	"github.com/pkg/errors"
)

type AuthRepo interface {
	Save(ctx context.Context, token model.Token) (model.Token, error)
	Get(ctx context.Context, token model.Token) (model.Token, error)
}

func NewAuthRepo(cache *cache.Cache) AuthRepo {
	return &authRepo{cache}
}

type authRepo struct {
	cache *cache.Cache
}

func (r *authRepo) Save(ctx context.Context, token model.Token) (model.Token, error) {
	if ok := r.cache.Set(token.Key(), token, token.Duration()); !ok {
		return nil, errors.Errorf("failed to save token, %s", token.Key())
	}
	return token, nil
}

func (r *authRepo) Get(ctx context.Context, key model.Token) (model.Token, error) {
	v, found := r.cache.Get(key.Key())
	if !found {
		return nil, errors.Errorf("token %s not found", key.Key())
	}

	save, ok := v.(model.Token)
	if !ok {
		return nil, errors.Errorf("invalid token, %v", v)
	}

	return save, nil
}
