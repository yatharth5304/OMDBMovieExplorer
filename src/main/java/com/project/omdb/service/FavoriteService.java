package com.project.omdb.service;

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
        if (repository.existsByImdbId(favorite.getImdbId())) {
            return null; // prevent duplicates
        }
        return repository.save(favorite);
    }

    public List<Favorite> getAllFavorites() {
        return repository.findAll();
    }

    public void deleteFavorite(Long id) {
        repository.deleteById(id);
    }
}
