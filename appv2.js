const Discord = require('discord.js'); // Discord.js api - Required
const client = new Discord.Client(); // Discord.js bot object - Required
const fs = require('fs') // Node.js filesystem library
const stream = require('youtube-audio-stream') // Youtube audio streaming library - Optional
const search = require('youtube-search'); // Youtube search API - Optional
var fetchVideoInfo = require('youtube-info'); // Youtube video info getter - Optional
const opus = require('node-opus'); // Opus audio codec - Required.

const config = require("./config.json"); // Config JSON file - Required, as the token is loaded from it.

var gremmiePacks = []; // Get ready for some GremmiePacks!
var base; // Var to store base module.

var servers = {}; // List of current servers. Used by GremmiePlay to store queue info. Required.

var insults = [`your mom gay`, `your granny tranny`, `your sister a mister`]; // Lame jokes that GSB can respond to - Alton suggested this feature.
var comebacks = [`your dad lesbian`, `your grandpap a trap`, `your family tree lgbt`]; // How GSB responds to the jokes - 1/1 map between joke and comeback.

var prompt = require(`prompt`); // Prompt library - Not currently used. Pulls user input from console.

const Enmap = require('enmap'); // Enmap, used to store server prefrences.
const Provider = require('enmap-sqlite'); // One of Enmap's denendancies.
const settings = new Enmap({provider: new Provider({name: "settings"})}); // Enmap settings object




const defaultSettings = { // Settings template for new servers.
  prefix: "!", // The prefix that GSB responds to
  fun: "true", // Is fun mode on?
  beta: "false" // Is beta mode enabled?
}

// const userPrefsDefault = { // Soon to be user prefrences template
  // custom
// }


function stopMusic(message) { // Stops music playback, beta mode, unstable
	var server = servers[message.channel.guild.id]; // Get the object for the current server.

	if (message.guild.voiceConnection) { // Check if the server has an active voice connection - Is the bot currently in a voice channel?
		message.guild.voiceConnection.channel.leave(); // Leave the voice channel, if in one.
		server.queue = []; // Empty the server's queue.
	} else { // Are we not in a voice channe
		message.channel.send("There was no music to be stopped!"); // If so, warn the user.
	}
}


function getQueue(message) { // Spit out the server's music queue!
	if (!servers[message.channel.guild.id]) servers[message.channel.guild.id] = {
		queue: [] // If the server doesn't have a queue, make a blank one for it.
  }

	var server = servers[message.channel.guild.id]; // Get the server's queue.
	if (server.queue[0]) { // If the queue contains music, continue.
		let queueText = `Queue:\n` // Initilize a string to store the queue in.
		for (var i = 0; i < server.queue.length; i++) {
			queueText += `Song #${i+1}: ${server.queue[i]}\n`; // Add each song's name into the queue text.
		}
		message.channel.send(queueText); // Send a message containing the queue
	} else {
		message.channel.send("Sorry, but there is no active queue in this server."); // If there is no queue, warn the user.
	}
}

function playSong(message) { // Play a song!
    if (!message.member.voiceChannel)
		message.reply("Please join a voice channel, so the Gremlins know where to blast those tunes!"); // If the user isn't in a voice channel, warn them.

	if (!servers[message.guild.id]) servers[message.guild.id] = {
		queue: [] // If the server doesn't have a queue, make one.
	};

	var server = servers[message.guild.id]; // Get the server's queue.
	if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){ // If the bot isn't in a voice channel, join the user's channel.
		try {
			server.dispatcher = connection.playStream(stream(server.queue[0])); // Play the video.
		} catch (e) {
			message.channel.send("Ouchies, something went wrong"); // Report any errors that may have occured.
		}

		server.queue.shift(); // Remove the first song in the queue, because we just played it, and shift the rest of the songs down.

		server.dispatcher.on("end", function() { // Create a callback for when the song ends.
			if (server.queue[0]) playSong(message); // If there are more songs in the queue, play them.
			else {
				message.channel.send("Music is over, the Gremlins are out of here!"); // If not, inform the user, and leave.
				connection.disconnect();
			}
		});
	})
}

function searchfunc(message) { // Search youtube for a video!
  var server = servers[message.channel.guild.id]; // Get the server's queue.
  let opts = {
    key: "AIzaSyDekZMp8HiuJbzHtm98rB2gYIPO5BMBaQ8", // My youtube API key - You can use it, if you want.
  }
  let args = message.content.slice("!GremmiePlay".length); // Get the arguments for the command. We just slice off the !GremmiePlay part, and that'll give us what we want. This won't work with custom prefixes over one character, and should probably be changed.
  let name = args; // Save the args as a variable called name, this is super redundant, but it's probably important.
  try {
  search(name, opts, (err, results) => { // Search for the video!
	  if (!results[0]) {
		  message.reply("No results found!"); // If nothing is found, inform the user.
      return; // Quit running the code, because nothing was found.
	  }


      if(err) return console.log(err); // If any errors are thrown, log them.
      server.queue.push(results[0].link); // Add the song to the queue.
	  console.log(`Song queued: ${name}`);

    })
  } catch (error) {
	  throw new Error (error);
	  console.log("Error on youtube search. Name field might be empty."); // Log any errors thrown by the search request.
	  message.channel.send("Error! Couldn't find video."); // Tell the user something is up.
  }
};

