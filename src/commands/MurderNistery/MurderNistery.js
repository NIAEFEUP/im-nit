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

    if (client.nistery) {
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

    client.nistery.state = State.GAME;
    channel.send("Alright, let's start the game. I sent you a private message with some instructions\n" +
    `If you need more help, type ${client.prefix}nistery help`);

    client.nistery.killerPos = Math.floor(Math.random() * client.nistery.players.length);
    client.nistery.killerID = client.nistery.players[client.nistery.killerPos].id;

    const messagingPromises = [];
    for (let i = 0; i < client.nistery.players.length; ++i) {
      const player = client.nistery.players[i];
      player.traits = new Array(client.nistery.players.length).fill("");
      player.emoji = playerEmojis[i];
      player.alive = true;
      messagingPromises.push(this.messagePlayer(client, player, i));
    }
    await Promise.all(messagingPromises);
    this.mainGame(client, channel);
  }

  async messagePlayer(client, user, userIndex) {
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
        client.nistery.players[i].traits[userIndex] = userMessage.content;
    } catch(e) {
        console.log(e);
        user.send("You took too long... Please have more attention next time");
        client.nistery.players[i].traits[userIndex] = "normal";
      }
    }
  }

  async mainGame(client, channel) {
    client.nistery.deadCount = 0;

    channel.send(`${client.nistery.players.length} young friends arrive at the voice channel where they always meet each other. ` + 
    "Little do they know that one of them had already been corrupted by a crazy self-aware bot 🤭\n" +
    "Let's start this!");

    while (true) {
      channel.send("Uhuu, it's night time 🤩 Dear murderer, you can choose your victim. Everyone else can also set a death message, if they wish to... 😒");

      const PMs = [];
      for (let player of client.nistery.players) {
        if (player.id === client.nistery.killerID)
          PMs.push(this.nightKiller(client, player));
        else
          PMs.push(this.innoNight(client, player));
      }
      await Promise.all(PMs);
      const deadPos = await Promise.resolve(PMs[client.nistery.killerPos]);
      if (deadPos === -1)  // nobody died
        await channel.send("How lame 😒 The murderer didn't kill anybody tonight... But you can still lynch someone 😈");
      else {
        const victim = client.nistery.players[deadPos].tag;
        const victimTrait = client.nistery.players[deadPos].traits[client.nistery.killerPos];
        const killerTrait = client.nistery.players[client.nistery.killerPos].traits[deadPos];
        const will = client.nistery.players[deadPos].will;

        let message = `Oh no 😭 @${victim} was murdered last night 😱 I was totally not exepecting that 🤭\n` +
        `The culprit looked at his victim through the window and thought to himself how ${victimTrait} this person was. But they had to die anyway\n` +
        "\nHowever, just before getting their throat sliced, the prey caught a glance of their predator and told him:\n" +
        `\`You little prick! And here I was just thinking how ${killerTrait} you were\`\n`;

        if (will)
          message += `\nAlong with their body, the police also found a written will:\n\`${will}\``;
        else
          message += "\nThere was no will found near the body";

        await channel.send(message);
      }

      if (client.nistery.deadCount >= client.nistery.players.length - 2) {
        this.endGame(client, channel);
        return;
      }

      await this.lynch(client, channel);
      if (!client.nistery.players[client.nistery.killerPos].alive || client.nistery.deadCount >= client.nistery.players.length - 2) {
        this.endGame(client, channel);
        return;
      }
    }
  }

  async nightKiller(client, user) {
    let messageString = "Use the emojis below to choose your victim. Also, it's pretty lame but you can press the ❌ if you don't want to kill anybody...\n";
    const reactions = [];

    client.nistery.players.forEach((player, i) => {
      if (player.id === user.id) return;
      messageString += player.username + ": " + player.emoji;
      reactions.push(player.emoji);
    });
    reactions.push('❌');

    const message = await user.send(messageString);
    reactions.forEach((react) => {
      if (react != client.nistery.players[client.nistery.killerPos].emoji)
        message.react(react);
    });

    try {
      const reaction = await message.awaitReactions((r, u) => true, {
        max: 1,
        time: 30000,
        errors: ['time']
      });

      const emoji = reaction.first().emoji.name;
      if (emoji === '❌') return -1;

      for (let i = 0; i < client.nistery.players.length; ++i)
        if (emoji === client.nistery.players[i].emoji) {
          client.nistery.players[i].alive = false;
          client.deadCount++;
          return i;
        }
    } catch(e) {
      console.log(e);
      user.send("You took too long to choose your victim. Now you can't kill anybody 😤");
      return -1;
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

  async lynch(client, channel) {
    channel.send("Lynching....");
  }

  endGame(client, channel) {
    const killer = client.nistery.players[client.nistery.killerPos];
    if (killer.alive)
      channel.send(`The murderer won and you all died 🤯. Congratulations, @${killer.tag} and good luck for your next killing streak 😉`);
    else
      channel.send(`The murderer was lynched 😱 The innocent people won 🥳 Nice try, @${killer.tag}`);
    delete client.nistery;
  }
}
