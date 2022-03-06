'use strict';

const express = require("express");
const movie = require("./data.json");
const app = express();
const axios = require("axios");
const dotenv = require("dotenv");
const pg = require('pg');
dotenv.config();
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

function selectData(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date
    this.poster_path = poster_path;
    this.overview = overview;
}
app.use(express.json());
app.get('/', homePageHandler);
app.get('/favorite', favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);
app.get('/discover', discoverHandler);
app.get("/upcoming", upcomingPageHandler);
app.post('/addmovie', addMovieDB);
app.get('/getmovie', getMovieDB)
app.put('/updatecomment/:id', updateCommentDB);
app.get('/getmovie/:id', getMovieDBID);
app.delete('/deletemovie/:id', deleteMovieDB)
app.get('*', notFounderrorHandler);
app.use(errorHandler);

function homePageHandler(req, res) {
    let result = [];

    let oneMovie = new selectData(movie.id, movie.title || "N/A", movie.release_date, movie.poster_path || "N/A", movie.overview || "N/A");
    result.push(oneMovie);


    return res.status(200).json(result);
}
function favoritePageHandler(req, res) {

    return res.status(200).send("Welcome to Favorite Page!!");
}
function trendingPageHandler(req, res) {
    let results = []
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=37ddc7081e348bf246a42f3be2b3dfd0&language=en-US`)
        .then(getResponse => {
            getResponse.data.results.map(value => {
                let newMovie = new selectData(value.id, value.title, value.release_date, value.poster_path, value.overview);
                results.push(newMovie);
            })
            res.status(200).json(results);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}
function searchPageHandler(req, res) {
    const search = req.query.Movie;
    let result = [];
    console.log(req);
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}&page=2`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneMovie = new selectData(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        });
}

function discoverHandler(req, res) {
    let results = [];

    axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=37ddc7081e348bf246a42f3be2b3dfd0&language=en-US`)
        .then(getResponse => {
            getResponse.data.results.map(value => {
                let discover = new selectData(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
                results.push(discover);
            })
            return res.status(200).json(getResponse.data);
        }).catch(error => {
            errorHandler(error, req, res);
        })
}

function upcomingPageHandler(req, res) {
    let upcoming = [];
    axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=37ddc7081e348bf246a42f3be2b3dfd0&language=en-US&page=1`)
        .then((value) => {
            value.data.results.forEach((value) => {
                value = new selectData(value.id, value.title, value.release_date, value.poster_path, value.overview);
                upcoming.push(value);
            });
            return res.status(200).json(value.data);
        });
};

function addMovieDB(req, res) {
    const movie = req.body;
    console.log(movie);
    const sql = `INSERT INTO addedmovie(title, release_date, poster_path, overview, comment) VALUES($1, $2, $3, $4, $5) RETURNING *`
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comment]
    client.query(sql, values).then((result) => {
        res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

function getMovieDB(req, res) {
    const sql = 'SELECT * FROM addedmovie';

    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
};

function updateCommentDB(req, res) {
    const id = req.params.id;
    const movie = req.body;
    console.log(id);
    console.log(movie);
    const sql = `UPDATE addedmovie SET title=$1, release_date=$2, poster_path=$3, overview=$4, comment=$5 WHERE id=$6 RETURNING *;`;
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comment, id];
    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        return errorHandler(error, req, res);
    })
}

function getMovieDBID(req, res) {
    const id = req.params.id;

    const sql = `SELECT * FROM addedmovie where id=$1;`;
    const values = [id];
    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
};



function deleteMovieDB(req, res) {
    const id = req.params.id;
    const sql = `DELETE FROM addedmovie WHERE id=$1;`;
    const values = [id];

    client.query(sql, values).then(() => {
        return res.status(204).json({});
    }).catch((error) => {
        errorHandler(error, req, res);
    })
};

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Listening on " + PORT)
        });

    });


function errorHandler(error, req, res, next) {
    const err = {
        status: 500,
        message: error.message
    }
    return res.status(500).send(err);
}

function notFounderrorHandler(req, res) {
    const err = {
        status: 404,
        message: "Not Found"
    }
    res.status(404).send(err);
}