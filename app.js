﻿const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs')
const stream = require('youtube-audio-stream')
const search = require('youtube-search');
var fetchVideoInfo = require('youtube-info');
const opus = require('node-opus');

const config = require("./config.json");



var servers = {};

var insults = [`your mom gay`, `your granny tranny`, `your sister a mister`];
var comebacks = [`your dad lesbian`, `your grandpap a trap`, `your family tree lgbt`];

var prompt = require(`prompt`);

const Enmap = require('enmap');
const Provider = require('enmap-sqlite');
const settings = new Enmap({provider: new Provider({name: "settings"})});


const turbolish = [`291754013131538432`, `311649075776847872`, `314229467469971456`];


const defaultSettings = {
  prefix: "!",
  fun: "true",
  beta: "false"
}


function stopMusic(message) {
	var server = servers[message.channel.guild.id];

	if (message.guild.voiceConnection) {
		message.guild.voiceConnection.channel.leave();
		server.queue = [];
	} else {
		message.channel.send("There was no music to be stopped!");
	}
}


function getQueue(message) {
	if (!servers[message.channel.guild.id]) servers[message.channel.guild.id] = {
		queue: []
  }

	var server = servers[message.channel.guild.id];
	if (server.queue[0]) {
		let queueText = `Queue:\n`
		for (var i = 0; i < server.queue.length; i++) {
			queueText += `Song #${i+1}: ${server.queue[i]}\n`;
		}
		message.channel.send(queueText);
	} else {
		message.channel.send("Sorry, but there is no active queue in this server.");
	}
}

function playSong(message){
    if (!message.member.voiceChannel)
		message.reply("Please join a voice channel, so the Gremlins know where to blast those tunes!");
	
	if (!servers[message.guild.id]) servers[message.guild.id] = {
		queue: []
	};

	var server = servers[message.guild.id];
	if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
		try {
			server.dispatcher = connection.playStream(stream(server.queue[0]));
		} catch (e) {
			message.channel.send("Ouchies, that didn't work.");
		}
		
		server.queue.shift();
	
		server.dispatcher.on("end", function() {
			if (server.queue[0]) playSong(message);
			else { 
				message.channel.send("Music is over, the Gremlins are out of here!");
				connection.disconnect();
			}
		});
	})
	
	

}

function searchfunc(message){
  var server = servers[message.channel.guild.id];
  let opts = {
    key: "AIzaSyDekZMp8HiuJbzHtm98rB2gYIPO5BMBaQ8",
  }
  let args = message.content.slice("!GremmiePlay".length);
  let name = args;
  try {
  search(name, opts, (err, results) => {
	  if (!results[0]) {
		  message.reply("No results found!");
	  }
		  
	  
      if(err) return console.log(err);
      server.queue.push(results[0].link);
	  console.log(`Song queued: ${name}`);

    })
  } catch (error) {
	  throw new Error (error);
	  console.log("Error on youtube search. Name field might be empty.");
	  message.channel.send("Error! Couldn't find video.");
  }
};

client.on("guildBanAdd", (guild, user) => {
	const defaultChannel = guild.channels.find(`name`,`general`);
	defaultChannel.send(`${user.username} got banned lol`);
	
})

