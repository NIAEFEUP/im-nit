const ANSWER_TIME = 30000;  // milliseconds

module.exports = async function nightInnocent(user) {
  if (!user.alive) return;
  user.send("Please type your new death message. If you don't want to change it, answer with ❌");

  try {
    let userMessage = await user.dmChannel.awaitMessages(m => m.author.id === user.id, {
      max: 1,
      time: ANSWER_TIME,
      errors: ['time']
    });

    // Parse response and update player's will
    userMessage = userMessage.first().content;
    if (userMessage === '❌') return;
    user.will = userMessage;
    
  } catch(e) {
    user.send("The night has ended. Try to type faster next time 😠");
  }
}
