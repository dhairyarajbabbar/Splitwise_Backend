const express = require("express");
const Group = require("../models/group");
const router = express.Router();
const {
  // handleGetAllGroups,
  handleMakeGroup,
  handleDeleteGroup,
  handleGetGroupUsers,
  handleAddUserToGroup,
  handleDeleteUserFromGroup,
} = require("../controller/group");
router
  .route("/")
  // .get(handleGetAllGroups)
  .post(handleMakeGroup)
  .delete(handleDeleteGroup);
router
  .route("/:id")  //here the id expected is the _id of the group
  .get(handleGetGroupUsers)
  .post(handleAddUserToGroup)
  .delete(handleDeleteUserFromGroup);

module.exports=router;