DROP TABLE IF EXISTS addedmovie;

CREATE TABLE IF NOT EXISTS addedmovie(
    id SERIAL PRIMARY KEY,
    title  VARCHAR(255),
    release_date INT,
    poster_path VARCHAR(500),
    overview VARCHAR(1000),
    comment VARCHAR(255)
);