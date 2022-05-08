//Import balíčků
require('dotenv').config();
const Discord = require("discord.js");
const fs = require("fs");
const { MessageActionRow, MessageButton, MessageEmbed } = Discord;
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

//Nastavení Discord bota
const bot = new Discord.Client({
    ws: { properties: { $browser: "Discord iOS" } },
    intents: [Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING
    ]
});

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.slashes = new Discord.Collection();
bot.prefix = ";"

//Nastavení MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env['MongoDBToken'], {
    useNewUrlParser: true,
    useUnifiedTopology: true
    },
    (err) => {
        if(err) console.log(err) 
        else console.log('| Successfully connected to MongoDB storage!\n');
       }
);

//EVENT HANDLER
const eventsFolder = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventsFolder) {
    const eventFile = require(`./events/${file}`);
    const event = file.split(".")[0];
    bot.on(event, eventFile.bind(null, bot));
};


//COMMAND HANDLER
const commandsFolder = fs.readdirSync('./commands');
for (const categoryFolder of commandsFolder) {
    const commandFiles = fs.readdirSync(`./commands/${categoryFolder}`).filter(file => file.endsWith('.js'));
    for (const fileName of commandFiles) {
        const commandFile = require(`./commands/${categoryFolder}/${fileName}`);
        const command = fileName.split(".")[0];
        bot.commands.set(command, commandFile);
        if (commandFile.config.aliases) commandFile.config.aliases.forEach(alias => {
            bot.aliases.set(alias, command);
        });
    }
};

bot.on('messageCreate', async message => {
    const messageArray = message.content.split(' ');
    const cmd = messageArray[0].toLowerCase();
    const args = messageArray.slice(1);

    if (!message.content.startsWith(bot.prefix)) return;
    let commandFile = bot.commands.get(cmd.slice(bot.prefix.length)) || bot.commands.get(bot.aliases.get(cmd.slice(bot.prefix.length)));
    if (commandFile) commandFile.run(bot, message, args);
});


//SHLASH COMMANDS HANDLER
let slashCommands = [];
const slashCommandsFolder = fs.readdirSync('./slashes');
for (const categoryFolder of slashCommandsFolder) {
    const commandFiles = fs.readdirSync(`./slashes/${categoryFolder}`).filter(file => file.endsWith('.js'));
    for (const fileName of commandFiles) {
        const commandFile = require(`./slashes/${categoryFolder}/${fileName}`);
        const slashCommand = fileName.split(".")[0];
        bot.slashes.set(slashCommand, commandFile);
        slashCommands.push(commandFile.data.toJSON());
    }
};
console.log(`| Successfully registered ${slashCommands.length} slash commands!\n`)

bot.once('ready', async (bot) => {
    const rest = new REST({ version: '9' }).setToken(process.env['DiscordBotToken']);

    try {
        await rest.put(
            Routes.applicationCommands(bot.user.id),
            { body: slashCommands },
        );
    } catch (err) {
        console.log(err);
    };
});

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = bot.slashes.get(interaction.commandName);
    if (command) command.run(bot, interaction);
});

//Přihlášení bota
bot.login(process.env['DiscordBotToken']).then(() => {
    console.log('| Bot is on!\n' + `| Logged in as ` + bot.user.tag + '\n');
});