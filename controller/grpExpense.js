const express = require("express");
const Group = require("../models/group");
const User = require("../models/user");

async function handleAddExpense(req, res) {
  try {
    console.log("hello from expense aadder")
    const myEmail=req.user.email;
    const me=await User.findOne({email:myEmail});
    const payerId = me._id;
    // console.log("payer:::::::::", payerId);
    let { participants, amount, groupId, description } = req.body;
    participants=JSON.parse(participants);
    if (!groupId || !payerId || !participants || participants.length === 0 || !amount || !description){
      return res.status(400).json({
        msg: "Group ID, payer ID, participants, and amount are required",
      });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    const payer = await User.findById(payerId);
    const participantsArray = await User.find({ _id: { $in: participants } });
    if (!payer || !participantsArray) {
      return res.status(404).json({ msg: "Payer or participants not found" });
    }
    const allParticipantsInGroup = participants.every((participant) =>
      group.members.some((member) => member.user.equals(participant))
    );
    if (!allParticipantsInGroup) {
      return res
        .status(400)
        .json({ msg: "All participants must be members of the group" });
    }
    const splitAmount = amount / participantsArray.length;
    // Update the balances for payer and participants
    // Initialize balances based on existing balances
    group.members.forEach((member) => {
      if (member.user.equals(payerId)) {
        // this we are doing for the member's toUser
        // Include all participants except the payer in the payer's 'toUsers' array
        participantsArray.forEach((participant) => {
          if (!participant.equals(payerId)) {
            const existingToUser = member.toUsers.find((toUser) =>
              toUser.user.equals(participant._id)
            );
            if (existingToUser) {
              // If the toUser already exists, update the amount
              existingToUser.amount += splitAmount;
              // If the updated amount becomes zero, remove the toUser entry
              if (existingToUser.amount === 0) {
                member.toUsers = member.toUsers.filter(
                  (toUser) => !toUser.user.equals(participant._id)
                );
              }
            } else if (splitAmount !== 0) {
              // If the toUser doesn't exist and the splitAmount is not zero, create a new entry
              member.toUsers.push({
                user: participant._id,
                amount: splitAmount,
              });
            }
          }
        });
      } else if ( participantsArray.some( (participant) =>member.user.equals(participant._id) ) ) {
        // Ensure that the participant's 'toUsers' array contains the payer with a negative amount
        const payerBalanceUpdate = { user: payerId, amount: -splitAmount };
        const existingPayerToPayer = member.toUsers.find((toUser) =>
          toUser.user.equals(payerId)
        );
        if (existingPayerToPayer) {
          existingPayerToPayer.amount += payerBalanceUpdate.amount;
          // If the updated amount becomes zero, remove the toUser entry
          if (existingPayerToPayer.amount === 0) {
            member.toUsers = member.toUsers.filter(
              (toUser) => !toUser.user.equals(payerId)
            );
          }
        } else if (splitAmount !== 0) {
          member.toUsers.push(payerBalanceUpdate);
        }
      }
    });
    // Update the balances for payer and participants
    // await registerExpenseActivity(groupId, payerId, participants, amount, description);
    await group.save();
    return res.json({ msg: "Expense added to the group", group });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res
      .status(500)
      .json({ msg: "An error occurred while adding the expense" });
  }
}

async function registerExpenseActivity(groupId, payerId, participants, amount, description) {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }
    const payer = await User.findById(payerId);
    const participantsArray = await User.find({ _id: { $in: participants } });
    if (!payer || !participantsArray) {
      throw new Error("Payer or participants not found");
    }
    const allParticipantsInGroup = participants.every((participant) =>
      group.members.some((member) => member.user.equals(participant))
    );
    if (!allParticipantsInGroup) {
      throw new Error("All participants must be members of the group");
    }
    const splitAmount = amount / participantsArray.length;
    const activity = {
      description,
      amount,
      membersInvolved: participantsArray.map((participant) => participant._id),
      payer: payerId,
    };
    group.activity.push(activity);
    await group.save();
  } catch (error) {
    console.error("Error registering expense activity:", error);
    throw error;
  }
}



// Function to get activities for a group with pagination
async function getGroupActivities(req, res) {
  try {
    const { groupId, limit, offset } = req.body;
    if (!groupId) {
      return res.status(400).json({ msg: 'Group ID is required' });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }

    const myEmail = req.user.email;
    const me = await User.findOne({ email: myEmail });
    const isMember = group.members.some(member => member.user.equals(me._id));
    if (!isMember) {
      return res.status(403).json({ msg: 'You are not a member of this group' });
    }
    const activities = group.activity.slice(offset, offset + limit);
    return res.json({ msg: 'Activities retrieved', activities });
  } catch (error) {
    console.error('Error retrieving activities:', error);
    return res.status(500).json({ msg: 'An error occurred while retrieving activities' });
  }
}

module.exports = { handleAddExpense, getGroupActivities};