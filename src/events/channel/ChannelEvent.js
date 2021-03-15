const BaseEvent = require("../../utils/structures/BaseEvent");

module.exports = class ChannelEvent extends BaseEvent {
  constructor() {
    super("voiceStateUpdate");
    this.mapVoiceToText = new Map([
      ["818439901098934292", "819264453097947176"],
    ]); //[voice channel, hidden text channel]
    this.channelMembers = []; //save voice channel members (used to check members that left the channel)
  }
  async run(client, oldState, newState) {
    let newUserChannel = newState.channelID;
    let oldUserChannel = oldState.channelID;
    if (
      newUserChannel !== null &&
      this.mapVoiceToText.get(newUserChannel) !== undefined
    ) {
      //give permissions to members in the voice
      client.channels.cache.get(newUserChannel).members.forEach((member) => {
        this.channelMembers.push(member.user.id);
        client.channels.cache
          .get(this.mapVoiceToText.get(newUserChannel))
          .updateOverwrite(member, {
            VIEW_CHANNEL: true,
          })
          .catch(console.error);
      });
    } else if (
      oldUserChannel !== null &&
      this.mapVoiceToText.get(oldUserChannel) !== undefined
    ) {
      let actualMembers = [];
      client.channels.cache.get(oldUserChannel).members.forEach((member) => {
        actualMembers.push(member.user.id);
      });
      //members that left the voice channel
      let difference = this.channelMembers.filter(
        (x) => !actualMembers.includes(x)
      );
      //remove permissions to members that left channel
      difference.forEach((member) => {
        client.channels.cache
          .get(this.mapVoiceToText.get(oldUserChannel))
          .updateOverwrite(member, {
            VIEW_CHANNEL: false,
          })
          .catch(console.error);
      });
    }
  }
};
