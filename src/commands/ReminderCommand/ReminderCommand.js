const BaseCommand = require('../../utils/structures/BaseCommand');
const momentTimezone = require('moment-timezone');
const { MessageCollector } = require('discord.js');

const scheduledSchema = require('../../models/scheduled-schema');
const {argsParser, parsingTypes} = require('./utils/argsParser');
const showInstructions = require('./utils/help');

module.exports = class ReminderCommand extends BaseCommand {
  constructor() {
    super('schedule', 'textAnswers', []);   // 'remindme' is used by other bots
  }

  async run(client, message, args) {    // expectedArgs: '<Channel tag> <YYYY/MM/DD> <HH:MM> <"AM" or "PM"> <Timezone>',
    const { mentions, guild, channel } = message; 
    
    const userID = message.author.id;   // userID will be needed to tag the person on the reminder

    const targetChannel = mentions.channels.first();    // if the targetChannel is not specified, the message is sent to the user

    if(targetChannel){
        // Remove the 1st argument from the args array (mentioned channel)
        args.shift();
    }

    let identifierArg = args[0];

    if(!identifierArg || identifierArg == 'help'){
        showInstructions(message);
        return;
    }

    let parsingType = parsingTypes.HUMAN_LANGUAGE;

    if(isNaN(identifierArg)){   // if not a number
        parsingType = parsingTypes.FORMAL;
    }

    let [date, time, clockType, timeZone] = argsParser(args, parsingType);
    
    if(clockType){
        clockType = clockType.toUpperCase();
    }
    if(clockType !== 'AM' && clockType !== 'PM'){
        showInstructions(message);
        return;
    }

    if(timeZone == null){   // if the timezone is not specified
        timeZone = "Europe/Lisbon";
    } else if (!momentTimezone.tz.names().includes(timeZone)){
        message.reply('Unknown timezone! Please use one of the following: <https://gist.github.com/AlexzanderFlores/d511a7c7e97b4c3ae60cb6e562f78300>');
        return;
    }

    const targetDate = momentTimezone.tz(
        `${date} ${time} ${clockType}`,
        // 'YYYY-MM-DD HH:mm A',     // time format
        'DD-MM-YYYY HH:mm A',     // time format
        timeZone                // timezone
    );

    message.reply('Please send the message you would like to schedule.');

    const filter = (newMessage) => {
        return newMessage.author.id === message.author.id;
    }

    const collector = new MessageCollector(channel, filter, {
        max: 1,
        time: 1000 * 60,  // 60 seconds
    });

    collector.on('end', async (collected) => {     // this will run once the collector has waited 60 seconds or the correct person sent a message
        const collectedMessage = collected.first();     // this will be null if it waited 60 secs and didn't receive msg 

        if(!collectedMessage){
            message.reply('You did not reply in time.');
            return;
        }

        try{
            await new scheduledSchema({
                date: targetDate.valueOf(),
                content: collectedMessage.content,
                guildId: guild.id,
                channelId: targetChannel ? targetChannel.id : null,
                userId: userID,
            }).save();
            message.reply('Your message has been scheduled.');
        } catch(err){
            console.error(err);
            message.reply('There was an error saving your message.');
        }
        
    });
  }
}