import { Meteor } from 'meteor/meteor';
import { SERVER_CONFIG } from './server-config.js';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {});

WebApp.connectHandlers.use('/api/discover/movies', (req, res, next) => {
  let baseurl = SERVER_CONFIG.themoviedb_api_config.base_url;
  let apikey = SERVER_CONFIG.themoviedb_api_config.api_key;
  let language = SERVER_CONFIG.themoviedb_api_config.language;

  let apiJson = JSON.parse(
    HTTP.call(
      'GET', baseurl + 'discover/movie?api_key=' + apikey + '&language=' + language
      ).content
  )

  res.writeHead(200); 
  res.end(JSON.stringify(apiJson));
});