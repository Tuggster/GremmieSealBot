const express = require(`express`);
const cors = require(`cors`)
const bodyParser = require(`body-parser`);
var app = express();

var data = {
  client: undefined,
  discord: undefined,
  sql: undefined,
  seals: undefined
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/data/', function(req, res, next) {
  if (req.query.req == "stats") {

	var response = {
		names: [],
		sent: [],
		receieved: []
	}

	  //res.withCredentials = true;
    res.setHeader('Content-Type', 'application/json');

    data.sql.all(`SELECT * FROM scores`).then(rows => { // Grab the sender's GremmieStats profile.
      for (var j = 0; j < rows.length; j++) {
		if (data.client.users.get(rows[j].userId.toString()) != undefined)
			response.names.push(data.client.users.get(rows[j].userId.toString()).username);
		else
			response.names.push("Deleted account");
  		response.sent.push(rows[j].gremmiesGiven);
  		response.receieved.push(rows[j].gremmiesRecieved);
    }

	}).then(function() {
		res.send(JSON.stringify(response), null, 3);
	}).catch(error => {
	  console.log("Error thrown in stats fetch - GremmieWeb" + error);
	  return;
	});

  } else if (req.query.req == "info") {
	  var response = {
		  ping: 300,
		  userCount: 70,
		  serverCount: 8
	  }

	  res.setHeader('Content-Type', 'application/json');

	  response.ping = data.client.ping;
	  response.userCount = data.client.users.array().length;
	  response.serverCount = data.client.guilds.array().length;

	  res.send(JSON.stringify(response));
  } else if (req.query.req == "overview") {
    var response = {
      ping: 0,
      name: "error!",
      sent: 0,
      receieved: 0
    };

    data.sql.get(`SELECT * FROM scores WHERE userId="${req.query.user}"`).then(row => {
	  response.ping = data.client.ping;

	  if (typeof row !== "undefined") {
		  response.name = data.client.users.get(req.query.user.toString()).username;
		  response.sent = row.gremmiesGiven;
		  response.received = row.gremmiesRecieved;
	  }
    }).then(function() {
	  res.send(JSON.stringify(response));
	});
} else if (req.query.req == "seals") {
  var response = {
    seals: [],
    prices: []
  };

  var sealsImages = [];
  var sealsPrices = [];

  for (var i = 0; i < data.seals.length; i++) {
    var sealSplit = data.seals[i].split(`|`);
    response.seals.push(sealSplit[0]);
    response.prices.push(sealSplit[1]);
  }

  res.send(response);
}


});

app.post('/data/',function(req,res,next) {
    if (req.query.req == "setseal") {
      var userID = req.query.user;

      data.sql.get(`SELECT * FROM scores WHERE userId ="${userID}"`).then(row => { // Grab the sender's GremmieStats profile.
        if (row.sealsRecieved >= data.seals[parseInt(req.query.seal, 10)].split(`|`)[1]) {
    			sql.run(`UPDATE scores SET selectedSeal = ${req.query.seal} WHERE userId = ${userID}`); // We lied to them. It hasn't yet been set. We do that here.
    		} else {
    			res.send("not enough bucks!");
          return;
    		}
  	  }).then(function() {
          res.send("success!");
          return;
      });
    }
});

app.listen(3000);

module.exports = function() {

  var module = {};

  module.data = data;

  module.loadData = function(sql, client, discord, seals) {
    data.sql = sql;
    data.client = client;
    data.discord = discord;
    data.seals = seals;
  }

  module.name = "GremmieWeb";
  module.desc = "The bridge between GSB and the GSB web portal!";

  module.onBotReady = function() {
    console.log("GSB web service ready!");
  }

  return module;
}
