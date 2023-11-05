const express = require("express");
const User = require("../models/user");
const Group = require("../models/group");

async function handelGetAllUsers(req, res) {
  const alldbUsers = await User.find({});
  return res.json(alldbUsers);
}


// async function handelAddFriend(req, res) {
//   const body = req.body;
//   const friendId = body.friendId;
//   const myId = body.myId;

//   const friresult = await User.findByIdAndUpdate(
//     { _id: friendId },
//     {
//       $set: {
//         [`friends.${myId}`]: "0",
//       },
//     }
//   );
//   const myresult = await User.findByIdAndUpdate(
//     { _id: myId },
//     {
//       $set: {
//         [`friends.${friendId}`]: "0",
//       },
//     }
//   );
//   console.log(friresult);
//   console.log(myresult);
//   return res.json({ msg: "friend added", friresult, myresult });
// }
async function handelAddFriend(req, res) {
    const body = req.body;
    const friendId = body.friendId;
    const myId = body.myId;
  
    try {
      const friresult = await User.findByIdAndUpdate(
        friendId,{
          $push: {
            friends: {
              user: myId,
              amount: "0",
            },
          },
        },{ new: true } 
      );
      const myresult = await User.findByIdAndUpdate(
        myId,{
          $push: {
            friends: {
              user: friendId,
              amount: "0", 
            },
          },
        },{ new: true } 
      );
  
      console.log(friresult);
      console.log(myresult);
  
      return res.json({ msg: "Friend added", friresult, myresult });
    } catch (error) {
      console.error("Error adding friend:", error);
      return res.status(500).json({ msg: "An error occurred while adding the friend" });
    }
  }
  
async function handelAddUser(req, res) {
//   const body = req.body;
//   if (!body || !body.name || !body.email) {
//     return res.status(400).json({ msg: "all fields required" });
//   }
//   const result = await User.create({
//     name: body.name,
//     email: body.email,
//     friends: {},
//   });
//   console.log({ result });
//   return res.json({ msg: "user created", result });
try {
    const userData=req.body;
    const newUser = new User(userData);
    await newUser.save();

    return res.json({msg:"user created", newUser});
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}


// async function handelGetFriends(req, res) {
//   const myId = req.query.myId;
//   const myfriends = await User.findById(myId).select("friends");
//   // console.log(myfriends);
//   return res.json({ msg: "friend list is below", myfriends });
// }
// Function to get user details by _id
///////////////////////////////////////////////////////////////////////////////////
async function getUserDetails(userId) {
  try {
    const user = await User.findById(userId.user).select('name email');
    if (!user) {
      return { error: 'User not found' };
    }
    return { _id: user._id, name: user.name, email: user.email };
  } catch (error) {
    console.error(error);
    return { error: 'Internal Server Error' };
  }
}
// Function to get friends with their names
async function handelGetFriends(req, res) {
  const myId = req.query.myId;
  try {
    const myfriends = await User.findById(myId).select("friends");
    // Fetch details for each friend
    const friendsWithDetails = await Promise.all(
      myfriends.friends.map(async (friendId) => {
        const friendDetails = await getUserDetails(friendId);
        return { ...friendDetails, amount: friendId.amount };
      })
    );
    return res.json({ msg: 'Friend list with details', friends: friendsWithDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// async function handleGetAllGroups(req, res) {
//   console.log("hello");
//   const myId = req.query.myId;
//   const mygroups = await User.findById(myId).select("groups");
//   console.log(mygroups);
//   return res.json({ msg: "group list is below", mygroups });
// } 
// Function to get group details by _id
///////////////////////////////////////////////////////////////////////////
async function getGroupDetails(groupId) {
  try {
    const group = await Group.findById(groupId).select('name');
    if (!group) {
      return null;
      return { error: 'Group not found' };
    }
    // console.log(group);
    return { _id: group._id, name: group.name };
  } catch (error) {
    console.error(error);
    return null;
    return { error: 'Internal Server Error 1' };
  }
}
// Function to get all groups with their names
async function handleGetAllGroups(req, res) {
  const myId = req.query.myId;
  try {
    const user = await User.findById(myId).select("groups");
    // console.log(user);
    const groupsWithDetails = await Promise.all(
      user.groups.map(async (groupId) => {
        const groupDetails = await getGroupDetails(groupId);
        return groupDetails;
      })
    );
    const filteredGroups = groupsWithDetails.filter((groupDetails) => groupDetails !== null);
    return res.json({ msg: 'All groups with details', groups: filteredGroups });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
async function handelDeleteFriend(req, res) {
    const body = req.body;
    const myId = body.myId;
    const friendId = body.friendId;
    try {
      await User.findByIdAndUpdate(
        myId,{
          $pull: { friends: { user: friendId } },
        }
      );
      await User.findByIdAndUpdate(
        friendId,{
          $pull: { friends: { user: myId } },
        }
      );
      return res.json({ msg: "Friend deleted" });
    } catch (error) {
      console.error("Error deleting friend:", error);
      return res.status(500).json({ msg: "An error occurred while deleting the friend" });
    }
  }

module.exports = {
  handelGetAllUsers,
  handelAddUser,
  handelAddFriend,
  handelGetFriends,
  handelDeleteFriend,
  handleGetAllGroups,
};
