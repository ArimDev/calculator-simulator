const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageButton, MessageEmbed } = Discord;
const channelModel = require('../../mongoModels/channels');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Slouží k nastavení či vytvoření nového kanálu pro herní příkazy!')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kanál k použivání herních příkazů')
                .setRequired(false))
};

module.exports.run = async (bot, interaction) => {
    const channel = interaction.options.getChannel('channel');

    //https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) || !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        const errorEmbed = new MessageEmbed()
            .setTitle(`Chyba!`)
            .setDescription(`**Nemáš právo na změnu kanálu pro calculator simulator!**\nPermise: \`Správa Kanálu\``)
            .setColor(`#ed1b0c`);
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const data = await channelModel.findOne({
        GuildID: interaction.guild.id
    });

    if (data) {
        const warnRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('deleteDataChannel')
                    .setLabel('Ano')
                    .setStyle('PRIMARY'),
            ).addComponents(
                new MessageButton()
                    .setCustomId('cancelDataDeletionChannel')
                    .setLabel('Zrušit akci')
                    .setStyle('DANGER'),
            );

        const warnEmbed = new MessageEmbed()
            .setTitle(`Chyba!`)
            .setDescription(`**Kanál pro calculator simulator byl již vytvořen!**\n__Přeješ si smazat záznam k vytvoření/nastavení nového?__`)
            .setColor(`#fcba03`);
        interaction.reply({ embeds: [warnEmbed], components: [warnRow], ephemeral: true });

        const filter = i => i.customId === 'deleteDataChannel' && i.user.id === interaction.member.id || i.customId === 'cancelDataDeletionChannel' && i.user.id === interaction.member.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter, max: 1, time: ms('30s')
        });

        collector.on('collect', async i => {
            if (i.customId === 'deleteDataChannel') {
                await i.deferUpdate();
                const disabledRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('deleteDataChannel')
                            .setLabel('Ano')
                            .setStyle('PRIMARY')
                            .setDisabled(true),
                    ).addComponents(
                        new MessageButton()
                            .setCustomId('cancelDataDeletionChannel')
                            .setLabel('Zrušit akci')
                            .setStyle('DANGER')
                            .setDisabled(true),
                    );

                const successEmbed = new MessageEmbed()
                    .setTitle(`Úspěch!`)
                    .setDescription(`**Data o vytvořeném kanálu pro calculator simulator byla smazána!**`)
                    .setColor(`#03fc13`);
                await interaction.editReply({ embeds: [successEmbed], components: [disabledRow], ephemeral: true });
                data.remove();
            }

            if (i.customId === 'cancelDataDeletionChannel') {
                await i.deferUpdate();
                const disabledRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('deleteDataChannel')
                            .setLabel('Ano')
                            .setStyle('PRIMARY')
                            .setDisabled(true),
                    ).addComponents(
                        new MessageButton()
                            .setCustomId('cancelDataDeletionChannel')
                            .setLabel('Zrušit akci')
                            .setStyle('DANGER')
                            .setDisabled(true),
                    );

                const successEmbed = new MessageEmbed()
                    .setTitle(`Úspěch!`)
                    .setDescription(`**Akce byla zrušena.**`)
                    .setColor(`#03fc13`);
                await interaction.editReply({ embeds: [successEmbed], components: [disabledRow], ephemeral: true });
            }
        });
        return;
    }

    if (!channel) {
        //Když nezadá kanál
        const newChannel = await interaction.guild.channels.create("simulator", {
            type: 'text', topic: 'Kanál pro Discord hru calculator-simulator', reason: `Vytvoření si vyžádal ${message.author.tag}`
        });

        let newData = new channelModel({
            GuildID: interaction.guild.id,
            GuildNAME: interaction.guild.name,
            Creator: {
                username: interaction.member.tag,
                ID: interaction.member.id
            },
            ChannelID: newChannel.id
        });

        newData.save();
        const successEmbed = new MessageEmbed()
            .setTitle(`Úspěch!`)
            .setDescription(`**Byl vytvořen kanál ${newChannel.name} pro calculator simulator hru.**\nHerní příkazy najdeš pod \`${bot.prefix}help\`.`)
            .setColor(`#03fc13`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        return;
    } else {
        //Když označí kanál
        let newData = new channelModel({
            GuildID: interaction.guild.id,
            GuildNAME: interaction.guild.name,
            Creator: {
                username: interaction.member.tag,
                ID: interaction.member.id
            },
            ChannelID: channel.id
        });

        newData.save();
        const successEmbed = new MessageEmbed()
            .setTitle(`Úspěch!`)
            .setDescription(`**Byl vytvořen kanál ${channel.name} pro calculator simulator hru.**\nHerní příkazy najdeš pod \`${bot.prefix}help\`.`)
            .setColor(`#03fc13`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        return;
    }
};