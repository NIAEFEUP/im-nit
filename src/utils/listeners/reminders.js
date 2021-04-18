const scheduledSchema = require('../../models/scheduled-schema');

const timeoutDelay = 30;    // time between checkForPosts function calls

/**
 * Recursively check for reminders
 * @param {*} client 
 */
const checkForPosts = async (client) => {
    const query = {
        date: {
            $lte: Date.now()        // Dates less than now
        }
    };

    const results = await scheduledSchema.find(query);

    for (const post of results) {
        const {guildId, channelId, content, userId} = post;

        if (!channelId) {     // reminder is going to be sent directly to the user
            let targetUser = await client.users.fetch(userId).catch(() => null);

            if(!targetUser){    // if user not found
                continue;
            }

            targetUser.send(content);
        } else {
            const guild = await client.guilds.fetch(guildId);
            if(!guild){ // if the bot cant find the guild, for example the bot was kicked out
                continue;
            }

            const channel = await guild.channels.cache.get(channelId);
            if(!channel) {  // if the bot cant find the channel, for example the channel was deleted
                continue;
            }
            
            channel.send(`<@${userId}> ${content}`);  // send the message to the target channel tagging the person
        }
    }   

    await scheduledSchema.deleteMany(query);

    setTimeout(function() {
        checkForPosts(client);
    }, 1000 * timeoutDelay);     // check each <timeoutDelay> seconds
}

module.exports = checkForPosts;