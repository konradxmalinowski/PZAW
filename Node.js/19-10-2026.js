
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
});

// GET - wszyscy użytkownicy
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

// GET - użytkownik po ID
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

// GET - wyszukiwanie po imieniu
app.get("/api/users/search", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email FROM users WHERE name LIKE ?",
            [`%${req.query.name}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// POST - dodawanie użytkownika
app.post("/api/users", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Podaj imię i email" });
        }

        const [result] = await pool.query(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            [name, email]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// PUT - aktualizacja całego użytkownika
app.put("/api/users/:id", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Podaj imię i email" });
        }

        const [result] = await pool.query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.json({ message: "Zaktualizowano użytkownika" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// PATCH - aktualizacja wybranych pól
app.patch("/api/users/:id", async (req, res) => {
    try {
        const { name, email } = req.body;
        const fields = [];
        const values = [];

        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }

        if (email !== undefined) {
            fields.push("email = ?");
            values.push(email);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: "Podaj dane do zmiany" });
        }

        values.push(req.params.id);

        const [result] = await pool.query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.json({ message: "Zaktualizowano użytkownika" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// DELETE - usuwanie użytkownika
app.delete("/api/users/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM users WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.json({ message: "Usunięto użytkownika" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

// OPTIONS - dostępne metody
app.options("/api/users", (req, res) => {
    res.set("Allow", "GET, POST, OPTIONS");
    res.sendStatus(204);
});

app.options("/api/users/:id", (req, res) => {
    res.set("Allow", "GET, PUT, PATCH, DELETE, OPTIONS");
    res.sendStatus(204);
});

// Uruchomienie serwera
app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
