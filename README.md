# GremmieSealBot
If you're interested in working on GSB, please, go ahead! Write some code (Please leave clear comments, I need to be able to quickly tell what's going on,) and make a pull request!
If you have any issues, or there is anything I forgot, please contact me.

---

A nice discord bot to dispense GremmieSeals

We've got some commands for you to use!

!GremmieJoke - Tells a joke!
!GremmieSeal - Sends a GremmieSeal to someone! This is arguably the most important command, and the main reason this bot was created.
!GremmieStats - View your statistics!

  !PatchNotes - Gets the latest patchnotes!

  !SetProperty (Admin Only!) - Args: Property, and Value. - Sets the value of a property.
  
  !GetProperties (Admin Only) - Gets a list of all server properties, and their values.
  
  !GremmieHelp - Sends a list of commands!
  
  !GremmieBugReport - Args: Message - Sends a message to me, please only send bug reports.

  !GremmieInfo - Gets info about the bot!
  
  !TopStats (Beta must be enabled!) - Gets the statistics for the top 3 users.

  !AddCustomSeal (Admin Only!) - Adds a custom seal to the custom seal list. Here is a handy dandy formatting guide! SLOT NUMBER | IMAGE LINK | SEAL PRICE -- You must include the "|"s, they seperate arguments.

  !GremmieFarewell (Fun must be enabled!) Send a farewell message to a friend!

  !SealCatalog (Or !GremmieCatalog!) - Shows the available GremmieSeals.

  !SetSeal - Args: Seal ID (The seal you wish to select.) - Use this command to select a seal from the catalog. You must be awarded seals to purchase more seals.

---
# Custom Modules

To write a custom module for GSB, create a javascript file in the GremmiePacks folder. Give your file a creative title!

## Creating a main function: 
You're going to want to begin your module with a main function - Repeat after me:
```
module.exports = function() {
  var module = {};
  
  var data = { // This variable contains everything you'd like to import from GSB. This example has every option in it, please, only use what you need.
    client: undefined, // The discord client object.
    discord: undefined, // The discord object
    settings: undefined, // The settings object - enmap
    modules: undefined, // The modules object - stores all of the modules!
    seals: undefined, // All of GSB's seals!
    logAction: undefined // The function to log data to GSB's log file. Only import this if you really need this.
  } 
  module.data = data; // It's nice to share!


  module.loadData = function(client, discord, settings, modules, seals, logAction) { // This is what GSB calls to load in all of the data! Only put what you'd got in data.
    data.client = client;
    data.discord = discord;
    data.settings = settings;
    data.modules = modules;
    data.seals = seals;
    data.logAction = logAction;
  }
  
  module.name = "name goes here";
  module.desc = "description goes here."
  
  return module;
}
 
```
Run appv2.js by opening cmd in your GSB directory, and running ```node app.js```.
You're looking for a message along the lines of ```Loaded module -- Module name: base -- Module description: Base GSB functionality```

Assuming all goes well, you should now have a basic, functionless module that can be picked up by GSB!

You don't need that data variable, that's just how I choose to store my module data.


## Adding functionality

Now that GSB can see your module, you're going to want to make it do something, right?
Follow these simple steps to do just that!

```
...
module.desc = "description goes here."

module.onMessageRecieved = function(message, command, args) {
    
}
...
```

In this function, you'll have access to a discord.js message object, a command, and an array of arguments.
For inspiration, check out base.js, or partyTime.js.

If you make something you think is cool, please, submit a pull request, and I'd be more than happy to check it out!

---
To add GSB to your discord server, follow this link!
https://discordapp.com/oauth2/authorize?client_id=397089441404944394&scope=bot&permissions=0



