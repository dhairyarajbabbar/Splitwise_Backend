const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const { connectToMongoDb } = require("./connection");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const grpExpenseRouter = require("./routes/grpExpense");
const { handelAddUser } = require("./controller/user");

mongoose.set("strictQuery", true);
const app = express();

// Enable CORS for all routes
connectToMongoDb();
const User = require("./models/user");

// Middleware
app.use(express.urlencoded({ extended: false }));

// app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000', // Replace with the actual origin of your frontend
    methods: 'POST',
    credentials: true,
    optionsSuccessStatus: 204,
};
// Use cors middleware with options
app.use(cors(corsOptions));
// Routes
app.use("/api/user", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/groupexpense", grpExpenseRouter);
app.post("/api", handelAddUser);

app.listen(4000);
