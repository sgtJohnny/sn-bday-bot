const fileRW =  require('fs')

module.exports = class RegisterRW {

    constructor() {
        this.userid = null;
        this.username = null;
        this.date = null;
        this.year = null;
        const data = fileRW.readFileSync('./src/database/db.json', 'utf8');
        this.datasource = JSON.parse(data);
    }

    //Set the user
    setUser(myUserId, myUserName){
        this.username = myUserName;
        this.userid  = myUserId;
    }

    //Set the date
    setDate(myDate){
        this.date=myDate;
    }

    //Set the year
    setYear(myYear){
        this.year=myYear;
    }

    //Get the datasource
    getDataSource(){
        return this.datasource;
    }

    //Check if a user is already existing in the db
    isUserExisting(){
        const filtered=this.datasource.filter(child=>(child.id) == this.userid);
        return filtered.length != 0;
    }

    //Delete the an the current user from the db
    deleteUser(){
        const filtered =  this.datasource.filter(child=>(child.id) !== this.userid);
        const rwData = JSON.stringify(filtered);

        fileRW.writeFile('./database/db.json', rwData, 'utf8', err => {
            if (err) {
                console.log(`Error writing file: ${err}`)
            } else {
                console.log(`File is written successfully!`)
            }
        })
    }

    //Write new user to db
    writeNewUser(){

        let newUser = {
            id: this.userid,
            name: this.username,
            date: this.date,
            year: this.year,
        }

        this.datasource.push(newUser);
        const rwData = JSON.stringify(this.datasource);

        fileRW.writeFile('./src/database/db.json', rwData, 'utf8', err => {
            if (err) {
                console.log(`Error writing file: ${err}`)
            } else {
                console.log(`File is written successfully!`)
            }
        })
    }
}