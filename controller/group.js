const express = require("express");
const Group = require("../models/group");
const User = require("../models/user");

// async function handleGetAllGroups(req, res) {
//     const alldbGroups = await Group.find({});
//     return res.json(alldbGroups);
// }

// async function handleMakeGroup(req, res) {
//     try {
//       const body = req.body;
//       // const groupName = body.groupName;
//       // const userIds = body.userIds;
//       const userIds = req.query.memberdata;
//       const groupName = req.query.name;
//       console.log(req.query);
//       console.log(req.body);
//       if (!groupName) {
//         return res.status(400).json({ msg: "Group name is required" });
//       }
//       const newGroup = new Group({ name: groupName, members:[] });
//       for (const userId of userIds) {
//         const user = await User.findById(userId);
//         if (!user) {
//           console.log(user);
//           continue;
//           // return res.status(404).json({ msg: `User with _id ${userId} not found` });
//         }
//         newGroup.members.push({
//           user: userId,
//           toUsers: [],
//         });
//         user.groups.push(newGroup._id);
//         await user.save();
//       }
//       console.log()
//       await newGroup.save();
//       return res.json({ msg: "Group created with users", newGroup });
//     } catch (error) {
//       console.error("Error creating group:", error);
//       return res.status(500).json({ msg: "An error occurred while creating the group" });
//     }
// }
async function handleMakeGroup(req, res) {
  try {
    const body = req.body;
    let userEmails = req.query.memberdata;
    const groupName = req.query.name;
    // userEmails = [userEmails];
    console.log(groupName);
    console.log(userEmails);
    if (!groupName) {
      return res.status(400).json({ msg: "Group name is required" });
    }
    const userIds = await Promise.all(
      userEmails.map(async (email) => {
        const user = await User.findOne({ email });
        return user ? user._id : null;
      })
    );
    const newGroup = new Group({ name: groupName, members: [] });
    for (const userId of userIds) {
      if (!userId) { continue; }
      const user = await User.findById(userId);
      if (!user) { continue; }
      newGroup.members.push({
        user: userId,
        toUsers: [],
      });
      user.groups.push(newGroup._id);
      await user.save();
    }
    await newGroup.save();
    return res.json({ msg: "Group created with users", newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ msg: "An error occurred while creating the group" });
  }
}

async function handleDeleteGroup(req, res) {
    try {
      const groupId = req.query.groupId;
      const group = await Group.findById(groupId);
      console.log({groupId, group});
      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }
      // Find and remove the group from the users' 'groups' arrays
      const userIds = group.members.map((member) => member.user);
      for (const userId of userIds) {
        const user = await User.findById(userId);
        user.groups = user.groups.filter((group) => group.toString() !== groupId);
        await user.save();
      }
      await Group.findByIdAndRemove(groupId);
      return res.json({ msg: "Group deleted" });
    } catch (error) {
      console.error("Error deleting group:", error);
      return res.status(500).json({ msg: "An error occurred while deleting the group" , error});
    }
}
// async function handleGetGroupUsers(req, res) {
//   try {
//     const groupId = req.params.id; // Extract groupId from the route parameters
//     // console.log(req.params);
//     if (!groupId) {  //if no groupid passed
//       return res.status(400).json({ msg: "Group ID is required" });
//     }
//     const group = await Group.findById(groupId);
    
//     if (!group) {    // if group not found
//       return res.status(404).json({ msg: "Group not found" });
//     }
    
//     return res.json({ msg: "Group details retrieved", group });
//     // const userIds = group.members.map((member) => member.user);
//     // const users = await User.find({ _id: { $in: userIds } });

//     // return res.json({ msg: "Group users retrieved", users });
//   } catch (error) {
//     console.error("Error retrieving group users:", error);
//     return res.status(500).json({ msg: "An error occurred while retrieving group users" });
//   }
// }
////////////////////////////////////////////////////////////////
async function getUserDetails(userId) {
  try {
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return null; // or handle the case where user is not found
    }
    return { name: user.name, email: user.email };
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return null; // Handle other errors appropriately
  }
}
async function handleGetGroupUsers(req, res) {
  try {
    const groupId = req.params.id; // Extract groupId from the route parameters
    if (!groupId) {
      return res.status(400).json({ msg: "Group ID is required" });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      group.members.map(async (member) => {
        const userDetails = await getUserDetails(member.user);
        return { userId: member.user, user: userDetails };
      })
    );
    // Create a map of user details with user IDs as keys
    const userDetailMap = membersWithDetails.reduce((acc, member) => {
      acc[member.userId] = member.user;
      return acc;
    }, {});
    return res.json({ msg: "Group details retrieved", group, userDetailMap });
  } catch (error) {
    console.error("Error retrieving group details:", error);
    return res.status(500).json({ msg: "An error occurred while retrieving group details" });
  }
}
/////////////////////////////////////////////////////
  
async function handleAddUserToGroup(req, res) {
  try {
    const groupId = req.params.id; // Extract the group ID from the route parameter
    const userId = req.body.userId; // Extract the user ID from the request body
    if (!groupId || !userId) {
      return res.status(400).json({ msg: "Group ID and user ID are required" });
    }

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userExistsInGroup = group.members.some((member) => member.user.equals(userId));
    if (userExistsInGroup) {
      return res.status(400).json({ msg: "User is already a member of the group" });
    }
    
    group.members.push({ user: userId, toUsers: []});
    await group.save();

    user.groups.push(groupId);
    await user.save();

    return res.json({ msg: "User added to the group", group });
  } catch (error) {
    console.error("Error adding user to the group:", error);
    return res.status(500).json({ msg: "An error occurred while adding the user to the group" });
  }
}
  

async function handleDeleteUserFromGroup(req, res) {
  try {
    const groupId = req.params.id; // Extract the group ID from the route parameter
    const userId = req.body.userId; // Extract the user ID from the request body
    if (!groupId || !userId) {
      return res.status(400).json({ msg: "Group ID and user ID are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const memberIndex = group.members.findIndex((member) => member.user.equals(userId));
    if (memberIndex === -1) {
      return res.status(404).json({ msg: "User is not a member of the group" });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    user.groups = user.groups.filter((groupId) => !groupId.equals(group._id));
    await user.save();

    return res.json({ msg: "User removed from the group", group });
  } catch (error) {
    console.error("Error removing user from the group:", error);
    return res.status(500).json({ msg: "An error occurred while removing the user from the group" });
  }
}


module.exports = {
  // handleGetAllGroups,
  handleMakeGroup,
  handleDeleteGroup,
  handleGetGroupUsers,
  handleAddUserToGroup,
  handleDeleteUserFromGroup,
};