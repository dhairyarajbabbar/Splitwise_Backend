const mongoose=require("mongoose");
require('dotenv').config();
const url=`mongodb+srv://dhairyarajbabbar:${process.env.MONGODBPASSWORD}@cluster0.pe4gl9r.mongodb.net/?retryWrites=true&w=majority`
// const url="mongodb://127.0.0.1:27017/splitwise_db";
const connectToMongoDb=(async ()=>{
    return mongoose.connect(url).then ( () => {
        console.log("mongodb connected");
    });
})
module.exports={connectToMongoDb};