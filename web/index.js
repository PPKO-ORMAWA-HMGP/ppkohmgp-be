require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

//Prevent CORS errors
app.use(cors({ credentials: true, origin: true }));
// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    try {
        console.log("PPK Ormawa HMGP Web API");
        res.status(200).send("PPK Ormawa HMGP Web API");
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

//Routes
app.use("/api/berita", require("./api/routes/beritaRoute"));

//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).
then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.error(err);
    process.exit(1);
});