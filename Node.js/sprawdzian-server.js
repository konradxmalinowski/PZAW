const express = require("express");

const app = express();

// Middleware, ktory parsuje przychodzace body w formacie JSON
// i wrzuca je do req.body (bez tego req.body bylby undefined)
app.use(express.json());

// "Baza danych" trzymana w pamieci (tablica obiektow) - po restarcie serwera
// wszystkie zmiany (dodani/edytowani/usunieci userzy) zostaja utracone
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

// GET /api/users - zwraca liste wszystkich userow
app.get("/api/users", (req, res) => {
    res.status(200).json(users);
});

// GET /api/users/search?name=xxx - szuka userow po fragmencie imienia
// MUSI byc przed "/api/users/:id", inaczej "search" trafi w ten handler jako id
app.get("/api/users/search", (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({message: "Podaj parametr name"});
    }

    // szukanie czesciowe, bez rozrozniania wielkosci liter
    const results = users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));

    res.json(results);
});

// GET /api/users/:id - zwraca jednego usera po id
app.get("/api/users/:id", (req, res) => {
    const id = Number(req.params.id); // params.id jest stringiem, rzutujemy na liczbe

    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).json({message: "Nie znaleziono uzytkownika"});
    }

    res.status(200).json(user);
});

// POST /api/users - dodaje nowego usera, body: { name, email }
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    if (!email || !name) {
        return res.status(400).json({message: "Brakuje danych"});
    }

    const newUser = {
        // naiwne generowanie id (ostatni + 1) - po DELETE moze sie powtorzyc
        id: users[users.length - 1].id + 1,
        name,
        email,
    };
    users.push(newUser);
    console.log("Dodano usera");

    res.status(201).json(newUser);
});

// PUT /api/users/:id - pelna aktualizacja, body wymaga { name, email }
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

    // user to referencja do obiektu w tablicy users, wiec modyfikacja = aktualizacja bazy
    user.email = email;
    user.name = name;

    res.json(user);
});

// PATCH /api/users/:id - czesciowa aktualizacja, body: { name?, email? }
app.patch("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({message: "user nie został znaleziony"});
    }

    // sprawdzamy "!== undefined", bo samo "if (req.body.name)" odrzucilo by puste ""
    if (req.body.name !== undefined) {
        user.name = req.body.name;
    }
    if (req.body.email !== undefined) {
        user.email = req.body.email;
    }

    res.status(200).json(user);
});

// DELETE /api/users/:id - usuwa usera o podanym id
app.delete("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(user => user.id === id); // potrzebny index do splice()

    if (index === -1) {
        return res.status(404).json({message: "Taki user nie istnieje"});
    }

    const deletedUser = users.splice(index, 1); // usuwa element w miejscu i go zwraca

    res.status(204).send(); // brak treści w odpowiedzi
});

// OPTIONS /api/users - zwraca dozwolone metody HTTP w naglowku Allow (np. CORS preflight)
app.options("/api/users", (req, res) => {
    res.setHeader("Allow", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.status(204).send();
});

// Start serwera - nasluchuje na porcie 3000
app.listen(3000, () => console.log("dziala"));