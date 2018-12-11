const express = require(`express`);
var cors = require('cors')
var app = express();

var data = {
  client: undefined,
  discord: undefined,
  sql: undefined
}

app.use(cors());

app.get('/data/', function(req, res, next) {
  res.withCredentials = true;
  res.setHeader('Content-Type', 'application/json');

  sql.get(`SELECT * FROM scores WHERE userId ="291754013131538432"`).then(row => { // Grab the sender's GremmieStats profile.
    res.send(JSON.stringify({ name:  row.userId, sent: row.gremmiesGiven, received: row.gremmiesRecieved}));
  });
});

app.listen(3000);

module.exports = function() {

  var module = {};

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
