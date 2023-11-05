const express = require("express");
const mongoose = require("mongoose");
const { connectToMongoDb } = require("./connection");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const grpExpenseRouter = require("./routes/grpExpense");
mongoose.set("strictQuery", true);
const app = express();

// connection
connectToMongoDb();
const User = require("./models/user");
//middleware
app.use(express.urlencoded({ extended: false }));
//routes
app.use("/api/user", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/group/expense", grpExpenseRouter);
app.listen(4000);
