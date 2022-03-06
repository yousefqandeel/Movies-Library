DROP TABLE IF EXISTS addMovie;

CREATE TABLE IF NOT EXISTS addMovie(
id SERIAL PRIMARY KEY,
title VARCHAR(1000),
release_date DATE,
poster_path VARCHAR(1000),
overview VARCHAR(1000),
my_comment VARCHAR(1000)
);