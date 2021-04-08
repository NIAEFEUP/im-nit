const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
}

const scheduledSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    content: reqString,
    guildId: reqString,
    channelId: reqString
});

const name = 'scheduled-posts';

module.exports = mongoose.model[name] || mongoose.model(name, scheduledSchema, name);       // 3rd argument is to force the name to not switch to plural