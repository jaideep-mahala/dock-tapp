const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const path = require("path");

const PORT = 5050;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const MONGO_URL = "mongodb://admin:qwerty@mongo:27017";
const client = new MongoClient(MONGO_URL);

let db;

// Connect ONCE at startup
async function startDB() {
    try {
        await client.connect();
        db = client.db("apnacollege-db");
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

// GET all users
app.get("/getUsers", async (req, res) => {
    try {
        const data = await db.collection("users").find({}).toArray();
        res.send(data);
    } catch (err) {
        res.status(500).send({ error: "Failed to fetch users" });
    }
});

// POST new user
app.post("/addUser", async (req, res) => {
    try {
        const userObj = req.body;

        const result = await db.collection("users").insertOne(userObj);

        res.send({
            message: "User inserted successfully",
            result
        });

    } catch (err) {
        res.status(500).send({ error: "Failed to insert user" });
    }
});

// Start server AFTER DB connection
startDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
});