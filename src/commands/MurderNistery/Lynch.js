const { sleep } = require('./utils');
const VOTING_TIME = 60000;  // milliseconds

module.exports = async function lynch(client, channel) {
  await channel.send("The sun has risen 🌄 You have now 1 minute to vote and lynch someone using the emojis below. The person with the majority of votes dies ☠️");

  let message = "Voting results:\n";
  client.nistery.players.forEach((p) => {
    if (p.alive)
      message += `${p.emoji} ${p.username}: 0 votes\n`;
  });
  message += "❌ No lynch: 0 votes";

  const voteMessage = await channel.send(message);
  client.nistery.voteMessage = voteMessage;

  await client.nistery.players.forEach(async (p) => {
    if (p.alive)
      await voteMessage.react(p.emoji);
  });
  await voteMessage.react('❌');

  await sleep(VOTING_TIME);
  delete client.nistery.voteMessage;

  let mostVoted = 0;
  let maxVotes = 0;
  // Get the players' votes from the reactions
  const messageReactions = Array.from(voteMessage.reactions.cache.values());

  client.nistery.players.forEach((p, i) => {
    if (!p.alive) return;
    const numVotes = messageReactions.find(r => r.emoji.name === p.emoji).count;
    if (numVotes > maxVotes) {
      mostVoted = i;
      maxVotes = numVotes;
    }
  });

  // We should only accept a vote if the majority voted for that player
  if (messageReactions.find(r => r.emoji.name === '❌').count > maxVotes
      || maxVotes - 1 <= (client.nistery.players.length - client.nistery.deadCount) / 2) {
    await channel.send("The vote wasn't decisive so nobody is lynched! How lame... 😒");
    return;
  }

  const deadPlayer = client.nistery.players[mostVoted];
  deadPlayer.alive = false;
  client.nistery.deadCount++;

  message = `${deadPlayer.username} was lynched. `;
  if (deadPlayer.id === client.nistery.killerID)
    message += "He was the KILLER 😱";
  else
    message += "He was just an innocent person 😭";
  await channel.send(message);
}