client.on("guildCreate", guild => {
	logAction(`New server joined - ${guild.name}`);
	
	// Adding a new row to the collection uses `set(key, value)`
	settings.set(guild.id, defaultSettings);
	
    const defaultChannel = guild.channels.find(`name`,`general`);
	
	if (defaultChannel)
		defaultChannel.send("Hello! I am GremmieSealBot. I have automatically created some roles for you. The most important one is \"Gremmie Approved\". Give this role to all users who are allowed to send GremmieSeals. Some commands require the user to have an admin role.")
	
	if (!guild.roles.find("name", "Gremmie Approved")) {
	
		guild.createRole({

		name: 'Gremmie Approved',
		  color: 'BLUE',
		})
	  .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
	  .catch(console.error)
	}
  
  
  	if (!guild.roles.find("name", "Gremboss")) {

  
	  guild.createRole({
		name: 'Gremboss',
		  color: 'BLUE',
		})
	  .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`))
	  .catch(console.error)
	}
	
	});
	
client.on("guildDelete", guild => {
  console.log("I've left a server.");
	
  // Removing an element uses `delete(key)`
  settings.delete(guild.id);
});

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var seals = ["https://i.imgur.com/LkP71Kr.png |0| Price: 0 - ID: 0", "https://i.imgur.com/nK3Wee5.png |25| Price: 25 - ID: 1", "https://i.imgur.com/35KMlDe.png |35| Price: 35 - ID: 2", "https://i.imgur.com/WKomEDw.png |35| Price: 35 - ID: 3", "https://i.imgur.com/WfSzveW.png | 420 | Price: 420 - ID: 4 | 2018 April 1st joke -- It costs 420, LOL XD"]

var jokes = ["What did the Gremlin say to the rock? Eat me!",
 "Knock Knock! Who's there? Gremlin. Gremlin who? Gremlin poo! HAHAH LOLZERS XD",
  "Why did the Gremlin cross the road? To get some melon",
   "What does a Gremlin say when it eats a dog? Woof!",
    "What's 9 plus 10? 21.",
    "Who is the Gremlin's biggest fan? I am, obviously!",
     "Who? You! Narutuu!",
     "Why do Gremlins have to eat? So they don't get hungry... What were you expecting?",
      "INSERT JOKE HERE",
      "http://i1.kym-cdn.com/photos/images/newsfeed/001/091/264/665.jpg",
      "Top ten dumb meme!",
       "ENGLAND IS MY CITY, AND YESS, I AM LIT. https://imgur.com/a/bx6HF",
	   "WAXS MY SKIIS, WAX THEM GOOD, WAX THEM, OR I'M GOING TO STAB YOU IN A NEIGHBORHOOD",
	   "Did you stir my chicken?",
		"Did somebody ring the dinkster?",
		 "Riley plays Fortnite"
          ];

var menMessages = ["Hello!", "Nice to see you again.", "That's me, GremmieSealBot!", "I love you, :b::b:", "How is your day going?", "Always nice to talk to you", "Thanks for talking to me!", "Our gremlins are bottled at the source", "All natural gremmies since 1988", "REDACTED"];
const sql = require("sqlite");
sql.open("score.sqlite");	

let flashCount = 0;
let flashMax = 10;
let flashTimer = 100;

function flashA() {
	if (flashCount < flashMax) {
		flashCount++;
		client.user.setStatus(`dnd`);
		
		client.user.setActivity('!ALERT', { type: 'PLAYING' })

		
		setTimeout(flashB, flashTimer);
		console.log(`a`);
	} else {
		flashCount = 0;
		console.log(`done`);

		return;
	}
}

function flashB() {
	if (flashCount < flashMax) {
		flashCount++;
		client.user.setStatus(`online`);
		
		client.user.setActivity('!GremmieHelp', { type: 'LISTENING' })
		
		setTimeout(flashA, flashTimer);
		console.log(`b`);
	} else {
		flashCount = 0;
		console.log(`done`);

		return;
	}
}

function dmCode(message) {
	if (message.author.bot)
		return;
	
    if (!message.content.startsWith("!"))
		mentionConversation(message, false); 

	
   if (message.channel.type === "dm") {
	  if (message.content.startsWith("!Announce") && contains(turbolish, message.author.id)) {
		  for (var i = 0; i < client.guilds.size; i++) {
					const guild = client.guilds.first(client.guilds.size)[i];
					const defaultChannel = guild.channels.find(`name`,`general`);
					defaultChannel.send(`Announcement: ${message.cleanContent.slice("!Announce ".length)}`);
		  }
	  }
	  
	  if (message.content.startsWith("!RemoteConnection") && contains(turbolish, message.author.id)) {
		  message.channel.send(`Here you go! \nUsername: \"ADMINISTRATOR\"\nPassword: \"GSBServer1010\"\nPlease send your public IP address to Tuggi, so you may be allowed access. \n \"To get your public IP, just google \"What's my IP?\"\"`, {
			  files: [
				"./remote.rdp"
			  ]
		  })
	  }
	  
	  if (message.content.startsWith("!SetGame") && contains(turbolish, message.author.id)) {
		client.user.setActivity(`${message.content.slice("!SetGame".length)}`)
	  }		  
	  
	  if (message.content.startsWith("!SetStatus")  && contains(turbolish, message.author.id)) {
		  try {
			  
			  var args = message.content.slice("!SetStatus ".length).trim();
			  
			if (args == "online" || args == "offline" || args == "idle" || args == "dnd") {
			  
				  client.user.setStatus(args)
				  .then(console.log)
				  .catch(console.error);
				  message.reply("Status modification completed successfully.");
			} else {
				message.reply ("Status modification failed - please use a status of online, offline, idle, or dnd.")
			}
			
		  } catch (error) {
			  message.reply(`Fatal error - ${error}. Please use a status of online, offline, idle, or dnd.`);
			  
		  }
	  }
	  
	  if (message.content.startsWith("!Alert")  && contains(turbolish, message.author.id)) {
		  flashCount = 0;
		  flashA();
	  }
	  
	  if (message.content.startsWith("!MasterDebug") && contains(turbolish, message.author.id)) {
		  let debugInfo = `\nServerlist (${client.guilds.size}): \``
		  for (var i = 0; i < client.guilds.size; i++) {
			const guild = client.guilds.first(client.guilds.size)[i];

			debugInfo += " | " + guild.name;
		  }
		  
		  debugInfo += "\`";
		  
		  debugInfo += `\n\n Userlist (${client.users.size}): \``
		  for (var i = 0; i < client.users.size; i++) {
				const user = client.users.first(client.users.size)[i];
			    debugInfo += " | " + user.username;
		  }
		  debugInfo += "\`";
		  
		  debugInfo += `\n\nUptime: \`${Math.trunc(client.uptime / 1000 / 60)} minutes, ${Math.trunc(client.uptime / 1000 / 60 / 60)} hours, or ${Math.trunc(client.uptime / 1000 / 60 / 60 / 24)} days. \``

		  
		  
		  
		  
		  message.reply(debugInfo)
		  
	  }
	  
	  if (message.content.startsWith("!GetUser")) {
		  message.reply(client.users.get(message.content.slice("!GetUser".length)).username);
		  
	  }
	  
	  
  } else {
	  if (message.content.startsWith("!Feedback")) {
		  if (message.channel.type === "dm" && message.author.id != "291754013131538432") {
			  client.users.get("291754013131538432").send(`User DM to GSB ---- ${message.content}`);
			  message.channel.send("Feedback sent successfully!");
		  }
	  }
  }
	
}

