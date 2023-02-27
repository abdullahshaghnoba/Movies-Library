DROP TABLE IF EXISTS favmovie ;

CREATE TABLE IF NOT EXISTS favmovie (
    id SERIAL PRIMARY KEY,
    movieTitle VARCHAR(255),
    release_date VARCHAR(255),
    poster_path VARCHAR(1000),
    overview VARCHAR(1000)
);