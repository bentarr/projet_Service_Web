import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';


const movies = new ReactiveVar();
const genres = new ReactiveVar();
var inputSearch = new ReactiveVar();
var filtreSearch = new ReactiveVar(false);
var page = new ReactiveVar(1);
var date = new ReactiveVar();

// Template pour récupérer l'api movies et genres avec des GET
Template.home.onCreated(function homeOnCreated() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/discover/movies',
    {},
    (error, response) => {
      movies.set(
        JSON.parse(response.content).results)
    }
  );
  HTTP.call(
    'GET',
    'http://localhost:3000/api/genres',
    {},
    (error, response) => {
      genres.set(
        JSON.parse(response.content).genres)
    }
  );
});

Template.home.helpers({
  movies() {
    return movies.get()
  },
  genres() {
    return genres.get()
  }
});

//Déclaration des ID html et leurs fonctions
Template.home.events({
  'click #like'(event, instance) {
    const idMovie = event.currentTarget.dataset.id;
    updateLikeMovie(idMovie, movies);

  },
  'click #popu'(event, instance) {
    getMostPopu();
  },
  'change #genres'(event, instance) {
    const target = event.target;
    const idGenre = target.value;
    console.log(idGenre);
    getMoviesFromGenre(idGenre);
  }
});

Template.home.helpers({
  inputValue() { return inputSearch.get(); }
})

Template.home.events({
  'input #search'(event) {
    inputSearch.set(event.target.value);
    date.set('');
    if (inputSearch.get() != '') {
      filtreSearch.set(true);
      allFilmSearch();
    } else {
      allFilms();
    }
  }
})

// Fonction permettant d'afficher les films avec les mots recherchés 
function allFilmSearch() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/search?input=' + inputSearch.get(),
    {},
    (error, response) => { 
      movies.set(JSON.parse(response.content).results); 
    }
  );
}

// Fonction permettant de POST les likes 
function updateLikeMovie(idMovie, movies) {
  HTTP.call(
    'PUT',
    'http://localhost:3000/api/like/' + idMovie,
    {},
    (error, response) => {
      let index = movies.get().findIndex(
        (item) => { return item.id === JSON.parse(response.content).id; }
      );
      let moviesList = movies.get();
      moviesList[index].like = JSON.parse(response.content).like;
      movies.set(moviesList);
    }
  )
}

//Récupération des films les plus populaires
function getMostPopu() {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/discover/most_popu',
    {},
    (error, response) => {
      movies.set(JSON.parse(response.content).results);
    }
  )
}

//Récupération des films par genre
function getMoviesFromGenre(idGenre) {
  HTTP.call(
    'GET',
    'http://localhost:3000/api/movie/genre?genre=' + idGenre,
    {},
    (error, response) => {
      movies.set(
        JSON.parse(response.content).results)
    }
  );
}