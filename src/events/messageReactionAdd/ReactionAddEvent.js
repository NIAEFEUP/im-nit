const BaseEvent = require('../../utils/structures/BaseEvent');
const State = require('../../utils/structures/NisteryStates');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionAdd');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;
    const emoji = reaction.emoji.name;

    if (reaction.message.id === client.nistery.joiningMessage && emoji === '🔪')
        this.nisteryPlayerJoined(client, user, reaction.message);
    if (reaction.message.id === client.nistery.voteMessage)
      this.nisteryLynchVoting(client, reaction, user);
  }

  nisteryPlayerJoined(client, user, message) {
    if (client.nistery.state != State.INTRO || client.nistery.players.length >= 5) return;

    for (let player of client.nistery.players)
        if (player.id === user.id) return;

    client.nistery.players.push(user);
    message.edit("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
    "Sounds good? Then hit the emoji below to join in 🤫\n" +
    `Players: ${client.nistery.players.length}/5\n` +
    `Type \`${client.prefix}nistery start\` to start the game`);
  }

  nisteryLynchVoting(client, reaction, user) {
    const player = client.nistery.players.find(p => p.id === user.id);
    if (!player) return;  // user external to the game

    const emojiName = reaction.emoji.name;
    const votedPlayer = client.nistery.players.find(p => p.emoji === emojiName);
    if (!votedPlayer) return;  // useless emoji

    reaction.message.reactions.cache.forEach(r => {
      if (r.emoji.name !== emojiName)
        r.users.remove(user);
    });

    // UPDATE THE MESSAGE
  }
}
