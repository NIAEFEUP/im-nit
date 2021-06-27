const lynch = require('./Lynch');
const endGame = require('./EndGame');
const nightKiller = require('./NightKiller');
const nightInnocent = require('./NightInnocent');

module.exports = async function gameLoop(client, channel) {
  client.nistery.deadCount = 0;

  channel.send(`${client.nistery.players.length} friends arrive at the voice channel where they always meet each other. ` + 
  "But this isn't a day like the others 🤭\n");

  while (true) {
    channel.send("It's night time 🌑 Murderer, you can choose your victim. Everyone else can write a will");

    const PMs = [];
    for (let player of client.nistery.players) {
      if (player.id === client.nistery.killerID)
        PMs.push(nightKiller(client, player));
      else
        PMs.push(nightInnocent(player));
    }

    await Promise.all(PMs);
    const deadPos = await Promise.resolve(PMs[client.nistery.killerPos]);

    if (deadPos === -1)  // nobody died
      await channel.send("How lame 😒 The murderer didn't kill anybody tonight...");
    else {
      const victim = client.nistery.players[deadPos].username;
      const victimTrait = client.nistery.players[deadPos].traits[client.nistery.killerPos];
      const killerTrait = client.nistery.players[client.nistery.killerPos].traits[deadPos];
      const will = client.nistery.players[deadPos].will;

      let message = `Oh no 😭 **${victim}** died last night\n` +
      `The culprit looked at his victim thought how **${victimTrait}** this person was. But they had to die anyway\n` +
      "\nHowever, just before getting meeting their end, the victim told him:\n" +
      `\`You little prick! And here I was just thinking how ${killerTrait} you were\`\n`;

      if (will)
        message += `\nAlong with their body, the police also found a written will:\n\`${will}\``;
      else
        message += "\nThere was no will found near the body";

      await channel.send(message);
    }

    if (client.nistery.deadCount >= client.nistery.players.length - 2) {
      endGame(client, channel);
      return;
    }

    await lynch(client, channel);
    if (!client.nistery.players[client.nistery.killerPos].alive || client.nistery.deadCount >= client.nistery.players.length - 2) {
      endGame(client, channel);
      return;
    }
  }
}
