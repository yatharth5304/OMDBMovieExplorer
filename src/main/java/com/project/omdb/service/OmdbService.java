package com.project.omdb.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Service
public class OmdbService {

    private static final Logger log = LoggerFactory.getLogger(OmdbService.class);

    @Value("${omdb.api.url}")
    private String omdbApiUrl;

    @Value("${omdb.api.key}")
    private String omdbApiKey;

    private final RestTemplate restTemplate;

    public OmdbService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Cacheable(value = "searchCache", key = "#title")
    public Map searchMovies(String title) {
        URI uri = UriComponentsBuilder.fromUriString(omdbApiUrl)
                .queryParam("apikey", omdbApiKey)
                .queryParam("s", title)
                .build()
                .toUri();

        log.info("Calling OMDB API for search: {}", title);
        return restTemplate.getForObject(uri, Map.class);
    }

    @Cacheable(value = "movieCache", key = "#imdbId")
    public Map getMovieDetails(String imdbId) {
        URI uri = UriComponentsBuilder.fromUriString(omdbApiUrl)
                .queryParam("apikey", omdbApiKey)
                .queryParam("i", imdbId)
                .queryParam("plot", "full")
                .build()
                .toUri();

        log.info("Calling OMDB API for details: {}", imdbId);
        return restTemplate.getForObject(uri, Map.class);
    }
}

