# Projektowanie REST API - operacje CRUD i endpointy do uploadu plików

Krótko: w poprzednich plikach poznałeś osobno routing i middleware (`5-express-routing-middleware.md`) oraz zapytania do bazy danych (`7-mysql-integracja.md`). Ten plik spina te dwie rzeczy w jedną, uporządkowaną całość - pełne REST API do zarządzania jednym zasobem, z sensowną strukturą projektu, obsługą błędów i uploadem plików.

## 1. Czym jest REST?

**REST** (*Representational State Transfer*) to zbiór konwencji dotyczących projektowania API opartego o HTTP. Dwa najważniejsze pojęcia:

* **zasób** (*resource*) - rzecz, którą aplikacja udostępnia, np. użytkownicy, produkty, zamówienia. Każdy zasób ma swój adres, np. `/api/users`.
* **endpoint** - konkretny adres URL, pod którym można wykonać operację na zasobie, np. `/api/users/5`.

W REST metoda HTTP mówi, jaką operację wykonujemy, a adres mówi, na czym - metoda pełni rolę czasownika, adres rolę rzeczownika:

| Metoda | Operacja | Przykład |
|---|---|---|
| GET | odczyt | `GET /api/users` - lista, `GET /api/users/5` - jeden |
| POST | tworzenie | `POST /api/users` |
| PUT / PATCH | aktualizacja | `PUT /api/users/5` |
| DELETE | usunięcie | `DELETE /api/users/5` |

Stąd nazwa **CRUD** - Create, Read, Update, Delete - cztery podstawowe operacje, które w REST API odpowiadają czterem metodom HTTP na tym samym adresie zasobu.

### Konwencje nazewnicze adresów

Adresy zasobów zapisuje się rzeczownikami w liczbie mnogiej, bez czasowników w środku:

```text
dobrze:  GET /api/users          źle:  GET /api/getUsers
dobrze:  POST /api/users         źle:  POST /api/createUser
dobrze:  DELETE /api/users/5     źle:  GET /api/deleteUser?id=5
```

Czasownik operacji już siedzi w metodzie HTTP - dopisywanie go jeszcze raz w adresie jest zbędne i niezgodne z konwencją REST.

## 2. Dlaczego dzielimy kod na routes, controllers i models?

Do tej pory logika trasy (obsługa żądania) i zapytanie do bazy mogły siedzieć w jednym miejscu. Przy większym API to szybko robi się nieczytelne, dlatego rozdziela się odpowiedzialności na trzy warstwy:

```text
routes/
→ definiuje adresy i metody HTTP, kieruje żądanie do właściwej funkcji

controllers/
→ obsługuje żądanie: czyta req, wywołuje model, wysyła odpowiedź (res)

models/
→ rozmawia z bazą danych - same zapytania SQL, bez wiedzy o req/res
```

Każda warstwa ma jedną odpowiedzialność. Router nie wie nic o SQL, model nie wie nic o `req`/`res`, kontroler spina jedno z drugim. Dzięki temu łatwiej znaleźć kod odpowiedzialny za konkretną rzecz i łatwiej go przetestować osobno.

Struktura projektu dla API użytkowników:

```text
projekt/
│
├── routes/
│   └── users.js
├── controllers/
│   └── usersController.js
├── models/
│   └── userModel.js
├── db.js
└── server.js
```

## 3. Warstwa model - zapytania do bazy

`models/userModel.js` zawiera wyłącznie zapytania SQL, korzystając z puli połączeń poznanej w poprzednim temacie:

```javascript
const pool = require("../db");

async function getAllUsers() {
    const [rows] = await pool.query("SELECT id, name, email FROM users");
    return rows;
}

async function getUserById(id) {
    const [rows] = await pool.query(
        "SELECT id, name, email FROM users WHERE id = ?",
        [id]
    );

    return rows[0];
}

async function createUser(name, email) {
    const [result] = await pool.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email]
    );

    return { id: result.insertId, name, email };
}

async function updateUser(id, name, email) {
    const [result] = await pool.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, id]
    );

    return result.affectedRows;
}

async function deleteUser(id) {
    const [result] = await pool.query(
        "DELETE FROM users WHERE id = ?",
        [id]
    );

    return result.affectedRows;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
```

`pool.query(...)` zwraca tablicę dwuelementową `[rows, fields]`, dlatego pojawia się zapis `const [rows] = await pool.query(...)` - to **destrukturyzacja tablicy**: bierzemy z niej tylko pierwszy element (wynik zapytania), a drugi (metadane kolumn, rzadko potrzebne) pomijamy. Przy zapytaniach `INSERT`/`UPDATE`/`DELETE` ten pierwszy element to nie wiersze tabeli, tylko obiekt z informacjami o wykonanej operacji, np. `result.insertId` (id nowo dodanego wiersza) albo `result.affectedRows` (ile wierszy zmieniła operacja).

`getUserById` zwraca `rows[0]` zamiast całej tablicy - `WHERE id = ?` dopasuje najwyżej jeden wiersz, więc od razu wyciągamy go z tablicy wyniku. Jeśli nic nie pasuje, `rows[0]` da `undefined` - to sprawdzimy w kontrolerze.

