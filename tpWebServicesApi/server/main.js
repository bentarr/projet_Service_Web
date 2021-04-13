import { Meteor } from 'meteor/meteor';
import { SERVER_CONFIG } from './server-config.js';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';
import { Mongo } from 'meteor/mongo';

Meteor.startup(() => { });

const Like = new Mongo.Collection('like');

const baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
const apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
const language = SERVER_CONFIG.themoviedb_api_config.language;

//Route de base pour la liste des films
WebApp.connectHandlers.use('/api/discover/movies', (req, res, next) => {
  HTTP.call(
    'GET',
    baseurl + 'discover/movie?api_key=' + apikey + '&language=' + language,
    {},
    (error, response) => {
      let retour = response.data;
      insertLikeBdd(retour);
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

//Route pour récupérer les genres
WebApp.connectHandlers.use('/api/genre/movie/list', (req, res, next) => {
  switch (req.method) {
    case 'GET':
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
    case 'POST':
      console.log(req); //TROUVER DANS REQ QUELLE VALEUR RECUPERER
      HTTP.call(
        'POST',
        baseurl + 'genre/movie/list?api_key=' + apikey + '&language=' + language,
        {},
        (error, response) => {
          let retour = response.data;
          res.writeHead(200);
          res.end(JSON.stringify(retour))
        }
      )
    default:
      break;
  }
});

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

function insertLikeBdd(retour) {
  retour.results.forEach(element => {
    let retourReq = Like.findOne({ id: element.id });
    element.like = retourReq ? retourReq.like : 0;
  });
}
