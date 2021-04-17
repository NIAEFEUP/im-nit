const BaseCommand = require('../../utils/structures/BaseCommand');
const State = require('../../utils/structures/NisteryStates');
const playerEmojis = ['😴', '😷', '🤥', '🤓', '🤔', '❌'];

module.exports = class TestCommand extends BaseCommand {
  constructor() {
    super('nistery', 'game', []);
  }

  async run(client, message, args) {
    if (args[0] && args[0] === "start") {
        this.gameStart(client, message.channel);
        return;
    }

    if (client.nisteryState) {
        message.channel.send("There's already a game in progress. You're really eager to kill your friends, aren't you? 🧐");
        return;
    }

    this.gameIntro(client, message);
  }

  async gameIntro(client, message) {
    client.nistery = {
        state: State.INTRO,  // change this so we don't use magic numbers
        players: []
    };

    const newMessage = await message.channel.send("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
      "Sounds good? Then hit the emoji below to join in 🤫\n" +
      "Players: 0/5\n" +
      `Type \`${client.prefix}nistery start\` to start the game`);

    newMessage.react('🔪');
    client.nistery.joiningMessage = newMessage.id;
  }

  async gameStart(client, channel) {
    if (client.nistery.players.length <= 0) {
        channel.send("It's not fun if there is nobody to catch the murderer 😟\n" +
        "You need at least 4 players for this game");
        return;
    }

    client.nistery.state = State.START;
    channel.send("Alright, let's start the game. I sent you a private message with some instructions\n" +
    `If you need more help, type ${client.prefix}nistery help`);

    client.nistery.killerID = client.nistery.players[Math.floor(Math.random() * client.nistery.players.length)].id;

    const messagingPromises = [];
    for (let i = 0; i < client.nistery.players.length; ++i) {
      const player = client.nistery.players[i];
      player.traits = [];
      player.emoji = playerEmojis[i];
      player.alive = true;
      messagingPromises.push(this.messagePlayer(client, player));
    }
    await Promise.all(messagingPromises);
    this.mainGame(client, channel);
  }

  async messagePlayer(client, user) {
    if (user.id !== client.nistery.killerID) {
      await user.send("You are an innocent user of this Discord 😖. Your job is to catch the friend of yours who I turned into a murderer 😳\n" +
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
          time: 30000,
          errors: ['time']
        });

        userMessage = userMessage.first();
        client.nistery.players[i].traits.push(userMessage.content);
    } catch(e) {
        console.log(e);
        user.send("You took too long... Please have more attention next time");
        client.nistery.players[i].traits.push("normal");
      }
    }
  }

  async mainGame(client, channel) {
    client.deadCount = 0;
    client.nistery.state = State.GAME;

    channel.send(`${client.nistery.players.length} young friends arrive at the voice channel where they always meet each other. ` + 
    "Little do they know that one of them had already been corrupted by a crazy self-aware bot 🤭\n" +
    "Let's start this!");

    while (true) {
      channel.send("Uhuu, it's night time 🤩 Dear murderer, you can choose your victim. Everyone else can also set a death message, if they wish to... 😒");

      const PMs = [];
      let deadPos;
      for (let player of client.nistery.players) {
        if (player.id === client.nistery.killerID)
          PMs.push(deadPos = this.nightKiller(client, player));
        else
          PMs.push(this.innoNight(client, player));
      }
      await Promise.all(PMs);

      if (!deadPos) {  // nobody died

      }


    }
  }

  async nightKiller(client, user) {
    let messageString = "Use the emojis below to choose your victim. Also, it's pretty lame but you can press the ❌ if you don't want to kill anybody...\n";
    let killerPos;
    const reactions = [];

    for (let i = 0; i < client.nistery.players.length; ++i) {
      if (client.nistery.players[i].id === user.id) {
        killerPos = i;
        continue;
      }
      message += client.nistery.players[i].username + ": " + playerEmojis[i];
      reactions.push(playerEmojis[i]);
    }

    const message = await user.send(messageString);
    reactions.push('❌');
    for (let react of reactions)
      if (react != client.nistery.players[killerPos].emoji)
        message.react(react);

    try {
      const reaction = await message.awaitReactions((r, u) => r.emoji.name in reactions
                                          && r.emoji.name != client.nistery.players[killerPos].emoji
                                          && u.id === user.id, {
        max: 1,
        time: 30000,
        errors: ['time']
      });

      const emoji = reaction.first().emoji.name;
      if (emoji === '❌') return;

      for (let i = 0; i < client.nistery.players.length; ++i)
        if (emoji === client.nistery.players[i].emoji) {
          client.nistery.players[i].alive = false;
          client.deadCount++;
          return i;
        }
    } catch(e) {
      console.log(e);
      user.send("You took too long to choose your victim. Now you can't kill anybody 😤");
    }
  }

  async innoNight(client, user) {
    user.send("Please type your new death message. If you don't want to change it, answer with ❌");

    try {
      let userMessage = await user.dmChannel.awaitMessages(m => m.author.id === user.id, {
        max: 1,
        time: 30000,
        errors: ['time']
      });

      userMessage = userMessage.first().content;
      if (userMessage === '❌') return;
      user.will = userMessage;
    } catch(e) {
      console.log(e);
      user.send("The night has ended. Try to type faster next time 😠");
    }
  }
}
