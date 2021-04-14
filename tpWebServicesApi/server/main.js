import { Meteor } from 'meteor/meteor';
import { SERVER_CONFIG } from './server-config.js';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';
import {Mongo} from 'meteor/mongo';

Meteor.startup(() => {});

const Like = new Mongo.Collection('like');

let baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
let apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
let language = SERVER_CONFIG.themoviedb_api_config.language;

const moviesSearch = baseurl + 'search/movie?api_key=' + apikey + '&language=' + language;

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

// Recherche film ? voir aussi main côté client

WebApp.connectHandlers.use('/api/search', (req, res, next) => {
  let urlFinal = moviesSearch;
  let input = '';

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

  WebApp.connectHandlers.use('/api/like', (req,res, next) => {
    switch(req.method) {
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
  }
  );

  function updateLikeMovie(idMovie) {
    let ressource = Like.findOne({ id: idMovie });
    if (ressource) {
      Like.update(
        { id: idMovie },
        { $inc: { like: 1 } }
      );
    }else{
      Like.insert(
        { id: idMovie,
        like: 1}
      );
    }
    return Like.findOne({ id: idMovie });
  }


function urlSplit(url) {
  let urlParams = url.split('?')[1].split('&');
  let params = [];
  urlParams.forEach(param => {
    params.push(param.split('='));
  });
  return params;
}