## 4. Warstwa controller - obsługa żądania

`controllers/usersController.js` korzysta z modelu i odpowiada za `req`/`res`:

```javascript
const userModel = require("../models/userModel");

async function getUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}

async function getUser(req, res) {
    try {
        const user = await userModel.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}

async function addUser(req, res) {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Pola name i email są wymagane" });
        }

        const newUser = await userModel.createUser(name, email);
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}

async function editUser(req, res) {
    try {
        const { name, email } = req.body;
        const affectedRows = await userModel.updateUser(req.params.id, name, email);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.json({ message: "Użytkownik zaktualizowany" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}

async function removeUser(req, res) {
    try {
        const affectedRows = await userModel.deleteUser(req.params.id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Nie znaleziono użytkownika" });
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}

module.exports = { getUsers, getUser, addUser, editUser, removeUser };
```

Zwróć uwagę na słowo `return` przed `res.status(404)...` w środku funkcji, np. w `getUser`. Nie chodzi tu o zwracanie jakiejś wartości z funkcji - Express i tak jej nie używa. `return` służy wyłącznie do natychmiastowego przerwania dalszego wykonywania funkcji, żeby po wysłaniu odpowiedzi błędu nie wykonał się jeszcze kolejny fragment kodu, który wysłałby drugą odpowiedź (np. `res.json(user)` kawałek niżej). Wysłanie dwóch odpowiedzi na jedno żądanie kończy się błędem.

Każda funkcja kontrolera odpowiada za jedną operację: sprawdza dane wejściowe, wywołuje model, i na podstawie wyniku decyduje, jaką odpowiedź wysłać. `404` pojawia się wtedy, gdy zasób o podanym `id` nie istnieje, `400` - gdy dane od klienta są niepoprawne, `500` - gdy coś poszło nie tak po stronie serwera (np. baza danych chwilowo niedostępna). `204 No Content` przy `removeUser` oznacza "operacja się udała, nie ma nic do zwrócenia" - typowa odpowiedź na `DELETE`. Każda z tych funkcji jest też opakowana w `try/catch`, bo błąd zgłoszony przez `await` (np. baza danych chwilowo niedostępna) rzuciłby wyjątek - bez przechwycenia go żądanie klienta nigdy nie dostałoby żadnej odpowiedzi.

## 5. Warstwa route - definicja adresów

`routes/users.js` łączy adresy z funkcjami kontrolera:

```javascript
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/", usersController.getUsers);
router.get("/:id", usersController.getUser);
router.post("/", usersController.addUser);
router.put("/:id", usersController.editUser);
router.delete("/:id", usersController.removeUser);

module.exports = router;
```

Ten plik nie zawiera żadnej logiki - tylko mapowanie adresu i metody na odpowiednią funkcję. Dzięki temu, żeby zrozumieć, jakie endpointy ma API, wystarczy przejrzeć ten jeden, krótki plik.

## 6. Spięcie całości w server.js

```javascript
const express = require("express");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());
app.use("/api/users", usersRouter);

app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

Pełny przepływ dla `GET /api/users/5` wygląda tak:

```text
żądanie GET /api/users/5
        ↓
server.js → app.use("/api/users", usersRouter)
        ↓
routes/users.js → router.get("/:id", usersController.getUser)
        ↓
controllers/usersController.js → getUser(req, res)
        ↓
models/userModel.js → getUserById(id)
        ↓
zapytanie SQL do bazy danych
        ↓
wynik wraca przez model → kontroler → res.json(user)
```

Każda z pozostałych operacji CRUD (`POST`, `PUT`, `DELETE`) przechodzi przez dokładnie te same trzy warstwy - różni się tylko funkcją modelu i kontrolera, które zostały wywołane.

## 7. Testowanie API narzędziem typu Postman

Przeglądarka bez problemu wysyła żądania `GET` (wystarczy wpisać adres), ale nie da się nią łatwo wysłać `POST` z danymi w formacie JSON albo `DELETE`. Do tego służą narzędzia takie jak **Postman** albo **Insomnia** - programy, w których:

* wybiera się metodę HTTP (`GET`, `POST`, `PUT`, `DELETE`),
* wpisuje adres endpointu (np. `http://localhost:3000/api/users`),
* dla `POST`/`PUT` wpisuje się treść żądania w formacie JSON (odpowiednik `req.body`),
* po wysłaniu żądania widać odpowiedź serwera razem z kodem statusu (`200`, `201`, `404`...) i czasem odpowiedzi.

To pozwala testować API niezależnie od frontendu - zanim ktokolwiek napisze choćby jeden komponent w Reactcie, backend można w pełni sprawdzić samym Postmanem. W praktyce zapisuje się kolekcję żądań (jedno na każdy endpoint), żeby móc szybko powtórzyć testy po każdej zmianie w kodzie.

## 8. Upload plików - multer

