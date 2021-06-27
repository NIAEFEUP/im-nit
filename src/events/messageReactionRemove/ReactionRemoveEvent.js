const BaseEvent = require('../../utils/structures/BaseEvent');
const nisteryChecks = require('./NisteryChecks');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('messageReactionRemove');
  }
  
  async run(client, reaction, user) {
    if (user.bot) return;

    nisteryChecks(client, reaction, user);
  }
}
