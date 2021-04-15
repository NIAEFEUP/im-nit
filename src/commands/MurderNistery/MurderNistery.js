const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super('nistery', 'game', []);
  }

  async run(client, message, args) {
    if (args[0] && args[0] === "start") {
        this.gameStart(client, message.channel);
        return;
    }

    if (client.nisteryState) {
        message.channel.send("There's already a game in progress. You're really eager to kill your friends, aren't you? 🧐");
        return;
    }

    await this.gameIntro(client, message);
  }

  async gameIntro(client, message) {
    client.nistery = {
        state: 1,  // change this so we don't use magic numbers
        players: []
    };

    await message.channel.send("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    "Players: 0/5\n" +
    `Type \`${client.prefix}nistery start\` to start the game`)
    .then((newMessage) => {
        newMessage.react('🔪');
        client.nistery.joiningMessage = newMessage.id;
    })
    .catch(console.error);
  }

  gameStart(client, channel) {
    if (client.nistery.players.length <= 3) {
        channel.send("It's not fun if there is nobody to catch the murderer 😟\n" +
        "You need at least 4 players for this game");
        return;
    }

    client.nistery.state = 2;
    channel.send("Alright, let's start the game. I sent you a private message with some instructions\n" +
    `If you need more help, type ${client.prefix}nistery help`);

    for (let player of client.nistery.players) {
        this.messagePlayer(client, player);
    }
  }

  messagePlayer(client, user) {
    user.send("Sup bro");
  }
}
