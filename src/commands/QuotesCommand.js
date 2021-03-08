const BaseCommand = require('../utils/structures/BaseCommand');

module.exports = class QuotesCommand extends BaseCommand {
    constructor(){
        super('quote', 'textAnswers', []);
    }

    async run(client, message, args){
        let quotes = [
            {"id": "message"}, 
            {"id2": "message2"}
        ];
        //message.channel.send("sent");
        switch(args[0]){
            case '1':
                message.channel.send('Random quote 1');
                break;
            default:
                break;
        }
    }
}