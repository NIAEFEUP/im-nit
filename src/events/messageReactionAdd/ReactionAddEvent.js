const BaseEvent = require('../../utils/structures/BaseEvent');
const nisteryChecks = require('./NisteryChecks');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionAdd');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;

    await nisteryChecks(client, reaction, user);
  }
}
