const { DMChannel } = require('discord.js');
const { State } = require('./utils');

module.exports = async function gameSetup(client, message) {
  if (message.channel instanceof DMChannel) {
    message.channel.send("You can't play this game alone...");
    return;
  }

  client.nistery = {
      state: State.INTRO,
      players: []
  };

  const welcomeMessage = await message.channel.send("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    "Players: 0/5\n" +
    `Type \`${client.prefix}nistery start\` to start the game`);

  welcomeMessage.react('🔪');
  client.nistery.joiningMessageID = welcomeMessage.id;
}
