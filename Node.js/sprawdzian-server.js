const express = require("express");

const app = express();

app.use(express.json());

let users = [
    {
        id: 1,
        name: "Konrad",
        email: "konrad@konrad.pl"
    },
    {
        id: 2,
        name: "Konrad2",
        email: "konrad2@konrad.pl"
    },
    {
        id: 3,
        name: "Konrad3",
        email: "konrad3@konrad.pl"
    }
];

app.get("/api/users", (req, res) => {
    res.status(200).json(users);
});

app.get("/api/users/search", (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({message: "Podaj parametr name"});
    }

    const results = users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
    
    res.json(results);
});

app.get("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).json({message: "Nie znaleziono uzytkownika"});
    }

    res.status(200).json(user);
});

app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    if (!email || !name) {
        return res.status(400).json({message: "Brakuje danych"});
    }

    const newUser = {
        id: users[users.length - 1].id + 1,
        name, 
        email,
    };
    users.push(newUser);
    console.log("Dodano usera");

    res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({message: "User nie został znaleziony"});
    }

    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({message: "Put wymaga wszystkich danych"});
    }

    user.email = email;
    user.name = name;

    res.json(user);
});

app.patch("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({message: "user nie został znaleziony"});
    }

    if (req.body.name !== undefined) {
        user.name = req.body.name;
    }
    if (req.body.email !== undefined) {
        user.email = req.body.email;
    }

    res.status(200).json(user);
});

app.delete("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({message: "Taki user nie istnieje"});
    }

    const deletedUser = users.splice(index, 1);

    res.status(204).send();
});

app.options("/api/users", (req, res) => {
    res.setHeader("Allow", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.status(204).send();
});

app.listen(3000, () => console.log("dziala"));