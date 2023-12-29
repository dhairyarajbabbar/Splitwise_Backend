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

const port=process.env.port || 4000;
const corsOptions = {
    origin: `http://localhost:${port}`, // Replace with the actual origin of your frontend
    methods: 'POST',
    credentials: true,
    optionsSuccessStatus: 204,
};
// Use cors middleware with options
// app.use(cors(corsOptions));
function hello(req, res){
    const ret=hello;
    return ret.json();
}
app.get("/", hello);
app.use("/api/user", restricttologgedinusersonly, userRouter);
app.use("/api/group", restricttologgedinusersonly, groupRouter);
app.use("/api/groupexpense", restricttologgedinusersonly, grpExpenseRouter);
app.post("/api/signup", handelAddUser);
app.post("/api/login", handelloginUser);

app.listen(port);
