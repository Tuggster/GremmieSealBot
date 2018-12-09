const express = require(`express`);
var app = express();

app.get('/data', function(req, res){
  res.send('Testing, 123!');
});

app.listen(80);

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
