const BaseEvent = require("../../utils/structures/BaseEvent");
const channels = require("./channels.json");

const lookForChannel = (mapVoiceToText, user) => {
  let pair = mapVoiceToText.filter((element) => element.voice == user);
  if (pair.length > 0) return pair[0].text;
  else return null;
};

module.exports = class ChannelEvent extends BaseEvent {
  constructor() {
    super("voiceStateUpdate");
    this.mapVoiceToText = channels;
    this.channelMembers = []; //save voice channel members (used to check members that left the channel)
  }

  async run(client, oldState, newState) {
    let newUserChannel = newState.channelID;
    let oldUserChannel = oldState.channelID;
    if (
      newUserChannel !== null &&
      lookForChannel(this.mapVoiceToText, newUserChannel) !== null
    ) {
      //give permissions to members in the voice
      client.channels.cache.get(newUserChannel).members.forEach((member) => {
        this.channelMembers.push(member.user.id);
        client.channels.cache
          .get(lookForChannel(this.mapVoiceToText, newUserChannel))
          .updateOverwrite(member, {
            VIEW_CHANNEL: true,
          })
          .catch(console.error);
      });
    } else if (
      oldUserChannel !== null &&
      lookForChannel(this.mapVoiceToText, oldUserChannel) !== null
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
          .get(lookForChannel(this.mapVoiceToText, oldUserChannel))
          .updateOverwrite(member, {
            VIEW_CHANNEL: false,
          })
          .catch(console.error);
      });
    }
  }
};
