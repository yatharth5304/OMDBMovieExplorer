package com.project.omdb.service;

import com.project.omdb.exception.AlreadyExistsException;
import com.project.omdb.exception.ResourceNotFoundException;
import com.project.omdb.model.Favorite;
import com.project.omdb.repository.FavoriteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository repository;

    public FavoriteService(FavoriteRepository repository) {
        this.repository = repository;
    }

    public Favorite addFavorite(Favorite favorite) {
        if (favorite.getImdbId() == null || favorite.getImdbId().isBlank()) {
            throw new IllegalArgumentException("imdbId is required.");
        }
        if (repository.existsByImdbId(favorite.getImdbId())) {
            throw new AlreadyExistsException("Movie '" + favorite.getTitle() + "' is already in favorites.");
        }
        return repository.save(favorite);
    }

    public List<Favorite> getAllFavorites() {
        return repository.findAll();
    }

    public void deleteFavorite(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Favorite with id " + id + " not found.");
        }
        repository.deleteById(id);
    }
}

