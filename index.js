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
require('dotenv').config();

mongoose.set("strictQuery", true);
const app = express();
// Enable CORS for all routes
connectToMongoDb();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const port=process.env.port || 4000;
const corsOptions = {
    origin: `${process.env.frontend}`, // Replace with the actual origin of your frontend
    methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
// Use cors middleware with options
app.use(cors(corsOptions));
app.get("/", (req, res)=>{
    res.send("<h1>finally Working Fine</h1>");
});
app.use("/api/user", restricttologgedinusersonly, userRouter);
app.use("/api/group", restricttologgedinusersonly, groupRouter);
app.use("/api/groupexpense", restricttologgedinusersonly, grpExpenseRouter);
app.post("/api/signup", handelAddUser);
app.post("/api/login", handelloginUser);

app.listen(port, ()=>{
    console.log("server is running on port", {port});
});
