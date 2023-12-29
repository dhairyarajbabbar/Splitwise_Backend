const mongoose=require("mongoose");
const url=`mongodb+srv://dhairyarajbabbar:${process.env.mongodbPassWord}@cluster0.pe4gl9r.mongodb.net/?retryWrites=true&w=majority`
console.log(url);
// const url="mongodb://127.0.0.1:27017/splitwise_db";
const connectToMongoDb=(async ()=>{
    return mongoose.connect(url).then ( () => {
        console.log("mongodb connected");
    });
})
module.exports={connectToMongoDb};