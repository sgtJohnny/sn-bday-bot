const RegisterRW = require('./ReaderWriter.js');
const DateTimeHelper = require('./DateTimeHelper');
require('dotenv').config(); //initialize dotenv

module.exports ={

    processBirthdays(client){

        try {
            //Create new ReaderWriter
            const rw = new RegisterRW();
            const RwData = rw.getDataSource();

            let dateHelper = new DateTimeHelper();
            dateHelper.init();

            console.log(Date.now()+ ":Checking todays birthdays")

            RwData.forEach(db => {

                console.log(`${db.id}: ${db.name}: ${db.date}: ${db.year}`);

                //If dates match, we have a users birthday
                if(dateHelper.isBirthday(db.date) ){
                    //Check if we have a year saved
                    if(db.year==null){
                        client.channels.cache.get(process.env.POST_CHANNEL_ID).send(
                            process.env.TEXT_BIRTHDAY_MSG2_PREFIX+
                            '<@'+db.id+'>'+
                            process.env.TEXT_BIRTHDAY_MSG2_SUFFIX);
                    } else{
                        let age = dateHelper.getUserAge(db.year);
                        client.channels.cache.get(process.env.POST_CHANNEL_ID).send(
                            process.env.TEXT_BIRTHDAY_MSG1_PREFIX+
                            ' <@'+db.id+'>'+
                            process.env.TEXT_BIRTHDAY_MSG1_MIDDLE +
                            age+
                            process.env.TEXT_BIRTHDAY_MSG1_SUFFIX);
                    }
                }
            })
        } catch (err) {
            console.log(`Error reading file from disk: ${err}`)
        }
    },

   async nextBirthdays(amount,interaction,client){
       try {

           //Limit request amount
           if(amount>process.env.MAX_AMOUNT){
               amount = process.env.MAX_AMOUNT;
           }

           //Amount must be >0
           if(amount <=0){
               await interaction.reply({content:''+process.env.MSG_INVALID_NUMBER+'',ephemeral:true})
               return;
           }

           //Create new ReaderWriter
           const rw = new RegisterRW();
           const RwData = rw.getDataSource();

           //Create new Datehelper
           let dateHelper = new DateTimeHelper();
           dateHelper.init();

           //get birthday for future Birthdays THIS YEAR
           const nextBirthdaysFuture = dateHelper.getNextBirthdaysFuture(RwData);
           //get birthday for past Birthdays THIS YEAR, needs to be displayed if future birthdays this year, are smaller than amount
           const nextBirthdaysPast = dateHelper.getNextBirthdaysPast(RwData);

           //Check if we have enough values from above selects
           if ((nextBirthdaysFuture.length + nextBirthdaysPast.length) < amount) {
               amount = (nextBirthdaysFuture.length + nextBirthdaysPast.length)
           }

           let nBF_amount = 0;
           let nBP_amount = 0;

           //Calculate how much data from each array we need
           if (amount < nextBirthdaysFuture.length) {
               nBF_amount = amount;
           } else {
               nBF_amount = nextBirthdaysFuture.length
               nBP_amount = (amount-nBF_amount);
           }

           let msg = 'Die nächsten ' + amount + ' Geburtstage: \n';

           for (let i = 0; i < nBF_amount; i++) {
               msg += '<@' +`${nextBirthdaysFuture[i].id}`+'> am '+dateHelper.getFormattedDate(nextBirthdaysFuture[i].date)+'\n';
           }

           for (let i = 0; i < nBP_amount; i++) {
               msg += '<@' +`${nextBirthdaysPast[i].id}`+'> am '+dateHelper.getFormattedDate(nextBirthdaysPast[i].date)+'\n';
           }
           await interaction.reply({content: '' + msg + '', ephemeral: true})
       } catch (e) {
           console.log(e);
           await interaction.reply({content:''+process.env.MSG_SYS_ERROR+'',ephemeral:true})
       }
    }
}
