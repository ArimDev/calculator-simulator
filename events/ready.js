module.exports = async (bot) => {
    //PŘIDÁNÍ BOTA NA SERVER - ODKAZ
    console.log(`| Invite URL for adding ${bot.user.username} Discord server:\n` + `| https://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=8&scope=applications.commands%20bot\n`)
};