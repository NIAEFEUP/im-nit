const BaseCommand = require('../../utils/structures/BaseCommand');
const State = require('../../utils/structures/NisteryStates');

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
        state: State.INTRO,  // change this so we don't use magic numbers
        players: []
    };

    const newMessage = await message.channel.send("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
      "Sounds good? Then hit the emoji below to join in 🤫\n" +
      "Players: 0/5\n" +
      `Type \`${client.prefix}nistery start\` to start the game`);

    newMessage.react('🔪');
    client.nistery.joiningMessage = newMessage.id;
  }

  async gameStart(client, channel) {
    if (client.nistery.players.length <= 0) {
        channel.send("It's not fun if there is nobody to catch the murderer 😟\n" +
        "You need at least 4 players for this game");
        return;
    }

    client.nistery.state = State.START;
    channel.send("Alright, let's start the game. I sent you a private message with some instructions\n" +
    `If you need more help, type ${client.prefix}nistery help`);

    client.nistery.killerID = client.nistery.players[Math.floor(Math.random() * client.nistery.players.length)].id;

    const messagingPromises = [];
    for (let player of client.nistery.players) {
      player.traits = [];
      messagingPromises.push(this.messagePlayer(client, player));
    }
    await Promise.all(messagingPromises);

    for (let player of client.nistery.players) {
      channel.send(player.username + " " + player.traits.toString());
    }
  }

  async messagePlayer(client, user) {
    if (user.id === client.killerID) {
      user.send("You are an innocent user of this Discord 😖. Your job is to catch the friend of yours who I turned into a murderer 😳\n" +
        "For that, I need you to tell me a characteristic of each one of the players, so they can be used as hints 🕵️\n" +
        "And remember: don't be too **obvious** or too **vague**");
    } else {
      user.send("You were chosen as the bloodthirsty killer 🔪. Your job is to try and kill all your friends without being caught 🤫\n" +
        "But first, I need you to tell me a characteristic of each one of the players, so you can mock them when they're dead 😈\n");
    }

    for (let i = 0; i < client.nistery.players.length; ++i) {
      const player = client.nistery.players[i];
      let message;
      if (player.id === user.id)
        message = "Tell me a trait of yourself";
      else
        message = `Tell me a trait of @${player.username}`;

      await user.send(message);

      let userMessage = await user.dmChannel.awaitMessages(m => m.author.id === user.id, {
        max: 1,
        time: 30000,
        errors: ['time']
      });

      userMessage = userMessage.first();
      client.nistery.players[i].traits.push(userMessage.content);
    }
  }
}
