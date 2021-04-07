import { Meteor } from 'meteor/meteor';
import { SERVER_CONFIG } from './server-config.js';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';
import {Mongo} from 'meteor/mongo';

Meteor.startup(() => {});

const Like = new Mongo.Collection('like');


WebApp.connectHandlers.use('/api/discover/movies', (req, res, next) => {
  let baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
  let apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
  let language = SERVER_CONFIG.themoviedb_api_config.language;
  HTTP.call(
    'GET', 
    baseurl + 'discover/movie?api_key=' + apikey + '&language=' + language,
    {},
    (error, response) => {
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

