'use strict';

const express = require("express");
const data = require("./data.json");
const app = express();
app.get('/', jsonHandler);
app.get('/favorite', favoriteHandler);

function selectData(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
};

function favoriteHandler(req, res) {
    return res.send("Welcome to Favorite Page");
}

function jsonHandler(request, response) {
    let result = [];
    data.forEach((value, index) => {
        let oneMovie = new selectData(value.title, value.poster_path, value.overview);
        result.push(oneMovie);
    });
    return response.status(200).json(result);
};

app.listen(5500, () => {
    console.log("Welcome from 5500 port");
});
