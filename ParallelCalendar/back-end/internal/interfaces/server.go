package interfaces

import (
	"back-end/repository"
)

type Server struct {
	Repos *repository.Repositories
}

func NewServer(repos *repository.Repositories) *Server {
	return &Server{
		Repos: repos,
	}
}
