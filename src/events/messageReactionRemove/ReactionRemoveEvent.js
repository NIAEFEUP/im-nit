const BaseEvent = require('../../utils/structures/BaseEvent');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionRemove');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;
    const emoji = reaction.emoji.name;

    if (reaction.message.id === client.nistery.joiningMessage && emoji === '🔪')
        this.nisteryPlayerLeft(client, user, reaction.message);
  }

  nisteryPlayerLeft(client, user, message) {
    if (client.nistery.state != 1) return;

    client.nistery.players = client.nistery.players.filter((player) => player.id !== user.id);
    message.edit("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    `Players: ${client.nistery.players.length}/5`);
  }
}
