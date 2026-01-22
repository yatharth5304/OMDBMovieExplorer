package com.project.omdb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class OmdbMovieExplorerApplication {

	public static void main(String[] args) {
		SpringApplication.run(OmdbMovieExplorerApplication.class, args);
	}

}
