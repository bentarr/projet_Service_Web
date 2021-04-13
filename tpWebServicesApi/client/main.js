import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';

import './main.html';

const movies = new ReactiveVar();
const genres = new ReactiveVar();

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
    'http://localhost:3000/api/genre/movie/list',
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

Template.home.events({
  'click #like'(event, instance) {
    const idMovie = event.currentTarget.dataset.id;
    updateLikeMovie(idMovie, movies);
  },
  'click #popu'(event, instance) {
    getMostPopu();
  },
  'submit .genres'(event, instance) {
    const target = event.target;
    const idGenre = target.genres.value;
    getMoviesFromGenre(idGenre);
  }
});


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

function getMoviesFromGenre(idGenre) {
  console.log(idGenre);
  HTTP.call(
    'POST',
    'http://localhost:3000/api/genre/movie/list',
    {},
    (error, response) => {
      genres.set(
        JSON.parse(response.content).results)
    }
  );
}