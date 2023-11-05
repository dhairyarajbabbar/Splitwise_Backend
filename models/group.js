const mongoose=require("mongoose");
const GroupSchema = new mongoose.Schema({
    name:{
         type:String,
         required:true,
    },
    members:[{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the 'User' model
          required: true,
        },
        toUsers: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User', // Reference to the 'User' model
              required: true,
            },
            amount: {
              type: Number,
              default: 0, // You can set a default value if needed
            },
        },],
    }], 
})
const Group=mongoose.model("Group", GroupSchema);
module.exports=Group;