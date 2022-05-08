module.exports.config = {
    name: "", //Jméno příkazu - MUSÍ SE ZTOTOŽŇOVAT S NÁZVEM SOUBORU
    description: "", //Popisek příkazu pro uživatele
    usage: "", //Jednolinkový návod pro použití příkazu
    perms: [], //Nutné oprávnění pro použití příkazu
    aliases: [] //Aliasy tohoto příkazu
};

module.exports.run = async (bot, message, args) => {
    message.reply("Heyo!")
}