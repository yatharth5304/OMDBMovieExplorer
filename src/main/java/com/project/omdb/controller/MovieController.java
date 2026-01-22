package com.project.omdb.controller;

import com.project.omdb.service.OmdbService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class MovieController {

    private final OmdbService omdbService;

    public MovieController(OmdbService omdbService) {
        this.omdbService = omdbService;
    }

    @GetMapping("/search")
    public Map searchMovies(@RequestParam("title") String title) {
        return omdbService.searchMovies(title);
    }

    @GetMapping("/movie/{imdbId}")
    public Map getMovieDetails(@PathVariable String imdbId) {
        return omdbService.getMovieDetails(imdbId);
    }
}
