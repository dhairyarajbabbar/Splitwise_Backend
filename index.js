const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const { connectToMongoDb } = require("./connection");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const grpExpenseRouter = require("./routes/grpExpense");
const { handelAddUser, handelloginUser } = require("./controller/user");
const {restricttologgedinusersonly} =require("./middlewares/auth");

mongoose.set("strictQuery", true);
const app = express();
// Enable CORS for all routes
connectToMongoDb();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const corsOptions = {
    origin: 'http://localhost:3000', // Replace with the actual origin of your frontend
    methods: 'POST',
    credentials: true,
    optionsSuccessStatus: 204,
};
// Use cors middleware with options
app.use(cors(corsOptions));

// Routes
// app.use("/api/user",  userRouter);
// app.use("/api/group",  groupRouter);
// app.use("/api/groupexpense", grpExpenseRouter);
app.use("/api/user", restricttologgedinusersonly, userRouter);
app.use("/api/group", restricttologgedinusersonly, groupRouter);
app.use("/api/groupexpense", restricttologgedinusersonly, grpExpenseRouter);
app.post("/api/signup", handelAddUser);
app.post("/api/login", handelloginUser);

app.listen(4000);
