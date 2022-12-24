const { SlashCommandBuilder} = require('discord.js');
const RegisterRW = require('./ReaderWriter.js')
const operator = require('./BirthdayProcessor');
const DateTimeHelper = require('./DateTimeHelper');
require('dotenv').config(); //initialize dotenv

module.exports ={
    data: new SlashCommandBuilder().setName('birthday')
        .setDescription('Geburtstags-Erinnerungs-Bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('register')
                .setDescription('Registriere deinen Geburtstag zur Erinnerung, optional mit Jahr zur Altersanzeige')
                .addStringOption( option =>
                    option.setName('date')
                        .setDescription('Geburstag im Format DD.MM')
                        .setRequired(true))
                .addStringOption(option =>
                option.setName('year')
                    .setDescription('Geburtsjahr zur Altersanzeige')
                    .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Löscht deine Geburtstagserinnerung')
                )
        .addSubcommand(subcmmand =>
            subcmmand
                .setName('next')
                .setDescription('Zeig die nächsten Geburtstage an')
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Anzahl der nächsten geburtsage')
                        .setRequired(true))),

    async execute(interaction,client){

        switch(interaction.options.getSubcommand()){
            case 'register':
                await module.exports.register(interaction);
                break;
            case 'remove':
                await module.exports.remove(interaction);
                break;
            case 'next':
                await module.exports.list(interaction,client);
                break;
            default:
                await interaction.reply({content:''+process.env.MSG_UNKNOWN_COMMAND +'',ephemeral:true})
                break;
        }
    },

    async register(interaction){

        //Get the current date input value, the username and the userid
        let date = interaction.options.getString('date');
        let year = interaction.options.getString('year');

        let dateHelper = new DateTimeHelper();

        //Create new ReaderWriter class
        const rw = new RegisterRW();
        rw.setUser(interaction.user.id,interaction.user.username)
        console.log('UserID: {} Name: {}',interaction.user.id,interaction.user.username);

        //Check if there is data in the R/W
        if (rw.getDataSource()==null){
            console.log('datasource error');
            return;
        }

        //Check if the User is already registered!
        if(rw.isUserExisting()){
            console.log('User '+interaction.user.username+' ID:'+interaction.user.id+' has tried to register, but already registered');
            await interaction.reply({content:''+process.env.MSG_ALREADY_REGISTERED+'',ephemeral:true})
            return;
        }

        //Date Regex Check
        if(!date.match(/^[0-9][0-9][.]{1}[0-1][0-9]?$/) || !dateHelper.isValidDate(date)){
            console.log('User '+interaction.user.username+' ID:'+interaction.user.id+' has validation error data:'+date);
            await interaction.reply({content:''+process.env.MSG_INVALID_DATA+'',ephemeral:true})
            return;
        }

        rw.setDate(dateHelper.getDate(date), dateHelper.getAbstractTimestamp(date));

        //Year Regex check and stting the year
        if(year!=null && !year.match(/^[0-9]{4}?$/)){
            console.log('User '+interaction.user.username+' ID:'+interaction.user.id+' has validation error data:'+year);
            await interaction.reply({content:''+process.env.MSG_INVALID_DATA+'',ephemeral:true})
            return;
        } else if( year!=null){
            rw.setYear(year);
        }

        //Write the User
        rw.writeNewUser();
        await interaction.reply({content:''+process.env.MSG_SUCCESS+'',ephemeral:true})
    },

    async remove(interaction){

        //Create new ReaderWriter class
        const rw = new RegisterRW();
        rw.setUser(interaction.user.id,interaction.user.username)
        console.log('UserID: {} Name: {}',interaction.user.id,interaction.user.username);

        //Check if there is data in the R/W
        if (rw.getDataSource()==null){
            console.log('datasource error');
            return;
        }

        //Check if the User is registered!
        if(rw.isUserExisting()){
            console.log('User '+interaction.user.username+' ID:'+interaction.user.id+' will be deleted');
            rw.deleteUser();
            await interaction.reply({content:''+process.env.MSG_SUCCESS_DELETE+'',ephemeral:true})
            return;
        } else {
            console.log('User '+interaction.user.username+' ID:'+interaction.user.id+' has tried to remove but was not registered');
            await interaction.reply({content:''+process.env.MSG_NOT_REGISTERED+'',ephemeral:true})
            return;
        }
    },

    async list(interaction, client){
       await operator.nextBirthdays(interaction.options.getNumber('amount'),interaction,client);
    }
};


/*

 */
