const { State, playerEmojis } = require('./utils');
const askPlayersTraits = require('./AskPlayersTraits');
const mainGame = require('./MainGame');

module.exports = async function gameStart(client, channel) {
  if (!client.nistery) {
    channel.send("There is not active game!");
    return;
  }

  if (client.nistery.players.length <= 3) {
      channel.send("It's not fun if there is nobody to catch the murderer 😟\n" +
      "You need at least 4 players for this game");
      return;
  }

  delete client.nistery.joiningMessageID;
  client.nistery.state = State.GAME;

  channel.send("Alright, let's start the game. I sent you a private message with some instructions\n" +
  `If you need more help, type ${client.prefix}nistery help`);

  client.nistery.killerPos = Math.floor(Math.random() * client.nistery.players.length);
  client.nistery.killerID = client.nistery.players[client.nistery.killerPos].id;

  const messagingPromises = [];
  for (let i = 0; i < client.nistery.players.length; ++i) {
    const player = client.nistery.players[i];
    player.traits = new Array(client.nistery.players.length).fill("");
    player.emoji = playerEmojis[i];
    player.alive = true;
    messagingPromises.push(askPlayersTraits(client, player, i));
  }
  await Promise.all(messagingPromises);
  mainGame(client, channel);
}
