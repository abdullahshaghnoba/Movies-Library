'use strict';

const express = require('express');

const cors = require('cors');


const data = require('./movie-data/data.json')

const server = express();

server.use(cors());

const PORT = 3500;

function Movies (title,poster_path,overview){
    this.title=title,
    this.poster_path=poster_path,
    this.overview=overview
}

let newMovie = new Movies(data.title,data.poster_path,data.overview)


// Routs 
///////////////////////// Home Route ////////////
server.get('/',(req,res)=>{
   
    res.send(newMovie)

})
///////////////////////// Favorite Route ////////////
server.get('/Favorite',(req,res) =>{
    let message = "Welcome to Favorite Page"
    res.status(200).send(message)
})



///////////////////////// page not found Route ////////////
server.get('*',(req,res)=>{
    res.status(404).send("page not found");
})

///////////////////////// something went wrong Route ////////////
server.get('*',(req,res)=>{
    res.status(500).send("Sorry, something went wrong");
})



// http://localhost:3500
server.listen(PORT,() =>{
    console.log(`Hi ${PORT}` )
})