const express = require(`express`);
const cors = require(`cors`)
const bodyParser = require(`body-parser`);
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
  if (typeof req.query.id != undefined) {
    var response = {
      names: [],
      sent: [],
      receieved: []
    }

	  res.withCredentials = true;
	  res.setHeader('Content-Type', 'application/json');


	  var rowsCount = data.sql.get("COUNT (*) FROM scores");


    data.sql.all(`SELECT * FROM scores`).then(rows => { // Grab the sender's GremmieStats profile.
      for (var j = 0; j < rows.length; j++) {
        response.names[i] = member.username;
        response.sent[i] = rows[j].gremmiesGiven;
        response.receieved[i] = rows[j].gremmiesRecieved;
      }

		}).catch(error => {
		  console.log("Error thrown in stats fetch - GremmieWeb" + error);
		  res.send("Please send a valid Discord user ID.\nMake sure that the user actually has GremmieStats filed, too.")
		  return;
		});


    res.send(JSON.stringify(response));

  }


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
