const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "jakublepla"
});

app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email FROM users"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

app.get("/api/users/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});


app.listen(3000, () => {
    console.log("dziala");
});