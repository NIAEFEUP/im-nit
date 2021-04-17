const BaseCommand = require('../../utils/structures/BaseCommand');
const momentTimezone = require('moment-timezone');
const { MessageCollector } = require('discord.js');

const scheduledSchema = require('../../models/scheduled-schema');

module.exports = class ReminderCommand extends BaseCommand {
  constructor() {
    super('schedule', 'textAnswers', []);   // change the name to remind later
  }

  async run(client, message, args) {    // expectedArgs: '<Channel tag> <YYYY/MM/DD> <HH:MM> <"AM" or "PM"> <Timezone>',
    const { mentions, guild, channel } = message; 
    
    const targetChannel = mentions.channels.first();
    if(!targetChannel){
        message.reply('Please tag a channel to send your message in');
        return;
    }

    // Remove the 1st argument from the args array
    args.shift();

    let [date, time, clockType, timeZone] = args;
    
    if(clockType !== 'AM' && clockType !== 'PM'){
        message.reply(`You must provide either "AM" or "PM", you provided "${clockType}"`);
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
                channelId: targetChannel.id
            }).save();
            message.reply('Your message has been scheduled.');
        } catch(err){
            console.error(err);
            message.reply('There was an error saving your message.');
        }
        
    });
  }
}