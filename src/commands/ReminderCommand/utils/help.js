const Discord = require('discord.js');

const showInstructions = (message) => {
    let descriptionString = "This command can be sent in different ways:\n" +
                            "    1. Detailed Schedule\n" +
                            "    2. Human-Friendly Schedule\n" +
                            "After this step, you will be asked to write the reminder message and you're done\n";

    let detailedScheduleString = `${process.env.PREFIX}schedule (#channelname) <date> <time> <AM / PM> (Timezone)\n` + 
                                    "    Example: !schedule #test 17/04/2021 3:43 PM Europe/Lisbon.\n";

    let humanFriendlyString = "!schedule (#channelname) <number> <units> ...\n" + 
                              "    Example: !schedule #test 3 hours and 5 minutes\n";

    let importantNotesString = "'()' -> optional and '<>' -> required\n" + 
                                "If you do not specify the channel you want to send the message to, it will send you a private message\n" +
                                "Default timezone is Europe/Lisbon\n";

    const helpEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Schedule Command Help")
        .setAuthor("im-nit", "https://i.imgur.com/wSTFkRM.png", "https://discord.js.org")
        .setDescription(descriptionString)
        .addFields(
            { name: "1. Detailed Schedule", value: detailedScheduleString },
            { name: "2. Human-Friendly Schedule", value: humanFriendlyString},
            { name: "Important notes", value: importantNotesString}
        )
        .setTimestamp()
        .setFooter("im-nit")

    message.reply(helpEmbed);
}

module.exports = showInstructions;