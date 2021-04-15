const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super('nistery', 'game', []);
  }

  async run(client, message, args) {
    if (client.nisteryState) {
        message.channel.send("There's already a game in progress. You're really eager to kill your friends, aren't you? 🧐");
        return;
    }
    await this.startGame(client, message);
  }

  async startGame(client, message) {
    client.nistery = {
        state: 1,
        players: []
    };

    await message.channel.send("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    "Players: 0/5")
    .then((newMessage) => {
        newMessage.react('🔪');
        client.nistery.joiningMessage = newMessage.id;
    })
    .catch(console.error);
  }
}
