const guildConf;


module.exports = function() {

  var module = {};

  var data = {
    client: undefined,
    discord: undefined,
    config: undefined,
    settings: undefined
  }

  module.data = data;

  module.loadData = function(client, discord, settings, config) {
    data.client = client;
    data.discord = discord;
    data.config = config;
    data.settings = settings;
  }

  module.name = "partytime";
  module.desc = "hell yeah borther am PARTIE TIME";

  module.onBotReady = function() {
    guildConf = settings.get(message.guild.id) || defaultSettings;
  }

  module.onMessageRecieved = function(message, command, args) {
    if (command === "Interrogate") {
      module.interrogate(message);
    }
  }

  module.interrogate(message) {
    let user = message.mentions.members.first; // Get the mentioned user, and save them in a variable.
    const image = guildConf.interrogate_image;
    const role = message.guild.roles.find(role => role.name === guildConf.interrogate_role);

    if (user != undefined) {
      message.channel.send(`looks like you done fricked up, kid... ${image}`);
      user.addRole(role).catch(function() {
        message.channel.send(`As much as I'd like to curbstomp this little boy, ${message.author}, I've encountered an error, and can't continue!`);
      });
    } else {
      return message.reply(`Looks like you didn't mention a user to interrogate!`);
    }

  }


  return module;
}
