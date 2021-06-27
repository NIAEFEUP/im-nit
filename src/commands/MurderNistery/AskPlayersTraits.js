const DEFAULT_TRAIT = "normal";
const ANSWER_TIME = 30000;  // milliseconds

module.exports = async function askPlayersTraits(client, user, userIndex) {
  if (user.id !== client.nistery.killerID) {
    await user.send("You are an innocent user of this Discord 😖. Your job is to catch the friend of yours whom I turned into a murderer 😳\n" +
      "For that, I need you to tell me a characteristic of each one of the players, so they can be used as hints 🕵️\n" +
      "And remember: don't be too **obvious** or too **vague**");
  } else {
    await user.send("You were chosen as the bloodthirsty killer 🔪. Your job is to try and kill all your friends without being caught 🤫\n" +
      "But first, I need you to tell me a characteristic of each one of the players, so you can mock them when they're dead 😈\n");
  }

  for (let i = 0; i < client.nistery.players.length; ++i) {
    const player = client.nistery.players[i];
    let message;
    if (player.id === user.id)
      message = "Tell me a trait of yourself";
    else
      message = `Tell me a trait of @${player.username}`;

    await user.send(message);

    try {
      let userMessage = await user.dmChannel.awaitMessages(m => m.author.id === user.id, {
        max: 1,
        time: ANSWER_TIME,
        errors: ['time']
      });
      // Parse the response and save it
      userMessage = userMessage.first();
      client.nistery.players[i].traits[userIndex] = userMessage.content;
  } catch(e) {
      user.send("You took too long... Please be more focused next time");
      client.nistery.players[i].traits[userIndex] = DEFAULT_TRAIT;
    }
  }
}
