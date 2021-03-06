const BaseCommand = require('../../utils/structures/BaseCommand');
const { writeToFile, readQuotesFromFile } = require('./utils');

const filePath = 'src/commands/QuotesCommand/quotes.json';

module.exports = class QuotesCommand extends BaseCommand {
    constructor() {
        super('quote', 'textAnswers', []);
        this.quotes = readQuotesFromFile(filePath);
    }

    async run(client, message, args) {
        if (!args[0]) {
            this.randomQuote(client, message);
            return;
          }

        const firstArg = args[0].toLowerCase();
        if (this.quotes[firstArg]) {
            message.channel.send(this.quotes[firstArg]);
            return;
        }
        // It's either an operation or a mistake
        switch (firstArg) {
            case 'add':
                this.addQuote(client, message, args);
                break;
            case 'delete':
                this.deleteQuote(client, message, args[1]);
                break;
            default:
                message.channel.send("That wasn't very nit of you. Use the command in one of the several ways:\n" +
                    client.prefix + "quote [NAME]\n" +
                    client.prefix + "quote add [NAME] [NEW QUOTE]\n" +
                    client.prefix + "quote delete [NAME]");
        }
    }

    randomQuote(client, message) {
        const quoteValues = Object.values(this.quotes);
        if (quoteValues.length === 0) {
            message.channel.send("There are no quotes available. To add one, type:\n"
                + client.prefix + "quote add [NAME] [NEW QUOTE]");
            return;
        }
        const randomQuote = quoteValues[quoteValues.length * Math.random() << 0];
        message.channel.send(randomQuote);
    }

    addQuote(client, message, args) {
        if (!args[1] || !args[2]) {
            message.channel.send("Wrong format. To add a quote, type:\n" +
                client.prefix + "quote add [NAME] [NEW QUOTE]");
            return;
        }
        const quoteName = args[1].toLowerCase();
        if (this.quotes[quoteName]) {
            message.channel.send("A quote with that name already exists! Choose another name or delete it");
            return;
        }
        if (quoteName === "add") {
            message.channel.send("How do you call your quote if you name it 'add' ? Choose another name");
            return;
        }
        if (quoteName === "delete") {
            message.channel.send("How do you call your quote if you name it 'delete' ? Choose another name");
            return;
        }

        let newQuote = "";
        for (let i = 2; i < args.length; ++i)
            newQuote += " " + args[i];

        this.quotes[quoteName] = newQuote;
        writeToFile(filePath, this.quotes);
        message.channel.send("Quote added successfully! :D");
    }

    deleteQuote(client, message, quoteName) {
        if (!quoteName) {
            message.channel.send("Wrong format. To delete a quote, type\n" +
                client.prefix + "quote delete [NAME]");
            return;
        }
        // we can't lower case it before because it may be undefined
        quoteName = quoteName.toLowerCase();
        if (!this.quotes[quoteName]) {
            message.channel.send("That quote doesn't exist, dummy");
            return;
        }

        delete this.quotes[quoteName];
        writeToFile(filePath, this.quotes);
        message.channel.send("Quote removed successfully! :D");
    }
}
