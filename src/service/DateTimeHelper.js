const dateTime = require('date-and-time');
dataSort = require('sort-json-array');

module.exports = class DateTimeHelper {

    constructor (){
        this.today = new Date();
        this.todayComparable = null;
    }

    //init the comparable
    init(){
        let theDate = dateTime.parse(dateTime.format(this.today,'DD.MM'),'DD.MM');
        theDate.setYear('1972'); //Leapyear support
        this.todayComparable = theDate.valueOf();
    }

    //Build abstract timestamp with the year 1972 and the user date
    getAbstractTimestamp(myDate){

        //Construct a new date from the input
        let theDate = dateTime.parse(myDate,'DD.MM');

        //Set the Year of 1792 for LeapYear Support!
        theDate.setYear('1792');

        //build millisecond timestamp
        let myAbstractTimeStamp = theDate.valueOf()>>0;
        return myAbstractTimeStamp;
    }

    //Construct a new date from the input
    getDate(myDate){

        let theDate = dateTime.parse(myDate,'DD.MM');
        //Set the Year of 1792 for LeapYear Support!
        theDate.setYear('1972');
        return theDate
    }

    //validate user entry
    isValidDate(myDate){
        console.log("validating date: "+myDate+" isValid: "+dateTime.isValid(myDate,'DD.MM'));
        return dateTime.isValid(myDate,'DD.MM');
    }



    //Comare Timestamps to find birthday of user
    isBirthday(theDate) {
        //console.log(Date.parse(theDate),this.todayComparable?.valueOf());
        return Date.parse(theDate)  == this.todayComparable.valueOf();
    }

    //Get an users age
    getUserAge(myYear){
        return this.today.getFullYear()-parseInt(myYear);
    }

    //Get the next birthdays in the future (today - 31.12)
    getNextBirthdaysFuture(RwData){
        const filtered = RwData.filter(child => Date.parse(child.date) >= this.todayComparable.valueOf());
        return dataSort(filtered, 'date', 'asc' );
    }

    //Get the next birthdays in the 'past', which will follow the future (today - 01.01)
    getNextBirthdaysPast(RwData){
        const filtered = RwData.filter(child => Date.parse(child.date) <= this.todayComparable.valueOf());
        return dataSort(filtered, 'date', 'asc' );
    }

    //Format a date for display DD.MM
    getFormattedDate(myDate){
       const date = new Date(myDate);
       return dateTime.format(date,'DD.MM')
    }
}