const BaseCommand = require('../../utils/structures/BaseCommand');

module.exports = class ListOfCommands extends BaseCommand {
    constructor(){
        super('help', 'help', []);
    }

    async run(client, message, args) {
        message.react("👍")

        message.channel.send("***Nit Commands:***\n" +
            "\n" + 
            "Hi, my name is Nit, and I am a nit bot! :nerd: \n" +
            "\n" + 
            "**Quote** \n" + 
            "`" + client.prefix + "quote` - Save iconic phrases and moments \n" + 
            "`" + client.prefix + "quote [NAME]` - Shows random quote \n"  +
            "`" + client.prefix + "quote add [NAME] [NEW QUOTE]` - Adds quote \n" + 
            "`" + client.prefix + "quote delete [NAME]` - Deletes quote \n" + 
            "\n" + 
            "**Others** \n" + 
            "`" + client.prefix + "help` - I'll send you this message \n" + 
            "\n" + 
            "**Text Channels** \n" +
            "I allow you to have have texts channels that are only available when you are using the voice channel!");
    }

}
