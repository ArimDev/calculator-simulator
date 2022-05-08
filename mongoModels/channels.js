const mongoose = require('mongoose');

const reqString = { type: String, required: true },
    setString = { type: String, required: false, default: undefined },
    setBoolean = { type: Boolean, required: false, default: undefined },
    reqNumber = { type: Number, required: false, default: 0 },
    setNumber = { type: Number, required: false, default: 0 };

const ChannelSchema = new mongoose.Schema({
    GuildID: reqString,
    GuildNAME: reqString,
    Creator: {
        username: setString,
        ID: setString
    },
    ChannelID: reqString
}, {
    timestamps: true
});

module.exports = mongoose.model('channels', ChannelSchema);