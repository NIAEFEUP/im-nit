const BaseCommand = require('../../utils/structures/BaseCommand');
const gameSetup = require('./GameSetup');
const gameStart = require('./GameStart');

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super('nistery', 'game', []);
  }

  async run(client, message, args) {
    if (args[0] === "start") {
        gameStart(client, message.channel);
        return;
    }

    if (client.nistery) {
        message.channel.send("There's already a game in progress. You're really eager to kill your friends, aren't you? 🧐");
        return;
    }

    gameSetup(client, message);
  }
}
