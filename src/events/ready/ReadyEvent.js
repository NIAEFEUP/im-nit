const BaseEvent = require('../../utils/structures/BaseEvent');
const startMongoConnection = require('../../utils/mongo');
const checkForReminders = require("../../utils/listeners/reminders");

module.exports = class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client) {
    console.log(client.user.tag + ' has logged in.');
    await startMongoConnection();  // start the database connection
    checkForReminders(client);
  }
}