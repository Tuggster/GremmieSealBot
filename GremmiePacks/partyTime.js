// Here is a little example module I've written.
module.exports = function() { // Our main function - this gets run on bot startup. It'll import our client, discord object, server configurations, seals, and the logAction funct.

  var module = {}; // Our module! Store functions and variables here.

  var data = { // Create an object to store our data. You can do this however you wish, but I like objects.
    client: undefined,
    discord: undefined
  }

  module.data = data; // Share the data.

  module.loadData = function(client, discord) { // Allow GSB to send us data.
    data.client = client;
    data.discord = discord;
  }

  module.name = "partytime"; // The module's name. Make it descriptive!
  module.desc = "hell yeah borther am PARTIE TIME"; // The module's description - Make this one really descriptive!

  module.onBotReady = function() { }, // The onBotReady function is called upon GSB's launch! While it's not used in this example, I left it here to show that it's available.

  module.onMessageRecieved = function(message, command, args) { // onMessageRecieved is automatically called by GSB when a message is recieved.
    //console.log(`OMR tripped - ${message.content}`); // This is a debug statment to let you know that the OMR function was called.
    if (message.content.includes("party")) { // This line checks for any message containing the word "party"
  	  module.throwParty(message); // If we find a message with party in it, run our party function.
    }
  },

  module.throwParty = function(message) { // The party function! Pretty much useless, it's one line, and is used once. Just here to show off functions.
    message.reply("hell yeah am party \n\n this message courtesy of the party time module."); // Reply with a party message.
  }

  return module; // Return our module's contents. This line should always come after all of your functions / variable declerations, so that they can be passed on to GSB.
}
