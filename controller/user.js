// const express = require("express");
const User = require("../models/user");
const Group = require("../models/group");
const jwt = require('jsonwebtoken');

async function handelGetAllUsers(req, res) {
  const alldbUsers = await User.find({});
  return res.json(alldbUsers);
}
async function handelloginUser(req, res) {
  const secretKey='itsmysecretkey';
  const { password } = req.body;
  const user = await User.findOne({email : req.body.email});
  // console.log(req.body.email);
  // console.log(req.body.password);
  // console.log(user);
  if (!user || !(user.password === password)){
    return res.redirect("/login");
  }
  // const token = jwt.sign( {email:user.email, _id:user._id}, secretKey);
  const token = jwt.sign( {email: user.email, _id: user._id,}, secretKey);
  res.cookie('token', token, { sameSite: 'None'});
  res.json({token});
}
async function handelAddFriend(req, res) {
  console.log("hello from handel add friend");
  const body = req.body;
  const friendEmail = body.friendemail;
  const myEmail = req.user.email;

  try {
    const friendUser = await User.findOne({ email: friendEmail });
    const myUser = await User.findOne({ email: myEmail });

    if (!friendUser || !myUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const friendId = friendUser._id;
    const myId = myUser._id;

    // Check if the users are already friends
    const areAlreadyFriends = myUser.friends.some(
      (friend) => friend.user.toString() === friendId.toString()
    );

    if (areAlreadyFriends) {
      return res.status(400).json({ msg: "Users are already friends" });
    }

    // Add friends only if they are not already friends
    const friresult = await User.findByIdAndUpdate(
      friendId,
      {
        $push: {
          friends: {
            user: myId,
            amount: "0",
          },
        },
      },
      { new: true }
    );

    const myresult = await User.findByIdAndUpdate(
      myId,
      {
        $push: {
          friends: {
            user: friendId,
            amount: "0",
          },
        },
      },
      { new: true }
    );

    return res.json({ msg: "Friend added", friresult, myresult });
  } catch (error) {
    console.error("Error adding friend:", error);
    return res.status(500).json({ msg: "An error occurred while adding the friend" });
  }
}

async function handelAddUser(req, res) {
try {
    const userData=req.body;
    // console.log(req);
    if(!(userData.name) || !(userData.email) || !(userData.password)) {
      return res.status(410).json({ msg: "all fields required" , userData});
    }
    const newUser = new User(userData);
    await newUser.save();
    return res.json({msg:"user created", newUser});
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
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
  const myEmail=req.user.email;
  const me=await User.findOne({email:myEmail});
  const myId = me._id;
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
  }
}
// Function to get all groups with their names
async function handleGetAllGroups(req, res) {
  const myEmail=req.user.email;
  const me=await User.findOne({email:myEmail});
  const myId = me._id;
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
    const myEmail=req.user.email;
    const me=await User.findOne({email:myEmail});
    const myId = me._id;
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
  handelloginUser,
  handelGetAllUsers,
  handelAddUser,
  handelAddFriend,
  handelGetFriends,
  handelDeleteFriend,
  handleGetAllGroups,
};
