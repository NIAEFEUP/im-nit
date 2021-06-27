module.exports = async function nightKiller(client, user) {
  let messageString = "Use the emojis below to choose your victim. Also, it's pretty lame but you can press the ❌ if you don't want to kill anybody...\n";
  const reactions = [];

  client.nistery.players.forEach((player) => {
    if (player.id === user.id || !player.alive) return;
    messageString += player.username + ": " + player.emoji + "\n";
    reactions.push(player.emoji);
  });
  reactions.push('❌');

  const message = await user.send(messageString);
  reactions.forEach(react => message.react(react));

  try {
    const reaction = await message.awaitReactions((r, u) =>
      u.id === user.id
      && reactions.includes(r.emoji.name)
    , {
      max: 1,
      time: 30000,
      errors: ['time']
    });

    const emoji = reaction.first().emoji.name;
    if (emoji === '❌') return -1;

    for (let i = 0; i < client.nistery.players.length; ++i)
      if (emoji === client.nistery.players[i].emoji) {
        client.nistery.players[i].alive = false;
        client.nistery.deadCount++;
        return i;
      }
  } catch(e) {
    user.send("You took too long to choose your victim. Now you can't kill anybody 😤");
    return -1;
  }
}
