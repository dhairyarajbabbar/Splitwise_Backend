const express = require("express");
const Group = require("../models/group");
const User = require("../models/user");

async function handleAddExpense(req, res) {
    try {
      const groupId = req.params.id; // Extract the group ID from the route parameter
      const { payerId, participants, amount } = req.body;
      // Check if the group ID, payer ID, participants, and amount are provided
      if (!groupId || !payerId || !participants || participants.length === 0 || !amount) {
        return res.status(400).json({ msg: "Group ID, payer ID, participants, and amount are required" });
      }
      // Find the group by its _id
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ msg: "Group not found" });
      }
      // Find the payer and participants by their _ids
      const payer = await User.findById(payerId);
      const participantsArray = await User.find({ _id: { $in: participants } });
      if (!payer || !participantsArray) {
        return res.status(404).json({ msg: "Payer or participants not found" });
      }
      const allParticipantsInGroup = participants.every((participant) =>
        group.members.some((member) => member.user.equals(participant))
      );
      if (!allParticipantsInGroup) {
        return res.status(400).json({ msg: 'All participants must be members of the group' });
      }
      // Calculate the split amount for each participant
      const splitAmount = amount / (participantsArray.length); // +1 for the payer
      // Update the balances for payer and participants
      // const payerBalanceUpdate = { user: payerId, amount: 0 }; ///// no use
      // const participantsBalanceUpdates = participantsArray.map((participant) => ({ user: participant._id, amount: 0 })); ////no use 2
      // Initialize balances based on existing balances
      group.members.forEach((member) => {//we are traversing for each member in the group
        if (member.user.equals(payerId)) { // this we are doing for the member's toUser
          // Include all participants except the payer in the payer's 'toUsers' array
          participantsArray.forEach((participant) => {
            if (!participant.equals(payerId)) { // Skip the payer
              const existingToUser = member.toUsers.find((toUser) => toUser.user.equals(participant._id));
              if (existingToUser) {
                // If the toUser already exists, update the amount
                existingToUser.amount += splitAmount;
              } else {
                // If the toUser doesn't exist, create a new entry
                member.toUsers.push({ user: participant._id, amount: splitAmount });
              }
            }
          });
        } else if (participantsArray.some((participant) => member.user.equals(participant._id))) {
          // const participantToUpdate = participantsBalanceUpdates.find((update) =>// this is the member on which we are currently////no use 2
            // update.user.equals(member.user)
          // );
          // Ensure that the participant's 'toUsers' array contains the payer with a negative amount
          // participantToUpdate.amount -= splitAmount; ///////no use 2
          const payerBalanceUpdate = { user: payerId, amount: -splitAmount };
          const existingPayerToPayer = member.toUsers.find((toUser) => toUser.user.equals(payerId));
          if (existingPayerToPayer) {
            existingPayerToPayer.amount += payerBalanceUpdate.amount;
          } else {
            member.toUsers.push(payerBalanceUpdate);
          }
        }
      });
      // Update the balances for payer and participants
      // payerBalanceUpdate.amount += participantsArray.length * splitAmount; ///////no use
      // participantsBalanceUpdates.forEach((update) => { //////no use 2
      //   update.amount += splitAmount;
      // });
  
      // Save the updated group document
      await group.save();
  
      return res.json({ msg: "Expense added to the group", group });
    } catch (error) {
      console.error("Error adding expense:", error);
      return res.status(500).json({ msg: "An error occurred while adding the expense" });
    }
}


async function handelGetExpense(req, res) {}

module.exports = { handleAddExpense, handelGetExpense };
