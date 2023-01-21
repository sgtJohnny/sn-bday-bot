//Includes
const cron = require("node-cron");
const operator = require('./service/BirthdayProcessor');
require('dotenv').config(); //initialize dotenv

const reactionRoleHandler = require('./service/ReactionRole');

//List of possible commands
const cmd_reg = require('./service/BirthdayCommands');

//New Discord instances
const { Client, GatewayIntentBits,Routes,REST,Partials,Events,Collection, MessageEmbed} = require("discord.js");

//New REST Instance
const rest = new REST().setToken(process.env.CLIENT_TOKEN);

//Create the Bot Client with the needed intents
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
    });

//Create a new Command-Set for the Rest Service
const commands = [
    cmd_reg.data,
] .map(command => command.toJSON());

//Send the REST Data
rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.SRV_ID), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.commandName;

    if (command == null) return;

    console.log("User entered command:"+interaction.toString());

    try {
        switch (command){
            case cmd_reg.data.name:
                await cmd_reg.execute(interaction,client);
              break;
            default:
                console.log('unsupported command');
              break;
        }
    } catch (e) {
        console.error(e);
        await interaction.reply({ content: ''+process.env.MSG_SYS_ERROR+'', ephemeral: true });
    }
});

client.on('messageReactionAdd', async (reaction, user) => {

    reactionRoleHandler.handle(reaction,user,true);
})

client.on('messageReactionRemove', async (reaction, user) => {
    reactionRoleHandler.handle(reaction,user,false);
})


// Function called on the startup of the bot, we send a message to a channel showing the reconnect, and start the scheduler for birthdays
client.on('ready', () => {

    console.log("Bot is now connected");
    try {
        //client.channels.cache.get(process.env.SYSPOST_CHANNEL_ID ).send(address.toString()+' BirthdayBot has reconnected');
        cron.schedule(''+process.env.CHRON_TIMER+'', () => {
             operator.processBirthdays(client);
        });
    } catch (e) {
        console.log('[ERROR: BOT CONNECTION ISSUE]',e);
    }
});

//Must be last line
//Login of the bot
client.login(process.env.CLIENT_TOKEN);
