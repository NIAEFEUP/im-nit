module.exports = function endGame(client, channel) {
  const killer = client.nistery.players[client.nistery.killerPos];
  if (killer.alive)
    channel.send(`The murderer won and you all died 🤯. Congratulations, ${killer.username} and good luck on your next killing streak 😉`);
  else
    channel.send(`The murderer was lynched 😬 The innocent people won 🥳 Nice try, ${killer.username}`);
  delete client.nistery;
}
