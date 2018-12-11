const express = require(`express`);
const cors = require('cors')
const bodyParser = require("body-parser");
var app = express();

var data = {
  client: undefined,
  discord: undefined,
  sql: undefined
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/data/', function(req, res, next) {
  var userID = req.body.user;

  res.withCredentials = true;
  res.setHeader('Content-Type', 'application/json');

  data.sql.get(`SELECT * FROM scores WHERE userId ="${userId}"`).then(row => { // Grab the sender's GremmieStats profile.
    res.send(JSON.stringify({ name:  row.userId, sent: row.gremmiesGiven, received: row.gremmiesRecieved}));
  });
});

// app.post('/data/',function(req,res,next) {
//     var userID = req.body.user;
//
//     data.sql.get(`SELECT * FROM scores WHERE userId ="${userID}"`).then(row => { // Grab the sender's GremmieStats profile.
//       res.send(JSON.stringify({ name: row.userId, sent: row.gremmiesGiven, received: row.gremmiesRecieved}));
//     });
// });

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
