const Discord = require('discord.js');
const { Permissions, MessageActionRow, MessageButton, MessageEmbed } = Discord;
const channelModel = require('../../mongoModels/channels');
const ms = require('ms');

module.exports.config = {
    name: "channel",
    description: "Slouží k nastavení či vytvoření nového kanálu pro herní příkazy!",
    usage: "channel [#kanál]",
    perms: [
        "Správa Kanálů"
    ],
    aliases: []
};

module.exports.run = async (bot, message, args) => {
    //https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) || !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        const errorEmbed = new MessageEmbed()
            .setTitle(`Chyba!`)
            .setDescription(`**Nemáš právo na změnu kanálu pro calculator simulator!**\nPermise: \`Správa Kanálu\``)
            .setColor(`#ed1b0c`);
        return message.reply({ embeds: [errorEmbed] });
    }

    const data = await channelModel.findOne({
        GuildID: message.guild.id
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
            .setDescription(`**Kanál pro calculator simulator byl již vytvořen!** (<#${data.ChannelID}>)\n__Přeješ si smazat záznam k vytvoření/nastavení nového?__`)
            .setColor(`#fcba03`);
        response = await message.reply({ embeds: [warnEmbed], components: [warnRow] });

        const filter = i => i.customId === 'deleteDataChannel' && i.user.id === message.author.id || i.customId === 'cancelDataDeletionChannel' && i.user.id === message.author.id
        const collector = message.channel.createMessageComponentCollector({
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
                await response.edit({ embeds: [successEmbed], components: [disabledRow] });
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
                await response.edit({ embeds: [successEmbed], components: [disabledRow] });
            }
        });
        return;
    }

    if (!args[0]) {
        //Když nezadá kanál
        const newChannel = await message.guild.channels.create("simulator", {
            type: 'text', topic: 'Kanál pro Discord hru calculator-simulator', reason: `Vytvoření si vyžádal ${message.author.tag}`
        })

        let newData = new channelModel({
            GuildID: message.guild.id,
            GuildNAME: message.guild.name,
            Creator: {
                username: message.author.tag,
                ID: message.author.id
            },
            ChannelID: newChannel.id
        });

        newData.save();
        const successEmbed = new MessageEmbed()
            .setTitle(`Úspěch!`)
            .setDescription(`**Byl vytvořen kanál ${newChannel.name} pro calculator simulator hru.**\nHerní příkazy najdeš pod \`${bot.prefix}help\`.`)
            .setColor(`#03fc13`);
        await message.reply({ embeds: [successEmbed] });
        return
    } else {
        if (message.mentions.channels.first()) {
            //Když označí kanál
            const channel = message.mentions.channels.first();
            let newData = new channelModel({
                GuildID: message.guild.id,
                GuildNAME: message.guild.name,
                Creator: {
                    username: message.author.tag,
                    ID: message.author.id
                },
                ChannelID: channel.id
            });

            newData.save();
            const successEmbed = new MessageEmbed()
                .setTitle(`Úspěch!`)
                .setDescription(`**Byl vytvořen kanál ${newChannel.name} pro calculator simulator hru.**\nHerní příkazy najdeš pod \`${bot.prefix}help\`.`)
                .setColor(`#03fc13`);
            await message.reply({ embeds: [successEmbed] });
            return
        }
    }
};