Express sam z siebie nie potrafi odebrać przesłanego pliku - `express.json()` obsługuje tylko dane tekstowe/JSON. Pliki przesyła się w formacie `multipart/form-data` - to inny sposób zapakowania treści żądania HTTP niż JSON, który potrafi przenieść w jednym żądaniu zarówno zwykłe pola tekstowe, jak i surowe bajty pliku. Formularze HTML z `<input type="file">` i większość klientów API wysyłają pliki właśnie w ten sposób, bo JSON nie nadaje się do przenoszenia dużych danych binarnych. Do obsługi takich żądań w Express służy biblioteka **multer**.

```bash
npm install multer
```

Podstawowa konfiguracja - zapis pliku na dysku, do katalogu `uploads/`:

```javascript
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
```

Endpoint przyjmujący jeden plik, przesłany pod nazwą pola `avatar`:

```javascript
app.post("/api/users/:id/avatar", upload.single("avatar"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Brak pliku" });
    }

    res.json({
        message: "Plik przesłany",
        filename: req.file.filename,
        size: req.file.size
    });
});
```

`upload.single("avatar")` to middleware - dokładnie ten sam mechanizm co `checkAuth` czy `validateUser` w poprzednim temacie. Przechwytuje przesłany plik, zapisuje go w katalogu `uploads/` pod losową nazwą i udostępnia informacje o nim w `req.file` (oryginalna nazwa, nazwa zapisana na dysku, rozmiar, typ). `"avatar"` musi zgadzać się z nazwą pola, pod którym plik został wysłany w formularzu - jeśli klient wyśle plik pod inną nazwą pola, `req.file` będzie `undefined`.

Ścieżkę do zapisanego pliku warto zapisać w bazie danych (np. w kolumnie `avatar_url` tabeli `users`), żeby powiązać go z konkretnym rekordem - sam multer odpowiada tylko za odebranie i zapisanie pliku, nie za jego powiązanie z resztą danych.

## 9. Najczęstsze błędy

**Brak warstwy pośredniej i wszystko w jednym pliku.** Przy małym projekcie kuszące jest trzymanie SQL bezpośrednio w routerze - przy większym API szybko traci się orientację, co gdzie się dzieje.

**Zwracanie różnych formatów błędów w różnych miejscach.** Jeśli jeden endpoint przy błędzie zwraca `{ error: "..." }`, a inny `{ message: "..." }`, frontend musi obsługiwać dwa różne kształty odpowiedzi. Warto ustalić jeden format komunikatów błędów na cały projekt.

**Mylenie kodów statusu.** `404` to "nie znaleziono zasobu", nie "błąd serwera". `400` to błędne dane od klienta, nie "coś nie działa". `500` zostaw wyłącznie na sytuacje, na które backend nie ma wpływu (np. baza danych padła).

**Zapomniana nazwa pola przy multer.** `upload.single("avatar")` zadziała tylko wtedy, gdy formularz (albo Postman) wysyła plik dokładnie pod nazwą pola `avatar`.

**Brak walidacji `id` z `req.params`.** Jeśli ktoś wywoła `GET /api/users/abc`, `req.params.id` będzie tekstem `"abc"` - zapytanie SQL z takim `id` nie znajdzie żadnego wiersza (co akurat obsłuży `404`), ale w innych sytuacjach warto jawnie sprawdzić, czy parametr wygląda na poprawną liczbę.

## Co trzeba zapamiętać

```text
REST
→ konwencja projektowania API: zasób w adresie, operacja w metodzie HTTP

CRUD
→ Create (POST), Read (GET), Update (PUT/PATCH), Delete (DELETE)

routes/
→ definiuje adresy, kieruje żądanie dalej

controllers/
→ obsługuje req/res, wywołuje model, decyduje o odpowiedzi

models/
→ zapytania SQL, bez wiedzy o req/res

kody statusu
→ 200 OK, 201 Created, 204 No Content,
  400 Bad Request, 404 Not Found, 500 Internal Server Error

multer
→ middleware do odbierania przesłanych plików (multipart/form-data)

Postman / Insomnia
→ narzędzia do testowania API bez potrzeby pisania frontendu
```

## Ćwiczenia

1. Zaprojektuj i zaimplementuj pełne REST API (routes/controllers/models) dla zasobu `products` (`id`, `name`, `price`) z operacjami GET (lista i jeden), POST, PUT, DELETE.
2. Dodaj walidację w kontrolerze `addProduct` - `name` musi być niepustym tekstem, `price` musi być liczbą większą od zera.
3. Przetestuj wszystkie endpointy z ćwiczenia 1 w Postmanie (albo Insomni) - dla każdego zanotuj, jaki kod statusu i jaką odpowiedź zwraca w przypadku sukcesu i w przypadku błędu.
4. Dodaj endpoint `POST /api/products/:id/image`, przyjmujący jeden plik przez multer pod nazwą pola `image`, i zapisujący jego nazwę w odpowiedzi JSON.
5. Zmień format błędów tak, żeby każdy endpoint w projekcie zwracał błędy w jednym, spójnym kształcie, np. `{ error: { message: "..." } }`.
