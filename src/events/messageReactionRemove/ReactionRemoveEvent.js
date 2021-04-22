const BaseEvent = require('../../utils/structures/BaseEvent');
const State = require('../../utils/structures/NisteryStates');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionRemove');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;
    const emoji = reaction.emoji.name;

    if (reaction.message.id === client.nistery?.joiningMessage && emoji === '🔪')
        this.nisteryPlayerLeft(client, user, reaction.message);
    if (reaction.message.id === client.nistery?.voteMessage)
      this.nisteryLynchUnvoting(client, reaction, user);
  }

  nisteryPlayerLeft(client, user, message) {
    if (client.nistery.state != State.INTRO) return;

    client.nistery.players = client.nistery.players.filter((player) => player.id !== user.id);
    message.edit("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    `Players: ${client.nistery.players.length}/5\n` +
    `Type \`${client.prefix}nistery start\` to start the game`);
  }

  nisteryLynchUnvoting(client, reaction, user) {
    const player = client.nistery.players.find(p => p.id === user.id);
    if (!player) return;  // user external to the game

    const emojiName = reaction.emoji.name;
    const player = client.nistery.players.find(p => p.emoji === emojiName);
    if (!player && emojiName !== '❌') return;  // useless emoji

    // Update message
    let message = "Voting results:\n";
    client.nistery.players.forEach((p) => {
      const numVotes = client.nistery.voteMessage.reactions.cache.filter(r => r.emoji.name === p.emoji).size;
      message += `${p.username}: ${numVotes - 1} votes\n`;
    });
    message += `No lynch: ${client.nistery.voteMessage.reactions.cache.filter(r => r.emoji.name === '❌').size} votes`;
    reaction.message.edit(message);
  }
}
