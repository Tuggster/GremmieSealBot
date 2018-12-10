const express = require(`express`);
var cors = require('cors')
var app = express();

app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

app.get('/data/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  res.send('Testing, 123!');
});

app.listen(3000);

module.exports = function() {

  var module = {};

  var data = {
    client: undefined,
    discord: undefined,
    sql: undefined
  }



  module.data = data;

  module.loadData = function(sql, client, discord) {
    data.sql = sql;
    data.client = client;
    data.discord = discord;
  }

  module.name = "GremmieWeb";
  module.desc = "The bridge between GSB and the GSB web portal!";

  module.onBotReady = function() {
    console.log("GSB web service ready!");
  }

  return module;
}
