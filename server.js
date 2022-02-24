'use strict';
const express = require("express");
const movie = require("./Movie_Data/data.json");
const app = express();
const axios = require("axios");
const dotenv = require("dotenv");
const pg = require("pg");
dotenv.config();
const APIKEY = process.env.APIKEY;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL);
function selectData(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.release_date = release_date;
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}
app.use(express.json());
app.get('/', homePageHandler);
app.get('/favorite', favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);
app.post('/addMovie', addMovieHandler);
app.get('/getMovies', getMoviesHandler);
app.put('/UPDATE/:id', updateHandler);
app.delete('/DELETE/:id', deleteHandler);
app.get('/getMovie/:id', getMovieByIdHandler);

app.get("*", notFoundHandler);

app.use(errorHandler);

function homePageHandler(req, res) {
    let result = [];
    movie.data.forEach((value) => {
        let oneMovie = new selectData(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
        result.push(oneMovie);

    });
    return res.status(200).json(result);
};
function favoritePageHandler(req, res) {

    return res.status(200).send("Welcome to Favorite Page!!");
};
function trendingPageHandler(req, res) {
    let result = [];
    let response = axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        });
};

function searchPageHandler(req, res) {
    const search = req.query.Movie;
    let result = [];
    console.log(req);
    let response = axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}&page=2`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneMovie = new selectData(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        });
};

function addMovieHandler(req, res) {
    const movieV = req.body;
    const sql = `INSERT INTO addMovie(release_date,title,poster_path,overview,my_comment) VALUES($1,$2,$3,$4,$5) RETURNING *;`;

    const values = [movieV.release_date, movieV.title, movieV.poster_path, movieV.overview, movieV.my_comment];
    client.query(sql, values).then((result) => {
        res.status(201).json(result.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    });
};

function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM addMovie;`;
    client.query(sql).then((result) => {
        res.status(201).json(result.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    });
};


function updateHandler(req, res) {
    const id = req.params.id;
    const movieUpdate = req.body;

    const sql = `UPDATE addMovie SET my_comment=$1 WHERE id=$2 RETURNING *;`;
    const values = [movieUpdate.my_comment, id];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
};


function deleteHandler(req, res) {
    const id = req.params.id;
    const movieDel = req.body;

    const sql = `DELETE FROM addMovie WHERE id=$1 ;`;
    const value = [id];

    client.query(sql, value)
        .then((result) => {
            return res.status(204).json({});
        }).catch((error) => {
            errorHandler(error, req, res);
        })
};

function getMovieByIdHandler(req, res) {
    const id = req.params.id;

    const sql = `SELECT * FROM addMovie WHERE id=$1 ;`;
    const value = [id];

    client.query(sql, value)
        .then((result) => {
            return res.status(200).json(result.rows);
        }).catch((error) => {
            errorHandler(error, req, res);
        })

};

client.connect()
    .then(() => {
        app.listen(5500, () => {
            console.log("Welcome from 5500 port");
        });
    }).catch(error => {
        errorHandler(error, req, res);
    });

function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    return res.status(500).send(err);
};

function notFoundHandler(req, res) {
    return res.status(404).send("Not Found :404");

};