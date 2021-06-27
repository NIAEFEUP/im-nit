const { DMChannel } = require('discord.js');
const BaseCommand = require('../../utils/structures/BaseCommand');
const { sleep, State } = require('./utils');
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
    if (message.channel instanceof DMChannel) {
      message.channel.send("You can't play this game alone...");
      return;
    }

    client.nistery = {
        state: State.INTRO,
        players: []
    };

    const newMessage = await message.channel.send("Welcome to Murder NIstery! The game where you can kill your friends for fun 😈\n" +
      "Sounds good? Then hit the emoji below to join in 🤫\n" +
      "Players: 0/5\n" +
      `Type \`${client.prefix}nistery start\` to start the game`);

    newMessage.react('🔪');
    client.nistery.joiningMessageID = newMessage.id;
  }

  async gameStart(client, channel) {
    if (!client.nistery) {
      channel.send("There is not active game!");
      return;
    }

    if (client.nistery.players.length <= 3) {
        channel.send("It's not fun if there is nobody to catch the murderer 😟\n" +
        "You need at least 4 players for this game");
        return;
    }

    delete client.nistery.joiningMessageID;
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
        user.send("You took too long... Please be more focused next time");
        client.nistery.players[i].traits[userIndex] = "normal";
      }
    }
  }

  async mainGame(client, channel) {
    client.nistery.deadCount = 0;

    channel.send(`${client.nistery.players.length} friends arrive at the voice channel where they always meet each other. ` + 
    "But this isn't a day like the others 🤭\n");

    while (true) {
      channel.send("It's night time 🌑 Murderer, you can choose your victim. Everyone else can write a will");

      const PMs = [];
      for (let player of client.nistery.players) {
        if (player.id === client.nistery.killerID)
          PMs.push(this.nightKiller(client, player));
        else
          PMs.push(this.innoNight(player));
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

  async innoNight(user) {
    if (!user.alive) return;
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
      user.send("The night has ended. Try to type faster next time 😠");
    }
  }

  async lynch(client, channel) {
    // we should only accept a vote if the majority voted for that player
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

    await sleep(60000);
    delete client.nistery.voteMessage;

    let mostVoted = 0;
    let maxVotes = 0;
    const messageReactions = Array.from(voteMessage.reactions.cache.values());

    client.nistery.players.forEach((p, i) => {
      if (!p.alive) return;
      const numVotes = messageReactions.find(r => r.emoji.name === p.emoji).count;
      if (numVotes > maxVotes) {
        mostVoted = i;
        maxVotes = numVotes;
      }
    });

    if (messageReactions.find(r => r.emoji.name === '❌').count > maxVotes
        || maxVotes - 1 <= (client.nistery.players.length - client.nistery.deadCount) / 2) {
      await channel.send("The majority didn't vote on any player so nobody is lynched! How lame... 😒");
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

  endGame(client, channel) {
    const killer = client.nistery.players[client.nistery.killerPos];
    if (killer.alive)
      channel.send(`The murderer won and you all died 🤯. Congratulations, ${killer.username} and good luck on your next killing streak 😉`);
    else
      channel.send(`The murderer was lynched 😬 The innocent people won 🥳 Nice try, ${killer.username}`);
    delete client.nistery;
  }
}
