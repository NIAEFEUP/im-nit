const BaseEvent = require('../../utils/structures/BaseEvent');
const mongoose = require('mongoose');

module.exports = class DisconnectEvents extends BaseEvent {
  constructor() {
    super('disconnect');
  }
  async run (client) {
    console.log(client.user.tag + ' has disconnected.');
    await mongoose.disconnect();
  }
}