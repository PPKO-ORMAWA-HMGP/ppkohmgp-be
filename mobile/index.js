require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Express body parser
app.use(express.json());

app.get("/", (req, res) => {
    try {
        console.log("PPK Ormawa HMGP Mobile API");
        res.status(200).send("PPK Ormawa HMGP Mobile API");
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

//Routes
app.use("/auth", require("./api/routes/authRoute"));
app.use("/user", require("./api/routes/userRoute"));
app.use("/anorganik", require("./api/routes/anorganikRoute"));
app.use("/organik", require("./api/routes/organikRoute"));
app.use("/notification", require("./api/routes/notificationRoute"));
app.use("/banksampah", require("./api/routes/banksampahRoute"));
app.use("/education", require("./api/routes/educationRoute"));

//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI,
    {
        dbName: process.env.MONGODB_DB,
    }
).
then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT,"0.0.0.0", () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.error(err);
    process.exit(1);
});