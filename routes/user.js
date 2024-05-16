const express = require("express");
const User = require("../models/user");
const router = express.Router();
const {
  handelGetAllUsers,
  handelAddFriend,
  handelGetFriends,
  handelDeleteFriend,
  handleGetAllGroups,
  handelAddUser,
} = require("../controller/user");

router.route("/").get(handelGetAllUsers)
router.route("/group").get(handleGetAllGroups);
router
  .route("/friend")
  .get(handelGetFriends)
  .post(handelAddFriend)
  .delete(handelDeleteFriend);

module.exports = router;
