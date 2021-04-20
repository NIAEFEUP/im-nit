const showInstructions = (message) => {
    let helpString =  "The reminder command has the following structure: !schedule (#channelname) <date> <time> <AM / PM> (Timezone)\n" +
                      "Arguments surrounded by '()' are optional, while the ones surrounded by '<>' are required\n" +
                      "Example: !schedule #test 17/04/2021 3:43 PM Europe/Lisbon.\n" +
                      "You can also set a reminder in a more human friendly way such as: !schedule (#channelname) <number> <units>\n" + 
                      "Example: !schedule #test 3 hours and 5 minutes\n" +
                      "If you do not specify the channel you want to send the message to, it will send you a private message\n"
    message.reply(helpString);
}

module.exports = showInstructions;