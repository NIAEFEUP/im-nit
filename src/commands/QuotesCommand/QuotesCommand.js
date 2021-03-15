const BaseCommand = require('../../utils/structures/BaseCommand');
const fs = require('fs');
const { writeToFile } = require('./utils');

const filePath = 'src/commands/QuotesCommand/quotes.json';

module.exports = class QuotesCommand extends BaseCommand {
    constructor() {
        super('quote', 'textAnswers', []);

        this.quotes = {};
        fs.readFile(filePath, 'utf8', (err, contents) => {
            if (err) {
                console.error(err);
                return;
            }
            this.quotes = JSON.parse(contents);
            console.log(this.quotes);
        });
    }

    async run(client, message, args) {
        if (args[0]) {
            if (this.quotes[args[0].toLowerCase()])
                message.channel.send(this.quotes[args[0].toLowerCase()]);
            else {
                switch (args[0]) {
                    case 'add':
                        if (!args[1] || !args[2]) {
                            message.channel.send("Wrong format. To add a quote, type:\n" +
                            client.prefix + "quote add [NAME] [NEW QUOTE]");
                            return;
                        }

                        if (this.quotes[args[1]]) {
                            message.channel.send("A quote with that name already exists! Choose another name or delete it");
                            return;
                        }

                        if (args[1] === "add") {
                            message.channel.send("How do you call your quote if you name it 'add' ? Choose another name");
                            return;
                        } else if (args[1] === "delete") {
                            message.channel.send("How do you call your quote if you name it 'delete' ? Choose another name");
                            return;
                        }

                        let newQuote = "";
                        for (let i = 2; i < args.length; ++i)
                            newQuote += " " + args[i];

                        this.quotes[args[1]] = newQuote;
                        writeToFile(filePath, this.quotes);
                        message.channel.send("Quote added successfully! :D");
                        break;
                    case 'delete':
                        if (!args[1]) {
                            message.channel.send("Wrong format. To delete a quote, type\n" +
                            client.prefix + "quote delete [NAME]");
                            return;
                        }

                        if (!this.quotes[args[1]]) {
                            message.channel.send("That quote doesn't exist dummy");
                            return;
                        }

                        delete this.quotes[args[1]];
                        writeToFile(filePath, this.quotes);
                        message.channel.send("Quote removed successfully! :D");
                        break;
                    default:
                        message.channel.send("That wasn't very nit of you. Use the command in one of the several ways:\n" +
                            client.prefix + "quote [NAME]\n" +
                            client.prefix + "quote add [NAME] [NEW QUOTE]\n" +
                            client.prefix + "quote delete [NAME]");
                }
            }
        }
        else {
            const quoteValues = Object.values(this.quotes);
            const randomQuote = quoteValues[quoteValues.length * Math.random() << 0];
            message.channel.send(randomQuote);
        }
    }
}
