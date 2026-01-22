package com.project.omdb.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OmdbService {

    @Value("${omdb.api.url}")
    private String omdbApiUrl;

    @Value("${omdb.api.key}")
    private String omdbApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable(value = "searchCache", key = "#title")
    public Map searchMovies(String title) {
        String url = omdbApiUrl +
                "?apikey=" + omdbApiKey +
                "&s=" + title;

        System.out.println("Calling OMDB API for search: " + title);
        return restTemplate.getForObject(url, Map.class);
    }

    @Cacheable(value = "movieCache", key = "#imdbId")
    public Map getMovieDetails(String imdbId) {

        String url = omdbApiUrl +
                "?apikey=" + omdbApiKey +
                "&i=" + imdbId +
                "&plot=full";

        return restTemplate.getForObject(url, Map.class);
    }
}
