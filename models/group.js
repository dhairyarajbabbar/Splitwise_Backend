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
    activity:[{
      description:{
        type:String,
        required:true,
      },
      amount:{
        type:Number,
        required:true,
      },
      membersInvolved: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the 'User' model
          required: true,
        },
      }],
      payer:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
      },

    }],
})
const Group=mongoose.model("Group", GroupSchema);
module.exports=Group;