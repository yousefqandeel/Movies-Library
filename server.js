'use strict';

const express = require("express");
const movie = require("./data.json");
const app = express();
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const APIKEY = process.env.APIKEY;
function selectData(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date
    this.poster_path = poster_path;
    this.overview = overview;
}
app.get('/', homePageHandler);
app.get('/favorite', favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);
app.get('/discover', discoverHandler);
app.get("/upcoming", upcomingPageHandler);
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


app.listen(5501, () => {
    console.log("Welcome from 5500 port");
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
