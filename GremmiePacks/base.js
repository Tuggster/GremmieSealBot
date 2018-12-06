const sql = require("sqlite"); // Sqlite library - Used to store user data.

module.exports = function(client, Discord, settings, seals, config, logAction) {

  var module = {};
  var settings = settings;

  module.name = "base";
  module.desc = "Base GSB functionality";

  module.initSQL = function() {

    sql.open("score.sqlite"); // This line opens the scores document.
  },

  module.updateSettings = function(settings) {
    this.settings = settings;
  },

  module.onMessageRecieved = function(message, command, args) {

    if (command === "PatchNotes") { // If the user wants patchnotes, hand them over!
  	  module.patchNotes(message);
    }

    if (command === "GremmieInfo") { // If the user wants info, hand it over!
      module.gremmieInfo(message);
    }

    if (command === "GremmieFarewell") { // allow users to send GremmieFarewell messages.
  	  module.gremmieFarewell(message);
    }

    if (command === "SealCatalog" || command === "GremmieCatalog") { // Let the user fetch the list of seals.
      module.gremmieCatalog(message);
    }

    if (command === "SetSeal") {
      module.setSeal(message, args);
  	}

    if (command === "GremmieSeal" && message.member.roles.find("name", "Gremmie Approved")) { // Does the user have Gremmie Approval?
      module.gremmieSeal(message);
    } else {
      if ((message.content.startsWith("!GremmieSeal") && !message.member.roles.find("name", "Gremmie Approved"))) { // If the user isn's Gremmie Approved, throw a big fit.
        message.reply("Sorry, but it looks like you aren't Gremmie Approved.");
        logAction("Unauthorized user attempted to dispense seal - User: " + message.author.username);
        console.log("Unauthorized user attempted to dispense seal - User: " + message.author.username);
      }
    }

    if (command === "GiveSeals" && contains(config.turbolish, message.author.id)) { // Lets users mass send seals.
      module.giveSeals(message);
    }

    if (command === "GremmieSays" && contains(config.turbolish, message.author.id) && guildConf.fun === "true") { // Lets turbolish users impersonate GSB.
      module.gremmieSays(message);
    } else if (command === "GremmieSays" && !contains(config.turbolish, message.author.id)) { // If the user doesn't have permissions, tell them!
  	  message.channel.send("Sorry, but this command requires TurboLish level GremmieClearance to use.");
  	  message.react("❌"); // Add the reactions, they look cool!
    }

    if (command === "GremmieStats") { // Allow a user to get their stats.
      base.gremmieStats(message);
    }


  },

  module.patchNotes = function (message) {
    fs.readFile('patch.txt', 'utf8', function(err, contents) { // Use FS to read the patchnotes file.
      return console.log(err) // If we've got errors, log them.
      message.channel.send(`Patch notes:\n${contents}`); // Send the message!
    });
  },

  module.gremmieInfo = function (message) {
    message.reply(`GremmieSealBot is currently active in ${client.guilds.size} servers. Latency is ${new Date().getTime() - message.createdTimestamp} ms.\nProudly serving ${client.users.size} users. Uptime is ${Math.trunc(client.uptime / 1000 / 60)} minutes, or ${Math.trunc(client.uptime / 1000 / 60 / 60)} hours`);
  },

  module.gremmieFarewell = function(message) {
    if (message.mentions.members.first() != undefined) // If there is a mention in the message, include it in the GremmieFarewell.
      message.channel.send(`Minion's blessing. ${message.mentions.members.first()} https://i.imgur.com/af19I27.jpg`);

    if (message.mentions.members.first() === undefined) // if there is no mention in the message, send a blank GremmieFarewell.
      message.channel.send(`Minion's blessing. https://i.imgur.com/af19I27.jpg`);
  },

  module.gremmieCatalog = function(message) {
    message.channel.send("These are all of the available seals. To select a seal, you must have a received Gremmies count greater than or equal to the seals price. If this condition is met, you then type \"!SetSeal\" followed by the seal's ID. To find it's ID, count it's position in the catalog, starting from 0. To find the ID of a custom seal, look at it's catalog entry. It will contain it's ID. Please include the - when purchasing them, as it is required to tell the standard seals apart from the custom seals."); // Send some info about the catalog.

    const embed = new Discord.RichEmbed() // Create a new RichEmbed.
    .setTitle("Today's GremmieSeal Catalog") // Set the embed's title.
    .setAuthor(client.user.username, client.user.avatarURL) // Set it's author, and avatar.
    .setDescription("Our seals:") // Give it a description.
    .setColor(0x7f0026); // Set it's color to a nice crimson.

    for (var i = 0; i < seals.length; i++) {
      embed.addField(`Seal #${i}`, `${seals[i]}`); // Loop through each seal, and add it's value to the embed.
    }

    // Grab the server's custom seal page.
    sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(row => {
      if (row.slot1 != "") // If the first slot is in use, send it's contents.
      embed.addField(`Custom Seal #1`, `${row.slot1}`);


      if (row.slot2 != "") // If the second slot is in use, send it's contents.
      embed.addField(`Custom Seal #2`, `${row.slot2}`);

      if (row.slot3 != "") // If the third slot is in use, send it's contents.
      embed.addField(`Custom Seal #3`, `${row.slot3}`);
    });

    return message.channel.send({embed}); // Send the embed.



    return;

  },

  module.setSeal = function(message, args) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => { // Pull up the user's GremmieStats page.

    var argInt = parseInt(args[0], 10); // See what GremmieSeal they want to select.



    if (argInt === undefined) { // If no seal was selected, send a werning.
      message.reply("Please type a seal ID following the command.");
    }

    sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(rowSeals => { // Pull up the server's custom seals.

    if (argInt < 0) { // If the seal's ID is less than zero, pull up the custom seals. Negative numbers are reserved for custom seals.

      var fetchedString = "ID OUT OF RANGE ERROR1";


      let fetch = "ID OUT OF RANGE ERROR2";
      if (argInt == -1) fetch = rowSeals.slot1; // If the first custom seal is requested, get it.
      if (argInt == -2) fetch = rowSeals.slot2; // If the second custom seal is requested, get it.
      if (argInt == -3) fetch = rowSeals.slot3; // If the third custom seal is requested, get it.

      fetchedString = fetch;



    if (argInt < -3 || argInt > -1) {
          message.reply("When using a custom seal, the ID must be between -1 and -3.");
          return; // Sound an alarm if the requested custom seal is invalid.
    }
    if (parseInt(fetchedString.split('|')[1], 10) <= row.gremmiesRecieved && argInt != undefined) { // Verify the user can afford the selected GremmieSeal.

      sql.run(`UPDATE scores SET selectedSeal = ${argInt} WHERE userId = ${message.author.id}`); // If they can, set their selected GremmieSeal.
      message.reply(`New seal set - ${fetchedString}`) // Inform them.
      //}
    } else {
      message.reply(`Sorry but you haven't received enough GremmieSeals to purchase this seal. You need: ${fetchedString.split('|')[1]} seals.`); // If they can't, inform them.
    }
    }
    });


    if (argInt >= 0) { // If a native seal is selected, continue.
      if (parseInt(seals[argInt].split('|')[1], 10) <= row.gremmiesRecieved && argInt != undefined) { // Make sure the seal exists, and can be afforded.
        message.reply("New Seal set - " + seals[argInt]); // Tell the user that the seal has been set.

        sql.run(`UPDATE scores SET selectedSeal = ${argInt} WHERE userId = ${message.author.id}`); // We lied to them. It hasn't yet been set. We do that here.

      } else {
      if (parseInt(seals[argInt].split('|')[1], 10) > row.gremmiesRecieved) { // If the GremmieSeal is to expensive, give it to them anyways, and repossess the user's car.
        message.reply(`Sorry but you haven't received enough GremmieSeals to purchase this seal. You need: ${seals[argInt].split('|')[1]} seals.`);
      }
    }
    }


    });

  },

  module.gremmieSeal = function(message) {
    if (message.mentions.members.first() && sql.get(`SELECT TOP 1 userId FROM products WHERE userId = ${message.mentions.members.first()}`)) // Has a reciepient without a GremmieStats profile been mentioned?
      sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.mentions.members.first().id, 0, 0, 0]); // Create a profile for them.


    var Response = "Here's a freshly baked GremmieSeal (TM) as a thanks for your quality post!"; // Create a string to store the response.

    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => { // Grab the sender's GremmieStats profile.
      if (!row) { // If doesn't exist, create it.
        sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.author.id, 1, 0, 0]);
      } else { // If it exists, add a sent point!
        sql.run(`UPDATE scores SET gremmiesGiven = ${row.gremmiesGiven + 1} WHERE userId = ${message.author.id}`);
      }


    }).catch(() => { // Catch any database errors.
      console.error;
      sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, gremmiesGiven INTEGER, gremmiesRecieved INTEGER, selectedSeal INTEGER)").then(() => { // Verify the main score table exists.
        sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.author.id, 1, 0, 0]); // Add the author's profile.
        if (message.mentions.members.first())
      sql.run(`INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [${message.mentions.members.first().id}, 0, 0, 0]`); // Add the reciepient's profile.

      });
    });

    if (message.mentions.members.first() != undefined) { //If there is a reciepient, this runs.

      var Response = "Here's a freshly baked GremmieSeal (TM) as a thanks for your quality post, " + message.mentions.members.first() + "!"; // Add the user's name into the messsage.

     sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().id}"`).then(row => { // Get the reciepient's page.
       if (message.mentions.members.first() != undefined) { // If they exist, continue.
        if (row === undefined) { // If their page doesn't exist, this runs.
          sql.run("INSERT INTO scores (userId, gremmiesGiven, gremmiesRecieved, selectedSeal) VALUES (?, ?, ?, ?)", [message.mentions.members.first().id, 0, 0, 0]); // Create their page.

        }
        sql.run(`UPDATE scores SET gremmiesRecieved = ${row.gremmiesRecieved + 1} WHERE userId = ${message.mentions.members.first().id}`); // Update their page.
        // if (row.gremmiesRecieved >= 20 && !message.mentions.members.first().roles.find("name", "Gremmie Approved")) { // If the reciepient isn't
        //   message.guild.members.get("291754013131538432").send(`user ${message.mentions.members.first().username} has >= 20 GremmieSeals received. It may be time to give them GremmieApproval`)
        //   logAction(`user ${message.mentions.members.first().displayName} has >= 20 GremmieSeals received. It may be time to give them GremmieApproval`);
        //
        // }
      }
     })
    }

    // If no reciepient is tagged, this runs.
    if (message.mentions.members.first() === undefined) {
      var Response = "Here's a  freshly baked GremmieSeal (TM) as a thanks for your quality post!"; // Create a response, without the mention.
    }

    var GremmieSig = "GremmieSeal Dispensed - time: " + new Date() + " User: " + message.author.username; // Create a signature to log.

    logAction(GremmieSig); // Log the signature.
    sql.get(`SELECT * FROM seals WHERE serverID ="${message.channel.guild.id}"`).then(rowSeals => { // Get the server's custom seals.

      sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => { // Get the sender's stats.
        var slotInt = parseInt(row.selectedSeal,10); // Get the user's selected seal, in integer format.
        var sealText = "SealText Empty error"; // Create a string for storing the GremmieSeal's image link. It starts with SealText Empty error - This will be sent if it's not assigned, which it should be.
          if (!row.selectedSeal) row.selectedSeal = 0; // If the user doesn't have a selected seal, set it to 0, the standard red seal.

        if (slotInt >= 0) { // If the seal is positive, meaning a default seal, this runs.
        sealText = seals[slotInt]; // Grab the seal from the array.
      } else {
        if (rowSeals) {
          let fetch = "ID OUT OF RANGE ERROR3"; // If the seal is custom seal, fetch the seal.
          if (slotInt == -1) fetch = rowSeals.slot1;
          if (slotInt == -2) fetch = rowSeals.slot2;
          if (slotInt == -3) fetch = rowSeals.slot3;

          sealText = fetch;
        } else {
          sealText = seals[0]; // If none of these attempts worked, just use the default seal.
        }

      }
        if (sealText === undefined || sealText === null) // If something went wrong, use the default seal.
          sealText = seals[0];

        message.channel.send(Response + " " + sealText.split('|')[0]); // Send the message!


      })
    });

    console.log(GremmieSig); // Spit the GremmieSig into the console.
  },

  module.giveSeals = function(message) {
    var sealCountToGive = parseInt(message.content.split("|")[1], 10); // Get the amount of seals that should be sent.

  	if (message.mentions.members.first() != undefined && !(sealCountToGive != sealCountToGive)) { // If the person to recieve the seals was indeed mentioned, this code runs.
  		sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().id}"`).then(row => { // Pull up the reciepient's stats.
  		  if (row.gremmiesRecieved) // If the stats are valid, continue.
  		    sql.run(`UPDATE scores SET gremmiesRecieved = ${row.gremmiesRecieved + sealCountToGive} WHERE userId = ${message.mentions.members.first().id}`); // Inject those GremmieSeals!

  		  message.reply(`Sucessfully given *${sealCountToGive}* GremmieSeals to user *${message.mentions.members.first().displayName}*`); // Report our success!
  		})
  	} else {
  		message.reply(`Syntax error. Please use this format when mass sending:
  		\`!GiveSeals @USERHERE | SEALCOUNT\``); // Report any syntax errors.

  	}
  },

  module.gremmieSays = function(message) {
    if (message.guild.members.get(`${client.user.id}`).hasPermission(`MANAGE_MESSAGES`)) { // Checks the bot's permissions
  	  message.channel.send(message.content.slice("!GremmieSays".length)); // See what the user wants GSB to say - we slice off the command from the message.

  	  message.react("✔").then(); // Add the checkmark reaction, it looks cool.
  	  message.delete(500); // Delete the old message.
    } else {
  	  message.channel.send("That action could not be completed elegantly with the given permissions.").then(mes => mes.delete(5000)); // If the bot doesn't have permissions, inform the user, and delete the message shortly.
  	  message.react("❌"); // Add a reaction.
    }
  },

  module.gremmieStats = function(message) {
    if (!message.mentions.members.first()) { // Check if the user wants their own stats.
  		sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => { // Pull their stats.
  		  if (!row) return message.reply("You don't yet have stats."); // If there are no stats for said user, abort!
  		  message.reply(`Gremmies Sent: ${row.gremmiesGiven} -- Gremmies received: ${row.gremmiesRecieved} `); // If there are stats, send em'.
  		});
  	} else { // If another user's stats are requested, handle it.
  		sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().id}"`).then(row => { // Pull the other user's stats.
  		  if (!row) return message.reply("*Couldn't find stats for that user.*"); // Abort if stats don't exist.
  		  message.reply(`Gremmies Sent: ${row.gremmiesGiven} -- Gremmies received: ${row.gremmiesRecieved} `); // Send the stats!
  		});
  	}
  }

  return module;


}