function mentionConversation(message, mention) {
	
	if (message.author.bot)
		return;
	
	if (mention) {
	if (message.mentions.members.first().id === client.user.id && !(message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
		  message.reply(pickRandomFromArray(menMessages));
		  //message.reply("HI YES YOU CALL ME? INVITE ME TO UR HOUZ.");
	  } else if (message.mentions.members.first().id === client.user.id && (message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
		  message.reply(menMessages[3]);
	  }
	}
	  
    if (!mention) {
		if (!(message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
		  message.reply(pickRandomFromArray(menMessages));
		  //message.reply("HI YES YOU CALL ME? INVITE ME TO UR HOUZ.");
	  } else if ((message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
		  message.reply(menMessages[3]);
	  }
	}
}







client.on('ready', () => {
	client.user.setActivity('!GremmieHelp', { type: 'LISTENING' })
	
	for (var i = 0; i < client.guilds.size; i++) {
				const guild = client.guilds.first(client.guilds.size)[i];
				servers[i] = guild;
	}
	
	prompt.start();
	console.log('I am ready!');

	
	
	

	sql.run("CREATE TABLE IF NOT EXISTS seals (serverID TEXT, slot1 TEXT, slot2 TEXT, slot3 TEXT)");

});

client.on('message', message => {
   
	
   if (message.channel.type === "dm")
	    dmCode(message);
	
   if (message.mentions.members != undefined) {
	   if (message.mentions.members.first() == client.user) {
		   mentionConversation(message, true);
		   return;
	   }
   }
	
   if (message.channel.type === "dm") return;
   if (message.author.bot) return;
   
   if (contains(turbolish, message.author.id) && message.author.presence.status == "offline") {
	   if (message.guild.members.get(`${client.user.id}`).hasPermission(`MANAGE_MESSAGES`)) {
		  message.channel.send(message.content);
			
		  message.react("✔").then();
		  message.delete(250);
	  } else {
		  message.channel.send("That action could not be completed elegantly with the given permissions.").then(mes => mes.delete(5000)); 
		  message.react("❌");
	  }

   }
  
   const guildConf = settings.get(message.guild.id) || defaultSettings;
   
   const args = message.content.split(` `/* /\s+/g */);
   const command = args.shift().slice(guildConf.prefix.length);
   

	
   
   	if ((message.content.includes("horsey surprise") || message.content.includes("horseysurpise")) && guildConf.fun === "true") {
	  message.channel.send("https://pbs.twimg.com/profile_images/1641005897/horseyavatar_400x400.jpg");
	}
   
   if (message.content.includes("@someone"))
	   message.reply(`Random user selected - ${message.channel.members.random()}`);
	
   if (/* message.author.id == 312297956701372424 && */ message.content.includes("LOL") && guildConf.fun === "true")
	   message.channel.send("LOL");
	
	


  
  for (var i = 0; i < insults.length; i++) {

	  if (message.content.toLowerCase().trim().includes(insults[i].toLowerCase().trim()) && guildConf.fun === "true") {
		  message.reply(comebacks[i]);
	  }
  }
  
  if (!message.content.startsWith(guildConf.prefix)) {
	   return;
   }

  if (command === "PatchNotes") {
	  fs.readFile('patch.txt', 'utf8', function(err, contents) {
		  return console.log(err)
		message.channel.send(`Patch notes:\n${contents}`);
	  });

  }
  
  if(command === "SetProperty") {
	  console.log(`Value 1: ${args[0]}, Value 2: ${args[1]}`)
	  
    // Command is admin only, let's grab the admin value: 
    
    // Then we'll exit if the user is not admin
    if(!message.member.hasPermission(`ADMINISTRATOR`)) return message.reply("You're not an admin, sorry!")
    
    const key = args[0];
    // Since we inserted an object, it comes back as an object, and we can use it with the same properties:
    if(!guildConf.hasOwnProperty(key)) return message.reply("That property does not exist.");
    
    // Now we can finally change the value. Here we only have strings for values so we won't
    // bother trying to make sure it's the right type and such. 
    guildConf[key] = args[1];
    
    // Then we re-apply the changed value to the PersistentCollection
    settings.set(message.guild.id, guildConf);
    
    // We can confirm everything's done to the client.
    message.channel.send(`Server configuration item ${key} has been changed to:\n\`${args[1]}\``);
  }

  if (command === "GetProperties") {
	  
	  const embed = new Discord.RichEmbed()
				  .setTitle("Property list")
				  .setAuthor(client.user.username, client.user.avatarURL)
				  .setDescription("Properties:")
				  .setColor(0x00ce71);
				  Object.keys(guildConf).forEach(key => {
					embed.addField(key, `${guildConf[key]}`);
				  });
				
				return message.channel.send({embed});
  }
  
  if (guildConf.beta === "true") {
	   if (message.content.startsWith("!GremmieStop") && message.member.roles.find("name", "Gremmie DJ")) {
		  stopMusic(message);
	  } else {
		  if (message.content.startsWith("!GremmieStop") && !message.member.roles.find("name", "Gremmie DJ")) {
			  message.reply("You must be a Gremmie DJ to preform this action.");
		  }
	  }
	  
	  if (message.content.startsWith("!GremmieSkip") && message.member.roles.find("name", "Gremmie DJ")) {
		  var server = servers[message.channel.guild.id];
			  if (server.queue[0]) {
				  //message.guild.voiceConnection.disconnect();
				  playSong(message); 
				  message.channel.send("Song skipped.");
			  } else {
				  message.channel.send("There is no song to skip to. Did you mean to type \"!GremmieStop\"?");
			  }
	  } else {
		  if (message.content.startsWith("!GremmieSkip") && !message.member.roles.find("name", "Gremmie DJ")) {
			  message.channel.send("Sorry, but only Gremmie DJs can skip songs.");
		  }
	  }
	  
	  if (message.content.startsWith("!GremmieQueue")) {
		  getQueue(message);
	  }
	  
	  if (message.content.startsWith("!GremmiePlay") && message.member.roles.find("name", "Gremmie DJ")){

	  
		if(!args) return message.channel.send("The Gremlins can't play nothing! Please provide a song name/link.");
		if(!message.member.voiceChannel) return message.reply("GSB requires you to be in a voice channel to play, so it knows where to go.");
		if(!servers[message.channel.guild.id]) servers[message.channel.guild.id] ={ 
			queue: []
		}
		var queue = servers[message.channel.guild.id].queue;
		var server = servers[message.channel.guild.id];
		if(args.indexOf("https") > -1 || args.indexOf("http") > -1){
		  message.reply("Adding URL "+args);
		  server.queue.push(args);
		} else{ 
		  message.reply("Adding "+(message.content.slice("!GremmiePlay".length)));
		  searchfunc(message);
		}
		  playSong(message); 
		
	  } else {
		  if (message.content.startsWith("!GremmiePlay") && !message.member.roles.find("name", "Gremmie DJ")) {
			  message.reply("Sorry, to use this command, you must have the \"Gremmie DJ\" role.");
		  }
  } 
  }

  
  if (command === "GremmieInfo") {
	  message.reply(`GremmieSealBot is currently active in ${client.guilds.size} servers. Latency is ${new Date().getTime() - message.createdTimestamp} ms.\nProudly serving ${client.users.size} users. Uptime is ${Math.trunc(client.uptime / 1000 / 60)} minutes, or ${Math.trunc(client.uptime / 1000 / 60 / 60)} hours`);
  }
  
  if (command === "SqlDelete" && contains(turbolish, message.author.id)) {
	  sql.run(`DELETE FROM scores WHERE userId= ${args}`)
  } else if (command === "SqlDelete" && !contains(turbolish, message.author.id)) {
	  message.reply("Sorry, but Turbolish is required to run this command.")
  }
  
  if (command === "SqlDebug" && contains(turbolish, message.author.id)) {
	  const embed = new Discord.RichEmbed().setTitle("Sql Data Dump")
				  .setAuthor(client.user.username, client.user.avatarURL)
				  .setDescription("All user data:")
				  .setColor(0x00AE86);
				  
	  for (let i = 0; i < client.users.array().length.clamp(0,25) - 1; i++)
		  sql.get(`SELECT DISTINCT userId, gremmiesRecieved, gremmiesGiven FROM scores LIMIT ${i}, 1`).then(row => {
			  message.channel.send(`User ID: ${row.userId} -- Name: ${client.users.get(row.userId).username} - ${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`);
			  embed.addField(client.users.get(row.userId).username, `${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`);
			  
		  })
	  
	  //return message.channel.send({embed});

				  
			  
  } else if (command === "SqlDebug" && !contains(turbolish, message.author.id)) {
	  message.reply("Sorry, but Turbolish is required to run this command.")
  }
  

  
  if (command === "TopStats" && guildConf.beta == "true") {
			const embed = new Discord.RichEmbed().setTitle("Leaderboards")
				  .setAuthor(client.user.username, client.user.avatarURL)
				  .setDescription("Here are the stats for the top 3 users:")
				  .setColor(0x00AE86);

			
			for	(var i = 0; i < 3; i++) {
				sql.get(`SELECT DISTINCT userId, gremmiesRecieved, gremmiesGiven FROM scores ORDER BY gremmiesRecieved DESC LIMIT ${i - 1}, 1`).then(row => {
					console.log(`Name: ${client.users.get(row.userId).username} - ${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`)
					if (row.userId != undefined && row.gremmiesRecieved != undefined && row.gremmiesGiven != undefined) {
						if (client.users.get(row.userId) != null) {
							embed.addField(client.users.get(row.userId).username, `${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`);
							message.channel.send(`Name: ${client.users.get(row.userId).username} - ${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`);
						} else {
								return message.channel.send("Oh darn, something went wrong here!");

							sql.run(`DELETE FROM scores WHERE userId=${row.userId}`)
							embed.addField("FATAL ERROR", `Something went wrong (${row.gremmiesRecieved},${row.gremmiesGiven},${row.userId}  - This is debug information, pretend you didn't see it.)`);
						}
					} else {
						return message.channel.send("Oh darn, something went wrong here!");
					}
					
				})
			}
			//return message.channel.send({embed});
			

			
	  }
  
  
  if (command === "AddCustomSeal" && message.member.hasPermission(`ADMINISTRATOR`)) {
		
		try {
		var slot = args[0];
		slot.trim();
		var slotInt = parseInt(slot, 10);
		
		var imgLink = args[1];
		imgLink.trim();
		
		var price = args[2];
		price.trim();
		var priceInt = parseInt(price, 10);
		} catch (e) {
			message.reply("It doesn't appear that this command was formatted correctly, here is a handy dandy formatting guide! \`SLOT NUMBER|IMAGE LINK|SEAL PRICE\`");
			return;
		}
		
		if (slotInt > 3 || slotInt < 1) {
			message.reply("Sorry, that is an invalid ID, there are only three slots. Please use numbers 1-3.\nHere is a handy dandy formatting guide! \`SLOT NUMBER|IMAGE LINK|SEAL PRICE\`");
			return;
		}
		
		sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(row => {
			if (row) {
				sql.run(`UPDATE seals SET slot${slotInt} = "${imgLink}| ${priceInt} | Price: ${priceInt} - ID: ${slotInt * -1}" WHERE serverID = ${message.channel.guild.id}`);
				message.reply(`Added seal: ${imgLink} in slot ${slotInt}, with a price of ${priceInt}`);
			} else {
				sql.run("INSERT INTO seals (serverID, slot1, slot2, slot3) VALUES (?, ?, ?, ?)", [message.channel.guild.id, "", "", ""]);
				message.reply("Sorry, I wasn't prepared for that. Could you please try again? I should be ready for the next go. \nHere is a handy dandy formatting guide! \`SLOT NUMBER|IMAGE LINK|SEAL PRICE\`");
			}
		});

	}  else {
		if (message.content.startsWith("!AddCustomSeal")) {
			message.reply("This command is admin only.");
		}
	}
  
  
  


  var row;
  

  
  if (command === "GremmieFarewell" && guildConf.fun === "true") {
	  if (message.mentions.members.first() != undefined)
		message.channel.send(`Minion's blessing. ${message.mentions.members.first()} https://i.imgur.com/af19I27.jpg`);
	
	  if (message.mentions.members.first() === undefined)
		message.channel.send(`Minion's blessing. https://i.imgur.com/af19I27.jpg`);
  }

  if (command === "SealCatalog" || command === "!GremmieCatalog") {
    message.channel.send("These are all of the available seals. To select a seal, you must have a received Gremmies count greater than or equal to the seals price. If this condition is met, you then type \"!SetSeal\" followed by the seal's ID. To find it's ID, count it's position in the catalog, starting from 0. To find the ID of a custom seal, look at it's catalog entry. It will contain it's ID. Please include the - when purchasing them, as it is required to tell the standard seals apart from the custom seals.");
    for (var i = 0; i < seals.length; i++) {
      message.channel.send(seals[i]);
    }
	
	sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(row => {
		if (row.slot1 != "")
			message.channel.send(row.slot1);
		
		if (row.slot2 != "")
			message.channel.send(row.slot2);
		
		if (row.slot3 != "")
			message.channel.send(row.slot3);
		
		
	});
	
	return;
  }


  jokes[jokes.length] = `${pickRandomFromArray(message.channel.members.array()).displayName} XDDDD`;


    if (command === "SetSeal") {
      sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {

      var argInt = parseInt(args[0], 10);
	  

	
	  if (argInt === undefined) {
		  message.reply("Please type a seal id following the command.");
	  }
	  sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(rowSeals => {

	  if (argInt < 0) {
		  
		  var fetchedString = "ID OUT OF RANGE ERROR1";

			
			let fetch = "ID OUT OF RANGE ERROR2";
			if (argInt == -1) fetch = rowSeals.slot1;
			if (argInt == -2) fetch = rowSeals.slot2;
			if (argInt == -3) fetch = rowSeals.slot3;
			
			fetchedString = fetch;
				
			

		  if (argInt < -3 || argInt > -1) {
					message.reply("When using a custom seal, the ID must be between -1 and -3.");
					return;
		}
		  if (parseInt(fetchedString.split('|')[1], 10) <= row.gremmiesRecieved && argInt != undefined) {
				  
				  
				  //

					
					sql.run(`UPDATE scores SET selectedSeal = ${argInt} WHERE userId = ${message.author.id}`);
					message.reply(`New seal set - ${fetchedString}`)
				  //}
		} else {
			message.reply(`Sorry but you haven't received enough GremmieSeals to purchase this seal. You need: ${fetchedString.split('|')[1]} seals.`);
		}
	  }
	});

	  
	  if (argInt >= 0) {
		  if (parseInt(seals[argInt].split('|')[1], 10) <= row.gremmiesRecieved && argInt != undefined) {
			message.reply("New Seal set - " + seals[argInt]);

			sql.run(`UPDATE scores SET selectedSeal = ${argInt} WHERE userId = ${message.author.id}`);

		  } else {
			if (parseInt(seals[argInt].split('|')[1], 10) > row.gremmiesRecieved) {
			  message.reply(`Sorry but you haven't received enough GremmieSeals to purchase this seal. You need: ${seals[argInt].split('|')[1]} seals.`);
			}
		}
	  }
	  

  });
	}


  if (command === "GremmieSeal" && message.member.roles.find("name", "Gremmie Approved")) {
    if (message.mentions.members.first())
      sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.mentions.members.first().id, 0, 0, 0]);


    var Response = "Here's a freshly baked GremmieSeal (TM) as a thanks for your quality post!";

    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) {
        sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.author.id, 1, 0, 0]);
      } else {
        sql.run(`UPDATE scores SET gremmiesGiven = ${row.gremmiesGiven + 1} WHERE userId = ${message.author.id}`);
      }


    }).catch(() => {
      console.error;
      sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, gremmiesGiven INTEGER, gremmiesRecieved INTEGER, selectedSeal INTEGER)").then(() => {
        sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.author.id, 1, 0, 0]);
        if (message.mentions.members.first())
			sql.run(`INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [${message.mentions.members.first().id}, 0, 0, 0]`);

      });
    });

    if (message.mentions.members.first() != undefined){

      var Response = "Here's a freshly baked GremmieSeal (TM) as a thanks for your quality post, " + message.mentions.members.first() + "!";

     sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().id}"`).then(row => {
       if (message.mentions.members.first() != undefined) {
        if (row === undefined) {
          sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.mentions.members.first().id, 0, 0, 0]);

        }
        sql.run(`UPDATE scores SET gremmiesRecieved = ${row.gremmiesRecieved + 1} WHERE userId = ${message.mentions.members.first().id}`);
        if (row.gremmiesRecieved >= 20 && !message.mentions.members.first().roles.find("name", "Gremmie Approved")) {
          message.guild.members.get("291754013131538432").send(`user ${message.mentions.members.first().username} has >= 20 GremmieSeals received. It may be time to give them GremmieApproval`)
          logAction(`user ${message.mentions.members.first().displayName} has >= 20 GremmieSeals received. It may be time to give them GremmieApproval`);

        }
      }
     })
    }

    if (message.mentions.members.first() === undefined) {
      var Response = "Here's a  freshly baked GremmieSeal (TM) as a thanks for your quality post!";
    }

    var GremmieSig = "GremmieSeal Dispensed - time: " + new Date() + " User: " + message.author.username;

    logAction(GremmieSig);
    sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(rowSeals => {

    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
	  var slotInt = parseInt(row.selectedSeal,10);
	  var sealText = "SealText Empty error";
      if (!row.selectedSeal) row.selectedSeal = 0;

    if (slotInt >= 0) {
		sealText = seals[slotInt];
	} else { 
		if (rowSeals) {
			let fetch = "ID OUT OF RANGE ERROR3";
			if (slotInt == -1) fetch = rowSeals.slot1;
			if (slotInt == -2) fetch = rowSeals.slot2;
			if (slotInt == -3) fetch = rowSeals.slot3;
			
			sealText = fetch;
		} else {
			sealText = seals[0];
		}
		
	}
	  if (sealText === undefined || sealText === null)
		  sealText = seals[0];
	  message.channel.send(Response + " " + sealText.split('|')[0]);
	
	  
    })
	});

    console.log(GremmieSig);
  } else {
    if ((message.content.startsWith("!GremmieSeal") && !message.member.roles.find("name", "Gremmie Approved"))) {
      message.reply("Sorry, but it looks like you aren't Gremmie Approved.");
      logAction("Unauthorized user attempted to dispense seal - User: " + message.author.username);
      console.log("Unauthorized user attempted to dispense seal - User: " + message.author.username);
    }
  }

  if (command === "TerminateGremmie" && contains(turbolish, message.author.id)) {
    message.channel.send("Goodbye! GremmieSealBot is shutting down.");

    client.destroy((err) => {
      console.log(err);
    });
  }  else {
    if (message.content.startsWith("!TerminateGremmie") && !contains(turbolish, message.author.id)) {
      message.reply("Hi, yes, please don't do that. This command is reserved for those with Turbolish");
      logAction("User " + message.author.username + " attempted an unauthorized shutdown. Time: " + new Date());
    }
  } 

  if (command === "GiveSeals" && contains(turbolish, message.author.id)) {
	  
	  

    var sealCountToGive = parseInt(message.content.split("|")[1], 10);
	
	if (message.mentions.members.first() != undefined && !(sealCountToGive != sealCountToGive)) {
		sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().id}"`).then(row => {
		  if (row.gremmiesRecieved)
		  sql.run(`UPDATE scores SET gremmiesRecieved = ${row.gremmiesRecieved + sealCountToGive} WHERE userId = ${message.mentions.members.first().id}`);
		  message.reply(`Sucessfully given *${sealCountToGive}* GremmieSeals to user *${message.mentions.members.first().displayName}*`);
		})
	} else {
		message.reply(`Syntax error. Please use this format when mass sending:
		\`!GiveSeals @USERHERE | SEALCOUNT\``);
	
	}


  }

  if (command === "GremmieSays" && contains(turbolish, message.author.id) && guildConf.fun === "true") {
	  
	  if (message.guild.members.get(`${client.user.id}`).hasPermission(`MANAGE_MESSAGES`)) {
		  message.channel.send(message.content.slice("!GremmieSays".length));
			
		  message.react("✔").then();
		  message.delete(500);
	  } else {
		  message.channel.send("That action could not be completed elegantly with the given permissions.").then(mes => mes.delete(5000)); 
		  message.react("❌");
	  }
	  
  } else if (command === "GremmieSays" && !contains(turbolish, message.author.id)) {
	  message.channel.send("Sorry, but this command requires TurboLish level GremmieClearance to use.");
	  message.react("❌");
  }
  
  if (command === "GremmieJoke" && guildConf.fun === "true") {

    var pickedJoke = pickRandomFromArray(jokes);
    message.channel.send(pickedJoke);
    console.log("Joke Dispensed!");
  }

  if (command === "GremmieStats") {
	if (!message.mentions.members.first()) {
		sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
		  if (!row) return message.reply("You don't yet have stats.");
		  message.reply(`Gremmies Sent: ${row.gremmiesGiven} -- Gremmies received: ${row.gremmiesRecieved} `);
		});
	} else {
		sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().id}"`).then(row => {
		  if (!row) return message.reply("*couldn't find stats for that user.*");
		  message.reply(`Gremmies Sent: ${row.gremmiesGiven} -- Gremmies received: ${row.gremmiesRecieved} `);
		});
	}
  }


  if (command === "ForceGremmieJoke" && guildConf.fun === "true") {
    var parsedJoke = jokes[parseInt(args[0], 10)];
        message.channel.send(parsedJoke).catch(() => {
        message.channel.send("That joke has an empty value, or does not exist.")
    });

  }

