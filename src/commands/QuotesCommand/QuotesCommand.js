const BaseCommand = require('../../utils/structures/BaseCommand');
var fs = require('fs');
var fileUtils = require('./utils');

module.exports = class QuotesCommand extends BaseCommand {
    constructor() {
        super('quote', 'textAnswers', []);

        this.quotes = {};
        fs.readFile('src/commands/QuotesCommand/quotes.txt', 'utf8', (err, contents) => {
            if (err) {
                console.error(err);
                return;
            }

            let res = contents.split('\r\n');

            res.map(quote => {
                let parsing = quote.split(':');     // contains an array with 2 elements (quoteKey, quoteText)
                this.quotes[parsing[0].trim()] = parsing[1].trim();
            })
            console.log(this.quotes);
        });
    }

    async run(client, message, args) {
        if (args[0]) {
            if (this.quotes[args[0].toLowerCase()])
                message.channel.send(this.quotes[args[0].toLowerCase()]);
            else
                message.channel.send("Provide an existing quote or just type !quote for a random one");
        }
        else {
            const quoteValues = Object.values(this.quotes);
            const randomQuote = quoteValues[this.quoteValues.length * Math.random() << 0];
            message.channel.send(randomQuote);
        }
    }
}
