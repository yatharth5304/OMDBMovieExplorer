package com.project.omdb.controller;

import com.project.omdb.model.Favorite;
import com.project.omdb.service.FavoriteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService service;

    public FavoriteController(FavoriteService service) {
        this.service = service;
    }

    @PostMapping
    public Favorite addFavorite(@RequestBody Favorite favorite) {
        return service.addFavorite(favorite);
    }

    @GetMapping
    public List<Favorite> getFavorites() {
        return service.getAllFavorites();
    }

    @DeleteMapping("/{id}")
    public void deleteFavorite(@PathVariable Long id) {
        service.deleteFavorite(id);
    }
}
