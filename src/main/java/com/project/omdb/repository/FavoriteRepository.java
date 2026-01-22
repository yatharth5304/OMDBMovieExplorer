package com.project.omdb.repository;

import com.project.omdb.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByImdbId(String imdbId);
}
