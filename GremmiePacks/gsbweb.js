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

var names = [];
var sent = [];
var receieved = [];

function addData(name, sentCount, receievedCount) {
	names.push(name);
	sent.push(sentCount);
	receieved.push(receievedCount);
	console.log(`I just pushed: ${name}, ${sentCount}, and ${receievedCount}`)
}

function clearData() {
	names = [];
	sent = [];
	receieved = [];
}

app.get('/data/', function(req, res, next) {
  if (req.query.req == "stats") {

	var response = {
		names: [],
		sent: [],
		receieved: []
	}

	  //res.withCredentials = true;
    res.setHeader('Content-Type', 'application/json');

	clearData();


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
	  
	  res.send(response);
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
