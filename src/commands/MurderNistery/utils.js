function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const State = {
  INTRO: 1,
  GAME: 2,
  INVALID: 3
}

const playerEmojis = ['😴', '😷', '🤥', '🤓', '🤔', '❌'];

module.exports = {
    sleep,
    State,
    playerEmojis
}
