module.exports.config = {
    name: "test",
    description: "Pošle testovací odpověď!",
    usage: "test",
    perms: [],
    aliases: []
};

module.exports.run = async (bot, message, args) => {
    message.reply("Heyo!")
}