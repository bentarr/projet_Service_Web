import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http'; 

import './main.html';

var inputSearch = new ReactiveVar();
var filtreSearch = new ReactiveVar(false);
var page = new ReactiveVar(1);
var date = new ReactiveVar();

var movies = new ReactiveVar();

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
});

  Template.home.helpers({
  movies() {
  return movies.get()
  }
});

Template.home.events({
  'click button'(event, instance) {
    const idMovie = event.currentTarget.dataset.id;
    updateLikeMovie(idMovie, movies);
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