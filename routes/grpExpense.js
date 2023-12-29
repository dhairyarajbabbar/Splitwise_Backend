const express = require("express");
const User = require("../models/user");
const Group = require("../models/group");
const router = express.Router();
const {handleAddExpense} = require("../controller/grpExpense");

router
  .route("/")
  // .get(handelGetExpense)
  .post(handleAddExpense)
  // .delete();
module.exports = router;
