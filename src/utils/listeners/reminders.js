const scheduledSchema = require('../../models/scheduled-schema');

module.exports = (client) => {     // recursive functions each 10 secs
    const checkForPosts = async () => {
        const query = {
            date: {
                $lte: Date.now()
            }
        };

        const results = await scheduledSchema.find(query);

        for (const post of results) {
            const {guildId, channelId, content} = post;

            const guild = await client.guilds.fetch(guildId);
            if(!guild){ // if the bot cant find the guild, for example the bot was kicked out
                continue;
            }

            const channel = await guild.channels.cache.get(channelId);
            if(!channel) {  // if the bot cant find the channel, for example the channel was deleted
                continue;
            }

            channel.send(content);  // send the message to the target channel
        }

        await scheduledSchema.deleteMany(query);

        setTimeout(checkForPosts, 1000*10);     // check each 10 seconds
    }

    checkForPosts();
};