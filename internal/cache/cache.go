package cache

import (
	"time"

	"github.com/dgraph-io/ristretto"
)

func init() {
	cc, err := Init()
	if err != nil {
		panic(err)
	}
	cache = cc
}

var cache *Cache

type Cache struct {
	cache *ristretto.Cache
}

func Init() (*Cache, error) {
	rc, err := ristretto.NewCache(
		&ristretto.Config{
			NumCounters: 1000,
			MaxCost:     1 << 10,
			BufferItems: 32,
		},
	)
	if err != nil {
		return nil, err
	}

	return &Cache{rc}, nil
}

func Get() *Cache {
	return cache
}

func (cc *Cache) Set(key string, value interface{}, duration time.Duration) {
	cc.cache.SetWithTTL(key, value, 0, duration)
}

func (cc *Cache) Get(key string) (interface{}, bool) {
	return cc.cache.Get(key)
}
