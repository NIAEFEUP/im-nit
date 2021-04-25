const BaseEvent = require('../../utils/structures/BaseEvent');
const { State } = require('../../commands/MurderNistery/utils');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionRemove');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;

    this.nisteryChecks(client, reaction, user);
  }

  nisteryChecks(client, reaction, user) {
    if (!client.nistery) return;  // game is not active

    const emoji = reaction.emoji.name;
  
    if (reaction.message.id === client.nistery.joiningMessageID && emoji === '🔪')
      this.nisteryPlayerLeft(client, user, reaction.message);
    if (reaction.message.id === client.nistery.voteMessage?.id)
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
    const votedPlayer = client.nistery.players.find(p => p.emoji === emojiName);
    if (!votedPlayer && emojiName !== '❌') return;  // useless emoji

    // Update message
    let message = "Voting results:\n";
    const messageReactions = Array.from(reaction.message.reactions.cache.values());
    client.nistery.players.forEach((p) => {
      if (p.alive) {
        const numVotes = messageReactions.find(r => r.emoji.name === p.emoji).count;
        message += `${p.emoji} ${p.username}: ${numVotes - 1} votes\n`;
      }
    });
    message += `❌ No lynch: ${messageReactions.find(r => r.emoji.name === '❌').count - 1} votes`;
    reaction.message.edit(message);
  }
}
