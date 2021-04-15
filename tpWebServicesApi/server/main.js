import { Meteor } from 'meteor/meteor';
import { SERVER_CONFIG } from './server-config.js';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';
import { Mongo } from 'meteor/mongo';

Meteor.startup(() => { });

const Like = new Mongo.Collection('like');


let baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
let apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
let language = SERVER_CONFIG.themoviedb_api_config.language;
const moviesSearch = baseurl + 'search/movie?api_key=' + apikey + '&language=' + language;


//Route de base pour la liste des films
WebApp.connectHandlers.use('/api/discover/movies', (req, res, next) => {
  HTTP.call(

    'GET', 
    baseurl + 'discover/movie?api_key=' + apikey + '&language=' + language,
    {},
    (error, response) => {
      console.log(response);
      let retour = response.data;
      retour.results.forEach(element => {
        let retourReq = Like.findOne({id: element.id});
        element.like = retourReq ? retourReq.like : 0;
      });
      res.writeHead(200);
      res.end(JSON.stringify(retour))

    }
  )
});

//Route pour les films les plus populaires
WebApp.connectHandlers.use('/api/discover/most_popu', (req, res, next) => {
  HTTP.call(
    'GET',
    baseurl + 'discover/movie?sort_by=vote_average.desc&vote_count.gte=50&api_key=' + apikey + '&language=' + language,
    {},
    (error, response) => {
      let retour = response.data;
      insertLikeBdd(retour);
      res.writeHead(200);
      res.end(JSON.stringify(retour))
    }
  )
  });

// Route pour accéder à la recherche de film
WebApp.connectHandlers.use('/api/search', (req, res, next) => {
  let urlFinal = moviesSearch;
  let input = '';

  // Ici sur les 3 prochaines lignes on déclare
  // une variable "check" qui va venir servir de "query" 
  // (option obligatoire pour la recherche avec l'API)
  let check = urlSplit(req.originalUrl);
  console.log(check);
  input = check[0][1]

  HTTP.call(
    'GET', 
    urlFinal + '&query=' + input,
    {},
    (error, response) => {

      let retour = response.data;
      retour.results.forEach(element => {
        let retourReq = Like.findOne({id: element.id});
        element.like = retourReq ? retourReq.like : 0;
      })
      
      res.writeHead(200);
      res.end(JSON.stringify(retour));
    }
  );
});


//Route pour récupérer les genres
WebApp.connectHandlers.use('/api/genres', (req, res, next) => {
  HTTP.call(
    'GET',
    baseurl + 'genre/movie/list?api_key=' + apikey + '&language=' + language,
    {},
    (error, response) => {
      let retour = response.data;

      res.writeHead(200);
      res.end(JSON.stringify(retour))
    }
  )
});

//Liste des films en fonction du genre
WebApp.connectHandlers.use('/api/movie/genre', (req, res, next) => {
  let genre = urlSplit(req.originalUrl);
  let idGenre = genre[0][1];
  HTTP.call(
    'GET',
    baseurl + 'discover/movie?with_genres=' + idGenre + '&api_key=' + apikey + '&language=' + language,
    {},
    (error, response) => {
      let retour = response.data;
      insertLikeBdd(retour);
      res.writeHead(200);
      res.end(JSON.stringify(retour))
    }
  )
});

//Route pour récupérer la fonction de like
WebApp.connectHandlers.use('/api/like', (req, res, next) => {
  switch (req.method) {
    case 'GET':
      break;
    case 'PUT':
      let idMovie = req.url.split('/')[1];
      let newMoviesLikes = updateLikeMovie(parseInt(idMovie));
      res.writeHead(200);
      res.end(JSON.stringify(newMoviesLikes));
      break;
    default:
      break;
  }
});


//Fonction d'update quand on clique sur le boutton "like"
function updateLikeMovie(idMovie) {
  let ressource = Like.findOne({ id: idMovie });
  if (ressource) {
    Like.update(
      { id: idMovie },
      { $inc: { like: 1 } }
    );
  } else {
    Like.insert(
      {
        id: idMovie,
        like: 1
      }
    );
  }
  return Like.findOne({ id: idMovie });
}

//Fonction pour insérer les likes en BDD 
//Aussi pour garder le nombre de like visible tout le temps

function insertLikeBdd(retour) {
  retour.results.forEach(element => {
    let retourReq = Like.findOne({ id: element.id });
    element.like = retourReq ? retourReq.like : 0;
  });
}


/*
Fonction permettant le Split de l'url pour venir chercher les informations du main.js
Marche comme un GET/POST en PHP.
On retourne à la fin la variable params déclaré dans un tableau
**/ 

function urlSplit(url) {
  let urlParams = url.split('?')[1].split('&');
  let params = [];
  urlParams.forEach(param => {
    params.push(param.split('='));
  });
  return params;
}