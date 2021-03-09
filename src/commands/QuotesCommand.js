const BaseCommand = require('../utils/structures/BaseCommand');

module.exports = class QuotesCommand extends BaseCommand {
    constructor(){
        super('quote', 'textAnswers', []);
    }

    async run(client, message, args){
        let quotes = {
            "rui" : "O Rui foi membro do IEEE",
            "teste" : "Esta quote é só um teste"
        };
        if (args[0]){
            if (quotes[args[0].toLowerCase()])
                message.channel.send(quotes[args[0].toLowerCase()]);
            else
                message.channel.send("Provide an existing quote or just type !quote for a random one");
        }
        else {
            const quoteValues = Object.values(quotes);
            const randomQuote = quoteValues[quoteValues.length * Math.random() << 0];
            message.channel.send(randomQuote);
        }
    }
}
