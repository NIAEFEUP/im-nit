const BaseEvent = require('../../utils/structures/BaseEvent');
const { State } = require('../../commands/MurderNistery/utils');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionAdd');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;

    await this.nisteryChecks(client, reaction, user);
  }

  async nisteryChecks(client, reaction, user) {
    if (!client.nistery) return;  // game is not active

    const emoji = reaction.emoji.name;

    if (reaction.message.id === client.nistery.joiningMessageID && emoji === '🔪')
      await this.nisteryPlayerJoined(client, user, reaction.message);
    if (reaction.message.id === client.nistery.voteMessage?.id)
      await this.nisteryLynchVoting(client, reaction, user);
  }

  async nisteryPlayerJoined(client, user, message) {
    if (client.nistery.state != State.INTRO) return;
    if (client.nistery.players.length >= 5) {
      await reaction.users.remove(user);
      return;
    }

    for (let player of client.nistery.players)
        if (player.id === user.id) return;

    client.nistery.players.push(user);
    message.edit("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    `Players: ${client.nistery.players.length}/5\n` +
    `Type \`${client.prefix}nistery start\` to start the game`);
  }

  async nisteryLynchVoting(client, reaction, user) {
    const player = client.nistery.players.find(p => p.id === user.id);
    if (!player || !player.alive) { // user external to the game
      await reaction.users.remove(user);
      return;
    }

    const emojiName = reaction.emoji.name;
    const votedPlayer = client.nistery.players.find(p => p.emoji === emojiName);
    if ((!votedPlayer || !votedPlayer.alive) && emojiName !== '❌') return;  // useless emoji

    await reaction.message.reactions.cache.forEach(async r => {
      if (r.emoji.name !== emojiName)
        await r.users.remove(user);
    });

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
    await reaction.message.edit(message);
  }
}
