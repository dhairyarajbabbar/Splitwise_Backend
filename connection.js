const mongoose=require("mongoose");
// async function connectToMongoDb() {
//     return mongoose.connect("mongodb://127.0.0.1:27017/splitwise_db").then ( () => {
//         console.log("mongodb connected");
//     });
// };
const connectToMongoDb=(async ()=>{
    return mongoose.connect("mongodb://127.0.0.1:27017/splitwise_db").then ( () => {
        console.log("mongodb connected");
    });
})
module.exports={connectToMongoDb};