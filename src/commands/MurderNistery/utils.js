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

module.exports = {
    sleep,
    State
}
