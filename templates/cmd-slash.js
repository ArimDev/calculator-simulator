const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("") //Jméno příkazu - MUSÍ SE ZTOTOŽŇOVAT S NÁZVEM SOUBORU
        .setDescription("") //Popisek příkazu pro uživatele
        //https://discordjs.guide/interactions/slash-commands.html#options
};

module.exports.run = async (bot, interaction) => {
    interaction.reply({ content: "Heyo!" })
};