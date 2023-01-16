
const express = require("express");
const { default: mongoose } = require("mongoose");


const route = require("./routes/route.js");
mongoose.set('strictQuery', true)

const app = express();

app.use(express.json());



const dbConnection = async ()=>{
    try {
        
        await mongoose.connect("mongodb+srv://Ashish:xpNtADudOurhFaYW@cluster0.8dgrxmt.mongodb.net/Group4database",{useNewUrlParser:true})
        console.log("database connected");
    } catch (error) {
        console.log("error while connecting database", error.message);
    }
}

dbConnection()



module.exports = {dbConnection}


app.use("/", route);

app.listen(3000, () => {
  console.log(`app start on 3000`);
});
