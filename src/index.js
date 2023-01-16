const { default: mongoose } = require("mongoose");
mongoose.set("strictQuery", true);

const express = require("express");

const route = require("../src/route/route.js");

const app = express();

app.use(express.json());

const dbConnection = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Ashish:xpNtADudOurhFaYW@cluster0.8dgrxmt.mongodb.net/Group4database",
      { useNewUrlParser: true }
    );
    console.log("database connected");
  } catch (error) {
    console.log("error while connecting database", error.message);
  }
};

dbConnection();


app.use("/", route);

app.listen(3000, () => {
  console.log(`app start on 3000`);
});