client.on("guildBanAdd", (guild, user) => { // This code runs when someone gets banned.
	const defaultChannel = guild.channels.find(`name`,`general`); // Find the server's default channel, if applicable.
	defaultChannel.send(`${user.username} got banned lol`); // Mock the banned user in the general channel.

})

client.on("guildCreate", guild => { // This code runs when GSB joins a new server.
	logAction(`New server joined - ${guild.name}`);

	settings.set(guild.id, defaultSettings); // Create a properties object for this new server, using the server's ID as the key.

  const defaultChannel = guild.channels.find(`name`,`general`); // Pull the server's default channel.

	if (defaultChannel) // If a default channel was found, send our welcome message.
		defaultChannel.send("Hello! I am GremmieSealBot. I have automatically created some roles for you. The most important one is \"Gremmie Approved\". Give this role to all users who are allowed to send GremmieSeals. Some commands require the user to have an admin role.")

  // If the server doesn't have the Gremmie Approved role, create it for them.
	if (!guild.roles.find("name", "Gremmie Approved")) {

		guild.createRole({ // This function creates a role for the server. It takes a few arguments.

		name: 'Gremmie Approved', // The role's name
		  color: 'BLUE', // The role's color.
		})
	  .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`)) // After the role has been created, log it.
	  .catch(console.error) // If something goes wrong here, log that, too.
	}
});


client.on("guildDelete", guild => { // This code runs when GSB leaves a server.
  console.log("I've left a server."); // Log it!

  settings.delete(guild.id); // Remove the server. We use the server's ID as the key.
});

function getRandomIntInclusive(min, max) { // This code wasn't written by me. I got it here - https://gist.github.com/smittyfest/387e21bd59cc0717263d54d01555a0c5
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// The list of GremmieSeals! Formatting is as follows - "SEAL LINK |SEAL PRICE| DESCRIPTION" - Normally, the description shows the price, and seal's ID. A seal's ID is it's position in the array, starting from zero.
var seals = ["https://i.imgur.com/LkP71Kr.png |0| Price: 0 - ID: 0", "https://i.imgur.com/nK3Wee5.png |25| Price: 25 - ID: 1", "https://i.imgur.com/35KMlDe.png |35| Price: 35 - ID: 2", "https://i.imgur.com/WKomEDw.png |35| Price: 35 - ID: 3", "https://i.imgur.com/WfSzveW.png | 420 | Price: 420 - ID: 4 | 2018 April 1st joke -- It costs 420, LOL XD"]

// A library of jokes for GSB to tell!
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
	   "WAXS MY SKIIS, WAX THEM GOOD, WAX THEM, OR I'M GOING TO STAB YOU IN A NEIGHBORHOOD", // This joke was suggested by Riley, someone I know. Please direct all complaints about this joke to him.
	   "Did you stir my chicken?", // Riley came up with this one too. It's slightly better.
		"Did somebody ring the dinkster?",
		 "Riley plays Fortnite" // He does.
          ];

// Messages to send upon being mentioned.
var menMessages = ["Hello!", "Nice to see you again.", "That's me, GremmieSealBot!", "I love you, :b::b:", "How is your day going?", "Always nice to talk to you", "Thanks for talking to me!", "Our gremlins are bottled at the source", "All natural gremmies since 1988", "REDACTED"];
const sql = require("sqlite"); // Sqlite library - Used to store user data.
sql.open("score.sqlite"); // This line opens the scores document.

let flashCount = 0; // An internal counter for !Flash
let flashMax = 10; // The amount of times to flash the staus indicator when running !Alert
let flashTimer = 100; // How many miliseconds to stay in DND mode while flashing.

function flashA() { // Run this to flash the status indicator red, many times. I think it's fun.
	if (flashCount < flashMax) { // If we need to keep flashing, continue.
		flashCount++; // Increment the flash counter
		client.user.setStatus(`dnd`); // Set the status to DND

		client.user.setActivity('ALERT', { type: 'PLAYING' }) // Set the activity to alert


		setTimeout(flashB, flashTimer); // Set a timer, which will run flashb, and turn the indicator back to it's standard color.
		console.log(`a`); // Log that we've just flashed.
	} else {
		flashCount = 0; // Reset the counter, if we don't need to keep flashing
		console.log(`done`); // Log that we've finished.

		return; // Return.
	}
}

function flashB() { // !Flash's green counterpart.
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

function dmCode(message) { // Code that runs when GSB gets sent a direct message.
	if (message.author.bot) // If the message was sent by another bot, ignore it.
		return;

    if (!message.content.startsWith("!")) // If the message isn't a command, treat it like GSB has just been mentioned.
		  mentionConversation(message, false);


	  if (message.content.startsWith("!Announce") && contains(config.turbolish, message.author.id)) { // If the message is asking GSB to make an announcement, and the user has sufficent privlages, continue.
		  for (var i = 0; i < client.guilds.size; i++) {
					const guild = client.guilds.first(client.guilds.size)[i]; // Go through every known server, and get their server object.
					const defaultChannel = guild.channels.find(`name`,`general`); // Find their default channel.
					defaultChannel.send(`Announcement: ${message.cleanContent.slice("!Announce ".length)}`); // Send the announcement to every known default channel.
		  }
	  }

	  if (message.content.startsWith("!RemoteConnection") && contains(config.turbolish, message.author.id)) { // If the message is asking GSB to give his remote connection file, continue.
		  message.channel.send(`Here you go! \nUsername: \"ADMINISTRATOR\"\nPassword: \"GSBServer1010\"\nPlease send your public IP address to Tuggi, so you may be allowed access. \n \"To get your public IP, just google \"What's my IP?\"\"`, {
			  files: [
				"./remote.rdp" // Send the file.
			  ]
		  })
	  }

	  if (message.content.startsWith("!SetGame") && contains(config.turbolish, message.author.id)) {
		    client.user.setActivity(`${message.content.slice("!SetGame".length)}`) // If the command is asking GSB to set his activity, do it.
	  }

	  if (message.content.startsWith("!SetStatus")  && contains(config.turbolish, message.author.id)) { // If the user wants to change GSB's status, continue.
		  try {

  		  var args = message.content.slice("!SetStatus ".length).trim(); // Get the message's arguments.

  			if (args == "online" || args == "offline" || args == "idle" || args == "dnd") { // Check if the user is setting a valid status

  				  client.user.setStatus(args) // Set the status
  				  .then(console.log) // Log any errors
  				  .catch(console.error); // Catch the error, so we don't crash.
  				  message.reply("Status modification completed successfully."); // Inform the user that their changes were made successfully.
  			} else {
  				message.reply ("Status modification failed - please use a status of online, offline, idle, or dnd.") // If an invalid status was used, tell the user.
  			}

		  } catch (error) {
			  message.reply(`Fatal error - ${error}. Please use a status of online, offline, idle, or dnd.`); // If something goes very wrong, log it.

		  }
	  }

	  if (message.content.startsWith("!Alert")  && contains(config.turbolish, message.author.id)) { // If the user wants to flash the status indicator, let them do it.
		  flashCount = 0; // Reset the flash counter.
		  flashA(); // I added this feature because I thought it looked cool. It has literally no use.
	  }

	  if (message.content.startsWith("!MasterDebug") && contains(config.turbolish, message.author.id)) { // If the user has enough privlages, and they want to see some debug info, let them.
		  let debugInfo = `\nServerlist (${client.guilds.size}): \`` // Creates a string in which to store the message. We'll start with the serverlist.
		  for (var i = 0; i < client.guilds.size; i++) {
  			const guild = client.guilds.first(client.guilds.size)[i]; // Pull the info from each known server.

  			debugInfo += " | " + guild.name; // Add each server's name to the list. I seperate them with a |.
		  }

		  debugInfo += "\`"; // Close the quote we opened a while back.

		  debugInfo += `\n\n Userlist (${client.users.size}): \`` // Next is the userlist.
		  for (var i = 0; i < client.users.size; i++) {
				const user = client.users.first(client.users.size)[i]; // Fetch each individual user.
			    debugInfo += " | " + user.username; // Add their name to the list.
		  }
		  debugInfo += "\`"; // Close the quote we opened.

      // Add uptime to the message.
		  debugInfo += `\n\nUptime: \`${Math.trunc(client.uptime / 1000 / 60)} minutes, ${Math.trunc(client.uptime / 1000 / 60 / 60)} hours, or ${Math.trunc(client.uptime / 1000 / 60 / 60 / 24)} days. \``

      // Send the message!
		  message.reply(debugInfo)

	  }

    // If the user wants to recieve their username, send it to them! I have no idea why I wrote this, but I'll keep it.
	  if (message.content.startsWith("!GetUser")) {
      try {
		      message.reply(message.author.username); // Send a message containing the user's name.
      } catch (error) {
        message.reply(`Bad things happened! This command is intended for me, so I'll assume you're me, and send a readout of the your way -- ${error}`); // If bad, tell.
      }
	  }


	  if (message.content.startsWith("!Feedback")) { // If the user would like to send feedback, continue.
			  client.users.get("291754013131538432").send(`User DM to GSB ---- ${message.content}`); // Find me, then send the feedback to me.
			  message.channel.send("Feedback sent successfully!"); // Tell the user that all is indeed well.
	  }


}

