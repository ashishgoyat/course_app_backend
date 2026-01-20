const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userrouter = require("./routes/user");
const courserouter = require("./routes/course");
const adminrouter = require("./routes/admin");
dotenv.config();
const app = express();
app.use(express.json());


app.use("/user",userrouter);
app.use("/course",courserouter);
app.use("/admin",adminrouter);


async function main() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        app.listen(process.env.PORT, () => console.log(`Server is running at http://localhost:${process.env.PORT}`));
    }catch(err){
        console.log("Mongo connection failed", err);
        process.exit(1);
    }
}
main();