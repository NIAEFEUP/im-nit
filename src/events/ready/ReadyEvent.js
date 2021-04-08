const BaseEvent = require('../../utils/structures/BaseEvent');
const reminderInit = require("../../utils/listeners/reminders");
const mongoUtil = require('../../utils/mongo');

module.exports = class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client) {
    console.log(client.user.tag + ' has logged in.');
    await mongoUtil();  // start the database connection
    reminderInit(client);   // listener for reminders
  }
}