//This function is called when someone is attempting to engane in a conversation with GSB.
function mentionConversation(message, mention) {

  // If the sender is a bot, return.
	if (message.author.bot)
		return;

  // If this function was called from a message contining a direct mention, continue.
	if (mention) {

	  if (message.mentions.members.first().id === client.user.id && !(message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
      // Send a random message back.
      message.reply(pickRandomFromArray(menMessages));
	  } else if (message.mentions.members.first().id === client.user.id && (message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
      // If the message is telling GSB that the sender loves it, then respond with a message saying that GSB loves them too.
      message.reply(menMessages[3]);
	  }
	}
    // Act differently if the message didn't directly mention GSB.
    if (!mention) {
		if (!(message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
		  message.reply(pickRandomFromArray(menMessages));
	  } else if ((message.content.toLowerCase().includes("love".toLowerCase()) || message.content.toLowerCase().includes("ily".toLowerCase()))) {
		  message.reply(menMessages[3]);
	  }
	}
}






// This code runs as soon as GSB is signed in to it's discord account.
client.on('ready', () => {

  // Check if there is a token in the config file.
  if (config.token != "") {
    let tokenObscured = ``; // Create a blank string for the obscured token to go into.
    for (let i = 0; i < config.token.length; i++) { // Loop through each character in the token.
      if (i < config.token.length - 10) { // If the current character isn't one of the last ten characters, continue.
        tokenObscured += `X`; // Place an X in it's place.
      } else { // If it is one of the final ten characters, continue.
        tokenObscured += config.token.split(``)[i]; // Insert the actual character.
      }
    }

    // Place the bot's obscured token into the console.
    console.log(`Loaded bot token: `);
    console.log(tokenObscured);

  }

  if (config.turbolish.length != 0) { // See if we've loaded the list of TurboLish approved users, they are fetched from config.json.
    console.log(`Loaded TurboLish userlist! --`) // Print that we've loaded the list.
    for (let i = 0; i < config.turbolish.length; i++) { // Get each user in the list.
      console.log(`${config.turbolish[i]} - ${client.users.get(config.turbolish[i]).username}`); // Place their ID, and name in the console.
    }
  }

	client.user.setActivity('!GremmieHelp', { type: 'LISTENING' }) // Set the status of the bot.

  // Load the list of servers.
	for (var i = 0; i < client.guilds.size; i++) {
				const guild = client.guilds.first(client.guilds.size)[i];
				servers[i] = guild;
	}


  // Sound the GremmieAlarms if something is up with the config file.
  if (config === undefined) {
    console.log("Config file not found!");
    console.log(`Please create config.json, and place your token in it.
    \n Example:
    \n {
    \n\"token\": \"sduiopfgyserukfyuiqwyeoyqWEJCY\"
    \n}`)
  }

  if (config != undefined && config.token === undefined) {
    console.log(`You've got a config file, but it doesn't look like it has a token in it.
    \n Example:
    \n {
    \n\"token\": \"sduiopfgyserukfyuiqwyeoyqWEJCY\"
    \n}`);
  }

  // Finally, GSB is ready to run!
	console.log('I am ready!\n');
	sql.run("CREATE TABLE IF NOT EXISTS seals (serverID TEXT, slot1 TEXT, slot2 TEXT, slot3 TEXT)"); // Create the score database if it doesn't already exist.


  var i = 0;

  require('fs').readdirSync(__dirname + '/GremmiePacks').forEach(function(file) {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
      var temp = require('./GremmiePacks/' + file)(client, Discord, settings, seals, config, logAction);

      gremmiePacks.push(temp);

      i++;
    }
  });

  for (var m = 0; m < gremmiePacks.length; m++) {
    var mod = gremmiePacks[m];

    if (mod.name === "base")
      base = mod;

    console.log(`Loaded module -- Module name: ${mod.name} -- Module description: ${mod.desc}`)

  }

  if (base != undefined)
    base.initSQL();
  else
    console.error("Couldn't prepare base module SQL.");


  for (var i = 0; i < gremmiePacks.length; i++) { // Loop through each installed module
    if (typeof gremmiePacks[i].onBotReady !== "undefined") // Check if the module has an onBotReady function
     gremmiePacks[i].onBotReady(); // Call it's onBotReady function.
  }
});


// This function is the heart of GSB. All of his commands go here. This function is called whenever a message is recieved by the bot.
client.on('message', message => {

  var row; // Declare a generic row variable for use with SQl based code later.


   // If the message was direct, take action!
   if (message.channel.type === "dm") {
	    dmCode(message);
      return;
    }

   // If GSB was mentioned, take action!
   if (message.mentions.members != undefined) {
	   if (message.mentions.members.first() == client.user) {
		   mentionConversation(message, true);
		   return;
	   }
   }

   // We don't want to respond to bots, so we'll return if we see a bot message.
   if (message.author.bot) return;


   // If the message is from an invisible turbo-lish user, we'll delete their message, and regurgitate it.
   if (contains(config.turbolish, message.author.id) && message.author.presence.status == "offline") {
	   if (message.guild.members.get(`${client.user.id}`).hasPermission(`MANAGE_MESSAGES`)) { // See if the bot can delete the user's message. We need to do this to regurgitate it.
		  message.channel.send(message.content); // Echo back the user's message.

		  message.react("✔").then(); // Respond with a check mark emoji - it looks cool.
		  message.delete(250); // Quickly delete the message. I don't do it instantly, because if it was instant, you wouldn't be able to see the checkmark.
	  } else { // If we can't delete the message, abort!
		  message.channel.send("That action could not be completed elegantly with the given permissions.").then(mes => mes.delete(5000)); // Tell them the command failed, and delete the failure message after 5 seconds.
		  message.react("❌"); // React with a cross emoji - I really like feedback like this. It makes GSB seem alive.
	  }

   }

   const guildConf = settings.get(message.guild.id) || defaultSettings; // Load the server's config file. If it's not here, we use the default settings.

   const args = message.content.split(` `/* /\s+/g */); // Split the message up into arguments, using a specially crafted regular expression. I didn't write this regex.
   const command = args.shift().slice(guildConf.prefix.length); // Get the command, and strip it of it's prefix.



  // You know what they say -- If someone says horsey surprise, you gotta show them this picture -
 	if ((message.content.includes("horsey surprise") || message.content.includes("horseysurpise")) && guildConf.fun === "true") {
	  message.channel.send("https://pbs.twimg.com/profile_images/1641005897/horseyavatar_400x400.jpg");
	}

  // Back in April of 2018, there was an excellent joke feature - @someone. It mentioned a random user, and it was quite cool, but got removed.
  if (message.content.includes("@someone")) // Check if the message includes @someone
    message.reply(`Random user selected - ${message.channel.members.random()}`); // Pick a random user, and mention them

  if (/* message.author.id == 312297956701372424 && */ message.content.includes("LOL") && guildConf.fun === "true") // Check if the message contains "LOL"
    message.channel.send("LOL"); // Respond back with LOL, to poke some fun at them.

  for (var i = 0; i < insults.length; i++) { // Loop through all of the possible insults
	  if (message.content.toLowerCase().trim().includes(insults[i].toLowerCase().trim()) && guildConf.fun === "true") { // Did we find an insult in the message? If so, is fun on?
		  message.reply(comebacks[i]); // Respond with one of our super lame comebacks!
	  }
  }

  // The beginning of GSB's new life! The gremmiePack - AKA module, because who needs naming consistency.
  for (var i = 0; i < gremmiePacks.length; i++) { // Loop through each installed module
    if (typeof gremmiePacks[i].onMessageRecieved !== "undefined") // Check if the module has an onMessageRecieved function
     gremmiePacks[i].onMessageRecieved(message, command, args); // Call it's onMessageRecieved function.
  }

  if (!message.content.startsWith(guildConf.prefix)) { // At this point, we're done with all of the goofy stuff, and we can stop if the message doesn't start with your selected prefix.
	   return; // Exit the function.
  }

  //BEGIN COMMANDS!


  if(command === "SetProperty") { // This code runs when the command is SetProperty. It is used to change the server properties.
	  console.log(`Value 1: ${args[0]}, Value 2: ${args[1]}`) // Log the command's arguments.

    //Check if the message's author is a admin, because you don't want random people modifying server properties, don't you?
    if(!message.member.hasPermission(`ADMINISTRATOR`)) return message.reply("You're not an admin, sorry!")

    const key = args[0]; // Save the key as a variable for quick access.
    if(!guildConf.hasOwnProperty(key)) return message.reply("That property does not exist.");  // Check if the key exists.

    guildConf[key] = args[1]; // Set the key to the new value.

    settings.set(message.guild.id, guildConf); // Save the changes.

    message.channel.send(`Server configuration item ${key} has been changed to:\n\`${args[1]}\``); // Inform the user of their changes.
  }

  if (command === "GetProperties") { // If the usedr wants to get the server properties, let them.

	  const embed = new Discord.RichEmbed() // Create a new RichEmbed.
				  .setTitle("Property list") // Set the embed's title.
				  .setAuthor(client.user.username, client.user.avatarURL) // Set it's author, and avatar.
				  .setDescription("Properties:") // Give it a description.
				  .setColor(0x00ce71); // Set it's color to a nice green.
				  Object.keys(guildConf).forEach(key => {
					embed.addField(key, `${guildConf[key]}`); // Loop through each key, and add it's value to the embed.
				  });

				return message.channel.send({embed}); // Send the embed.
  }
  // WARNING! These commands were written quite some time ago, and are quite bad! They're in "beta"...
  if (guildConf.beta === "true") { // These commands all pretain to music, which is a beta feature. They will only run if the server has beta enabled.
	   if (message.content.startsWith("!GremmieStop") && message.member.roles.find("name", "Gremmie DJ")) {
		  stopMusic(message); // If the user has the proper roles, let them stop the music.
	  } else {
		  if (message.content.startsWith("!GremmieStop") && !message.member.roles.find("name", "Gremmie DJ")) {
			  message.reply("You must be a Gremmie DJ to preform this action."); // If they don't have permission, stop them.
		  }
	  }

	  if (message.content.startsWith("!GremmieSkip") && message.member.roles.find("name", "Gremmie DJ")) { // Does the user want to skip this song? Do they have permission?
		  var server = servers[message.channel.guild.id]; // Get the server.
			  if (server.queue[0]) { // If there is another song to be played, play it.
				  //message.guild.voiceConnection.disconnect();
				  playSong(message);
				  message.channel.send("Song skipped.");
			  } else {
				  message.channel.send("There is no song to skip to. Did you mean to type \"!GremmieStop\"?"); // If there are no more songs, send a message.
			  }
	  } else { // If they don't have permission
		  if (message.content.startsWith("!GremmieSkip") && !message.member.roles.find("name", "Gremmie DJ")) { // If they don't have permission to skip, continue.
			  message.channel.send("Sorry, but only Gremmie DJs can skip songs."); // Don't skip the song, and inform them of their mistake.
		  }
	  }

	  if (message.content.startsWith("!GremmieQueue")) {
		  getQueue(message); // If they user wants the queue, hand it over!
	  }

	  if (message.content.startsWith("!GremmiePlay") && message.member.roles.find("name", "Gremmie DJ")){ // Does the user want to play some tunes? Do they have the proper role?

  		if(!args) return message.channel.send("The Gremlins can't play nothing! Please provide a song name/link."); // If the user didnt't provide a song link/name, tell them!

  		if(!message.member.voiceChannel) return message.reply("GSB requires you to be in a voice channel to play, so it knows where to go."); // If no voice channel is provided, stop.

  		if(!servers[message.channel.guild.id]) servers[message.channel.guild.id] ={
  			queue: [] // Create a queue, if one doesn't exists
  		}

  		var queue = servers[message.channel.guild.id].queue; // Get the queue.
  		var server = servers[message.channel.guild.id]; // Get the server.

  		if(args.indexOf("https") > -1 || args.indexOf("http") > -1) { // Check if the message starts with a link.
  		  message.reply("Adding URL "+args); // Respond with some nice feedback.
  		  server.queue.push(args); // Add the url to the queue.
  		} else{ // If the arguments wern't a url, do somethin' else!
  		  message.reply("Adding "+(message.content.slice("!GremmiePlay".length))); // Respond with a message about adding the video.
  		  searchfunc(message); // Search for the video.
  		}
  		  playSong(message); // Play the song!

  	  } else { // if they don't have permission, tell them.
  		  if (message.content.startsWith("!GremmiePlay") && !message.member.roles.find("name", "Gremmie DJ")) {
  			  message.reply("Sorry, to use this command, you must have the \"Gremmie DJ\" role.");
  		  }
    }
  }

  if (command === "SqlDelete" && contains(config.turbolish, message.author.id)) { // If a turbolish user wants to remove some SQL data, let them!
	  sql.run(`DELETE FROM scores WHERE userId= ${args}`) // Run an sql command, deleting the userdata.
  } else if (command === "SqlDelete" && !contains(config.turbolish, message.author.id)) {
	  message.reply("Sorry, but Turbolish is required to run this command.") // If not turbolish, inform the user.
  }

  if (command === "SqlDebug" && contains(config.turbolish, message.author.id)) { // If the user wants database information, hand it over!
	  const embed = new Discord.RichEmbed().setTitle("Sql Data Dump") // Create a new embed.
				  .setAuthor(client.user.username, client.user.avatarURL) // Set the name and author fields.
				  .setDescription("All user data:") // Set the description
				  .setColor(0x00AE86); // Set the color

	  for (let i = 0; i < client.users.array().length.clamp(0,25) - 1; i++) // Go through 25 of the users.
		  sql.get(`SELECT DISTINCT userId, gremmiesRecieved, gremmiesGiven FROM scores LIMIT ${i}, 1`).then(row => {
			  message.channel.send(`User ID: ${row.userId} -- Name: ${client.users.get(row.userId).username} - ${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`); // Send a message with the user's details
			  embed.addField(client.users.get(row.userId).username, `${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`); // Add the user details to the embed.

		  })

	  //return message.channel.send({embed}); // Send the embed.
  } else if (command === "SqlDebug" && !contains(config.turbolish, message.author.id)) {
	  message.reply("Sorry, but Turbolish is required to run this command.") // If the user is underprivlaged, tell them.
  }



  // if (command === "TopStats" && guildConf.beta == "true") {
	// 		const embed = new Discord.RichEmbed().setTitle("Leaderboards")
	// 			  .setAuthor(client.user.username, client.user.avatarURL)
	// 			  .setDescription("Here are the stats for the top 3 users:")
	// 			  .setColor(0x00AE86);
  //
  //
	// 		for	(var i = 0; i < 3; i++) {
	// 			sql.get(`SELECT DISTINCT userId, gremmiesRecieved, gremmiesGiven FROM scores ORDER BY gremmiesRecieved DESC LIMIT ${i - 1}, 1`).then(row => {
	// 				console.log(`Name: ${client.users.get(row.userId).username} - ${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`)
	// 				if (row.userId != undefined && row.gremmiesRecieved != undefined && row.gremmiesGiven != undefined) {
	// 					if (client.users.get(row.userId) != null) {
	// 						embed.addField(client.users.get(row.userId).username, `${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`);
	// 						message.channel.send(`Name: ${client.users.get(row.userId).username} - ${row.gremmiesRecieved} Gremmies Received -- ${row.gremmiesGiven} Gremmies Sent.`);
	// 					} else {
	// 							return message.channel.send("Oh darn, something went wrong here!");
  //
	// 						sql.run(`DELETE FROM scores WHERE userId=${row.userId}`)
	// 						embed.addField("FATAL ERROR", `Something went wrong (${row.gremmiesRecieved},${row.gremmiesGiven},${row.userId}  - This is debug information, pretend you didn't see it.)`);
	// 					}
	// 				} else {
	// 					return message.channel.send("Oh darn, something went wrong here!");
	// 				}
  //
	// 			})
	// 		}
	// 		//return message.channel.send({embed});
  //
  //
  //
	//   }


  if (command === "AddCustomSeal" && message.member.hasPermission(`ADMINISTRATOR`)) { // Does the user want to add a custom seal? Are they an admin?

    argsC = message.content.slice(command.length + guildConf.prefix.length).split(`|`); // Pull out the message arguments. This is now irrelevant, because of the new command/arguments system.
		try {
  		var slot = argsC[0]; // Get the slot the user wants to place the GremmieSeal in.
  		slot.trim(); // Remove any whitespace from the argument.
  		var slotInt = parseInt(slot, 10); // Parse the argument into an integer for use in code.

  		var imgLink = argsC[1]; // Pull the image from the arguments.
  		imgLink.trim(); // Remove the whitespace.

  		var price = argsC[2]; // Extract the seal's price.
  		price.trim(); // Trim any whitespace.
  		var priceInt = parseInt(price, 10); // Parse it as an int, so we can use it.

		} catch (e) { // Abort if something goes wrong.
			message.reply("It doesn't appear that this command was formatted correctly, here is a handy dandy formatting guide! \`SLOT NUMBER|IMAGE LINK|SEAL PRICE\`");
			return;
		}

		if (slotInt > 3 || slotInt < 1) { // If the seal is being placed in a non-existant slot, abort.
			message.reply("Sorry, that is an invalid ID, there are only three slots. Please use numbers 1-3.\nHere is a handy dandy formatting guide! \`SLOT NUMBER|IMAGE LINK|SEAL PRICE\`");
			return;
		}

    // Find the database row for this server.
		sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(row => {
			if (row) { // If the row exists, update that row, and place the new custom seal into the desired slot.
				sql.run(`UPDATE seals SET slot${slotInt} = "${imgLink}| ${priceInt} | Price: ${priceInt} - ID: ${slotInt * -1}" WHERE serverID = ${message.channel.guild.id}`);
				message.reply(`Added seal: ${imgLink} in slot ${slotInt}, with a price of ${priceInt}`);
			} else { // If the row doesn't exist, create it, and tell the user something went wrong.
				sql.run("INSERT INTO seals (serverID, slot1, slot2, slot3) VALUES (?, ?, ?, ?)", [message.channel.guild.id, "", "", ""]);
				message.reply("Sorry, I wasn't prepared for that. Could you please try again? I should be ready for the next go. \nHere is a handy dandy formatting guide! \`SLOT NUMBER|IMAGE LINK|SEAL PRICE\`");
			}
		});

	}  else { // If the user isn't an admin, which is required, tell them!
		if (message.content.startsWith("!AddCustomSeal")) {
			message.reply("This command is admin only.");
		}
	}

  // Add a dynamic joke - This one mentions a random person
  jokes[jokes.length] = `${pickRandomFromArray(message.channel.members.array()).displayName} is a rart XDDDD`;

  if (command === "TerminateGremmie" && contains(config.turbolish, message.author.id)) { // If a TurboLish level user wants to shut down the bot, let them! They're turbolish, after all.
    message.channel.send("Goodbye! GremmieSealBot is shutting down.");

    client.destroy((err) => {
      console.log(err);
    });
  }  else {
    if (message.content.startsWith("!TerminateGremmie") && !contains(config.turbolish, message.author.id)) { // Throw a fit if the user isn't allowed to shut GSB down.
      message.reply("Hi, yes, please don't do that. This command is reserved for those with Turbolish");
      logAction("User " + message.author.username + " attempted an unauthorized shutdown. Time: " + new Date()); // Log it.
    }
  }

  if (command === "GremmieJoke" && guildConf.fun === "true") { // Makes GSB tell jokes!

    var pickedJoke = pickRandomFromArray(jokes); // Grab a random jokes from the jokes list.
    message.channel.send(pickedJoke); // Send the joke!
    console.log("Joke Dispensed!"); // Log it.
  }



  if (command === "ForceGremmieJoke" && guildConf.fun === "true") { // Allows the user to force a specific joke.
    var parsedJoke = jokes[parseInt(args[0], 10)]; // Parse the joke number!
        message.channel.send(parsedJoke).catch(() => { // Send the joke.
          message.channel.send("That joke has an empty value, or does not exist.") // If it doesn't exist, abort!
        });

  }

/*   if (message.content.startsWith("!SqlDebug") && (message.member.roles.find("name", "Meme-Police") || message.member.hasPermission(`https://www.youtube.com/watch?v=jP92cqTxG7I`))) {
    sql.run(`GET * FROM scores WHERE userId = "${message.mentions.members.first().id}"`).then(row => {
      if (!row) return message.reply("Debug fetch failed: You may not have a table entry. Try giving a GremmieSeal.");
      if (row)  message.reply(`id ${message.mention.members.first().id} gG ${row.gremmiesGiven} gR ${row.gremmiesRecieved}, sG ${row.selectedSeal}`);
  });

  } */


  if (command === "GremmieHelp") { // Send the help message. This command is only one line of code, but it looks quite scary.
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
	\n \"!SetProperty\" (Admin Only) - Sets a server property. These change how the bot will behave in your server.
	\n	fun (true/false, defaults to true) - Enables fun commands, like !GremmieJoke.
	\n	beta (true/false, defaults to false) - Enables beta commands.
	\n	prefix (Any character, any length, defaults to !) - Changes how you invoke the bot.
	\n \"!GremmieInfo\" - Shows bot info \n\n Debug commands may not always be stable/functional, Production, low level commands will always work, and be available.
	\n If a command isn't working as intended, please use \"!GremmieBugReport\", followed by the problem you are experiencing.

	\n\n In ${client.guilds.size} servers. Latency is ${new Date().getTime() - message.createdTimestamp}ms.`);

    }

  if (command === "GremmieBugReport") { // Allow users to send some jokes!
    var report = message.content.slice("!GremmieBugReport".length); // Pull the report content.

    //message.guild.members.get("291754013131538432").createDM();
    logAction(`User ${message.author.username} reported bug: ${report}`); // Log the report.

  }




});

function getSealFull(ID, message) { // Fetches a seal. It even supports custom seals!
	 if (ID >= 0) {
		return seals[ID]; // If the seal is built in, just grab it. Nothing crazy required.
	} else {
		sql.get(`SELECT * FROM seals WHERE serverID = "${message.channel.guild.id}"`).then(cSeals => { // If the seal is custom, pull the server's custom seals.

			let fetch = "ID OUT OF RANGE ERROR"; // Create a variable to store the seal in.
			if (ID == -1) fetch = cSeals.slot1; // Set the seal, if the ID matches.
			if (ID == -2) fetch = cSeals.slot2;
			if (ID == -3) fetch = cSeals.slot3;

			return fetch; // return the seal.

		});
	}

	return "ID FAILURE ERROR"; // Return an error if no other seal was selected.
}


function pickRandomFromArray(toPickFrom) { // Grabs a random index from an array.
  return toPickFrom[Math.floor(Math.random() * toPickFrom.length)] // Take in the array from arguments, and pull a random index.

}


function logAction(textToLog) { // Log an action. It saves the action in log.txt.
  fs.appendFile('log.txt', textToLog + "\n", function (err) { // Append the text to the file.
    if (err) {
      console.log("GREMMIELOG FAILED"); // Console log any errors.
    } else {
      console.log("GREMMIELOG CREATED"); // Log the success!
    }
  })

}

function contains(a, obj) { // Checks if an array contains an object. I didn't write this, and can't find who did.
    for (var i = 0; i < a.length; i++) { // Loop through every index of the array.
        if (a[i] === obj) { // Does the item we're checking happen to be the one we want?
            return true; // If so, return true!
        }
    }
    return false; // If the item wasn't found, return.
}

/** I didn't write this, or it's description either. No clue who did.
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

// Sign in!
client.login(config.token);
