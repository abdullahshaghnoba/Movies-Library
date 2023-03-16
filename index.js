'use strict';

const express = require('express');

const cors = require('cors');

const axios = require('axios');

const data = require('./movie-data/data.json');

const pg = require('pg');

require('dotenv').config();

const server = express();

server.use(cors());


const PORT = process.env.PORT || 3500;

const client = new pg.Client(process.env.DATABASE_URL);

function Movies(id, title, release_date, poster_path, overview, name) {
    this.id = id,
        this.title = title || name,
        this.release_date = release_date,
        this.poster_path = poster_path,
        this.overview = overview
}

let newMovie = new Movies(data.id, data.title, data.release_date, data.poster_path, data.overview)

let APIKye = process.env.APIKye;
//////////////////////////// parse the post output ///////////////////////
server.use(express.json());
// Routs 
///////////////////////// Home Route ////////////
server.get('/', homeRoutHandler);
///////////////////////// Favorite Route ////////////
server.get('/Favorite', favoriteRoutHandler)
////////////////////////// Trending Rout ///////////////////////
server.get('/trending', trendingHandler);
///////////////////////////  search Rout  ////////////////////////////////
server.get('/search', searchRoutHandler);
/////////////////////////// network Rout   /////////////////////////////////////////
server.get('/network', networkRoutHandler);
////////////////////////// People Rout /////////////////////////////////////////////
server.get('/people', peopleRoutHandler);
////////////////////////// favmovie get  Rout /////////////////////////
server.get('/getMovies', getMoviesHandler);
//////////////////////////// favmovie post  Rout ////////////////////////////
server.post('/getMovie', postMoviesHandler);
/////////////////////////// favmovie put Rout /////////////////////////////
server.put('/getMovie/:id', putMoviesHandler);
/////////////////////////// favmovie delete Rout //////////////////////////
server.delete('/getmovie/:id', deleteMoviesHandler);
///////////////////////// favmovie get by id Rout ////////////////////////
server.get('/getmovie/:id', getMoviesByIdHandler);
///////////////////////// page not found Route ////////////
server.get('*', pageNotFoundHandler);
///////////////////////////// error 500 Rout ///////////////////
server.use(errorHandler);

////////////////////////////////// Handlers ////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Home Rout Handler //////////
function homeRoutHandler(req, res) {
    res.send(newMovie);
}
//////////////////////// Favorite Rout Handler //////////
function favoriteRoutHandler(req, res) {
    let message = "Welcome to Favorite Page"
    res.status(200).send(message);
}
/////////////// Trending Rout Handler ////////////
function trendingHandler(req, res) {
    try {
        const trendingURL = `https://api.themoviedb.org/3/trending/all/week?api_key=${APIKye}&language=en-US`

        axios.get(trendingURL)
            .then((trendingAxiosResult) => {

                let maptrendingRes = trendingAxiosResult.data.results.map((element) => {
                    let newMovieTrending = new Movies(element.id, element.title, element.release_date, element.poster_path, element.overview, element.name);
                    return newMovieTrending
                })
                res.send(maptrendingRes);
            })
            .catch((error) => {
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res);
    }

}
///////////////////////////  search Rout Handler ////////////////////////////////
function searchRoutHandler(req, res) {
    try {
        const searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${APIKye}&language=en-US&query=The&page=2`

        axios.get(searchURL)
            .then((searchAxiosResult) => {

                let mapsearchRes = searchAxiosResult.data.results.map((element) => {
                    let newMoviesearch = new Movies(element.id, element.title, element.release_date, element.poster_path, element.overview, element.name);
                    return newMoviesearch
                })
                res.send(mapsearchRes);
            })
            .catch((error) => {
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res);
    }

}
///////////////////////////// network Rout Handler /////////////////////////////////////
function networkRoutHandler(req, res) {
    try {
        const networkURL = `https://api.themoviedb.org/3/network/3?api_key=${APIKye}`

        axios.get(networkURL)
            .then((networkAxiosResult) => {
                res.send(networkAxiosResult.data);
            })
            .catch((error) => {
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res);
    }

}
///////////////////////////////// People Rout Handler /////////////////////////////////
function peopleRoutHandler(req, res) {
    try {
        const peopleURL = `https://api.themoviedb.org/3/person/5?api_key=${APIKye}&language=en-US`

        axios.get(peopleURL)
            .then((peopleAxiosResult) => {
                res.send(peopleAxiosResult.data);
            })
            .catch((error) => {
                res.status(500).send(error);
            })
    }
    catch (error) {
        errorHandler(error, req, res);
    }

}
///////////////////////////////// Get Movies Rout Handler ///////////////////////////////
function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM favmovie`;
    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
}
////////////////////////////// post Movies Rout Handler //////////////////////////////////////
function postMoviesHandler(req, res) {
    const movie = req.body;
    const sql = `INSERT INTO favmovie (movieTitle, release_date, poster_path, overview, comment)
    VALUES('${movie.movieTitle}','${movie.release_date}' ,'${movie.poster_path}' ,'${movie.overview}','${movie.comment}') ;`

    client.query(sql)
        .then((data) => {
            res.send("added successfully");
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
}
///////////////////////////// put Movies Handler /////////////////////////////////////////////
function putMoviesHandler(req, res) {
    const update = req.body;
    const id = req.params.id;
    const sql = `UPDATE favmovie SET comment=$1 WHERE id='${id}' RETURNING *`;
    const values = [update.comment];
    client.query(sql, values)
        .then((data) => {
            const sql = `SELECT * FROM favmovie`;
            client.query(sql)
                .then((data) => {
                    res.send(data.rows);
                })
                .catch((err) => {
                    errorHandler(err, req, res);
                })
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })

}
///////////////////////// delete Movies Handler ///////////////////////////////////
function deleteMoviesHandler(req, res) {
    const update = req.body;
    const id = req.params.id;
    let sql = `DELETE FROM favmovie WHERE id=${id} RETURNING *`;
    client.query(sql)
        .then((data) => {
            res.status(204).send({});

        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
}
//////////////////////// get Movies By Id Handler /////////////////////////////////////////////
function getMoviesByIdHandler(req, res) {
    const id = req.params.id;
    const sql = `SELECT * FROM favmovie WHERE id=${id}`;
    client.query(sql)
        .then((data) => {
            res.send(data.rows);
        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
}
//////////////////////// middleware function error Handler //////////////////////
function errorHandler(error, req, res) {
    const err = {
        status: 500,
        massage: error
    }
    res.status(500).send(err);
}
/////////////////////////////////// Page Not Found Handler /////////////////////////////////
function pageNotFoundHandler(req, res) {
    res.status(404).send("page not found");
}
// http://localhost:3500
client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Hi ${PORT}`)
        });
    })
    .catch((err) => {
        errorHandler(err, req, res);
    })