/*   if (message.content.startsWith("!SqlDebug") && (message.member.roles.find("name", "Meme-Police") || message.member.hasPermission(`https://www.youtube.com/watch?v=jP92cqTxG7I`))) {
    sql.run(`GET * FROM scores WHERE userId = "${message.mentions.members.first().id}"`).then(row => {
      if (!row) return message.reply("Debug fetch failed: You may not have a table entry. Try giving a GremmieSeal.");
      if (row)  message.reply(`id ${message.mention.members.first().id} gG ${row.gremmiesGiven} gR ${row.gremmiesRecieved}, sG ${row.selectedSeal}`);
  });

  } */


  if (command === "GremmieHelp") {
    message.channel.send(`Hello! I am GremmieSealBot. My purpose is to dispense GremmieSeals to those who are worthy. Anyone with the \"Gremmie Approved\" role can send a GremmieSeal by simply typing \"!GremmieSeal\". You may also mention a reciepient of said GremmieSeal after the command (ex. \"!GremmieSeal @FrickinHecker\").
	\nSome other commands: \n \"!GremmieJoke\" - Tells a random joke
	\n \"!TerminateGremmie\" (TurboLish Only) - Exits the bot
	\n \"!ForceGremmieJoke\" - Force a specified joke by ID
	\n \"!GremmieStats\" - Retrieves the user's stats (How many GremmieSeals the user has sent, and received)
	\n \"!TopStats\" - Shows the stats for the user with the most GremmieSeals.
	\n \"!GremmieBugReport\" - Reports an issue with GremmieSealBot to Tuggi, so he can fix it. 
	\n \"!SealCatalog\" - Shows all available GremmieSeals 
	\n \"!PatchNotes\" - Displays patch notes for all updates.
	\n \"!SetSeal\" - Sets the user's GremmieSeal. Type \"!SetSeal\" followed by the seal's id. You can get it's ID with !SealCatalog 
	\n \"!GiveSeals\" (TurboLish Only) - Gives the mentioned user a set amount of seals. Ex: \"!GiveSeals @FrickinHecker#5233 | 6\" Write the amount of seals after the mention, seperated by a \"|\"
	\n \"!AddCustomSeal\" (Admin Only) - Adds a custom seal, only available on your server. Syntax: \`!AddCustomSeal ID (1-3) | IMAGE LINK | PRICE\`
	\n \"!SetProperrty\" (Admin Only) - Sets a server property. These change how the bot will behave in your server.
	\n	fun (true/false, defaults to true) - Enables fun commands, like !GremmieJoke.
	\n	beta (true/false, defaults to false) - Enables beta commands.
	\n	prefix (Any character, any length, defaults to !) - Changes how you invoke the bot.
	\n \"!GremmieInfo\" - Shows bot info \n\n Debug commands may not always be stable/functional, Production, low level commands will always work, and be available.
	\n If a command isn't working as intended, please use \"!GremmieBugReport\", followed by the problem you are experiencing.
	
	\n\n In ${client.guilds.size} servers. Latency is ${new Date().getTime() - message.createdTimestamp}ms.`);

    }

  if (command === "GremmieBugReport") {
    var report = message.content.slice("!ForceGremmieJoke".length);

    //message.guild.members.get("291754013131538432").createDM();
    logAction(`User ${message.author.username} reported bug: ${report}`);

  }




});

function getSealFull(ID, message) {
	 if (ID >= 0) {
		return seals[ID];
	} else { 
		sql.get(`SELECT * FROM seals WHERE serverID = "${message.channel.guild.id}"`).then(cSeals => {

			let fetch = "ID OUT OF RANGE ERROR";
			if (ID == -1) fetch = cSeals.slot1;
			if (ID == -2) fetch = cSeals.slot2;
			if (ID == -3) fetch = cSeals.slot3;
			
			return fetch;
		
		});
	}
	
	return "ID FAILURE ERROR";
}


function pickRandomFromArray(toPickFrom) {
  return toPickFrom[Math.floor(Math.random() * toPickFrom.length)]

}


function logAction(textToLog) {
  fs.appendFile('log.txt', textToLog + "\n", function (err) {
    if (err) {
      console.log("GREMMIELOG FAILED");
    } else {
      console.log("GREMMIELOG CREATED");
    }
  })

}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};


client.login(config.token);