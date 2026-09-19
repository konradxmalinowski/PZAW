# Routing zaawansowany i middleware w Express.js

Krótko: w poprzednim pliku (`4-express-podstawy.md`) poznałeś podstawy Express - trasy `GET`/`POST`, `req.body`, `req.query` i middleware wbudowane (`express.json()`). Tu rozwijasz routing o dynamiczne ścieżki (`req.params`), uczysz się dzielić trasy na osobne pliki przez `express.Router`, piszesz własny middleware i dodajesz prostą walidację danych wejściowych.

## 1. req.params - dynamiczne ścieżki

Do tej pory każda trasa miała stały adres, np. `/api/users`. W praktyce bardzo często potrzebujemy adresu, który zawiera identyfikator konkretnego zasobu, np. `/api/users/1`, `/api/users/2`. Zamiast definiować osobną trasę dla każdego możliwego `id`, Express pozwala zapisać fragment ścieżki jako parametr, poprzedzając go dwukropkiem:

```javascript
const express = require("express");

const app = express();

const users = [
    { id: 1, name: "Jan" },
    { id: 2, name: "Anna" }
];

app.get("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    }

    res.json(user);
});

app.listen(3000);
```

`:id` w ścieżce `/api/users/:id` to nazwa parametru - może nazywać się dowolnie, ważny jest dwukropek na początku. Express dopasuje pod tę trasę każdy adres w kształcie `/api/users/coś` i wartość `coś` wstawi do `req.params.id` jako tekst (string). Dlatego przy porównywaniu z liczbami w tablicy trzeba go zamienić przez `Number()` - `req.params.id` samo w sobie to zawsze string, nawet jeśli w adresie widać same cyfry.

Jeśli użytkownik o podanym `id` nie istnieje, `find()` zwróci `undefined` - stąd sprawdzenie `if (!user)` i odpowiedź z kodem `404`. To bardzo częsty wzorzec przy pracy z zasobami po identyfikatorze.

### Wiele parametrów w jednej ścieżce

Ścieżka może mieć więcej niż jeden parametr:

```javascript
app.get("/api/users/:userId/posts/:postId", (req, res) => {
    const { userId, postId } = req.params;
    res.send(`Użytkownik ${userId}, wpis ${postId}`);
});
```

Adres `/api/users/5/posts/12` da w efekcie `req.params.userId === "5"` i `req.params.postId === "12"`.

### req.params a req.query - przypomnienie różnicy

Te dwie rzeczy często się mylą, więc warto zestawić je obok siebie:

| | `req.params` | `req.query` |
|---|---|---|
| skąd bierze wartość | z fragmentu samej ścieżki (`/users/:id`) | z parametrów po `?` w adresie (`?search=...`) |
| kiedy używać | gdy wartość identyfikuje konkretny zasób | gdy wartość jest opcjonalna (filtrowanie, sortowanie, wyszukiwanie) |
| przykład adresu | `/api/users/5` | `/api/users?search=Jan` |
| przykład odczytu | `req.params.id` | `req.query.search` |

## 2. Dlaczego trasy warto dzielić na moduły?

Jeden plik z całym `app.get`, `app.post`, `app.put`, `app.delete` dla wielu różnych zasobów (użytkownicy, produkty, zamówienia) szybko robi się nieczytelny. Express pozwala wydzielić trasy dotyczące jednego zasobu do osobnego pliku, korzystając z `express.Router()`.

Router zachowuje się jak mniejsza, samodzielna aplikacja Express - ma własne `.get()`, `.post()` itd. - którą później "podpinamy" pod główną aplikację pod wybraną ścieżką bazową.

## 3. express.Router() w praktyce

Plik `routes/users.js`:

```javascript
const express = require("express");
const router = express.Router();

const users = [
    { id: 1, name: "Jan" },
    { id: 2, name: "Anna" }
];

router.get("/", (req, res) => {
    res.json(users);
});

router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    }

    res.json(user);
});

router.post("/", (req, res) => {
    const newUser = req.body;
    users.push(newUser);

    res.status(201).json({ message: "Użytkownik dodany", user: newUser });
});

module.exports = router;
```

Zwróć uwagę, że wewnątrz routera ścieżki są zapisane tak, jakby `/api/users` w ogóle nie istniało - jest tylko `/`, `/:id`. To nie pomyłka - ścieżkę bazową dopiszemy dopiero w głównym pliku, podczas podpinania routera.

Plik główny `server.js`:

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

`app.use("/api/users", usersRouter)` mówi: każde żądanie, które zaczyna się od `/api/users`, ma trafić do `usersRouter`, a Express sam doklei resztę ścieżki. Dzięki temu `router.get("/")` w pliku `routes/users.js` faktycznie obsługuje `GET /api/users`, a `router.get("/:id")` obsługuje `GET /api/users/:id`.

Taki podział ma dwie zalety: plik główny (`server.js`) zostaje krótki i czytelny, a trasy dotyczące jednego zasobu (np. użytkowników) są w jednym miejscu, niezależnie od tras dotyczące innych zasobów (np. produktów w osobnym pliku `routes/products.js`).

## 4. Własny middleware

Middleware wykonuje się przed właściwą obsługą żądania - może sprawdzić coś w `req`, zmodyfikować dane, zalogować informację, a na końcu musi albo wywołać `next()` (żeby przekazać obsługę dalej), albo samodzielnie wysłać odpowiedź (np. gdy coś jest nie tak i dalsza obsługa nie ma sensu).

Middleware logujące każde żądanie, znane już z poprzedniego pliku:

```javascript
function requestLogger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

app.use(requestLogger);
```

Middleware nie musi działać globalnie - można je podpiąć tylko pod konkretną trasę, podając jako dodatkowy argument między ścieżką a właściwą funkcją obsługującą:

```javascript
function checkAuth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Brak autoryzacji" });
    }

    next();
}

app.get("/api/users/:id", checkAuth, (req, res) => {
    // ten kod wykona się tylko, jeśli checkAuth wywoła next()
    res.json({ id: req.params.id });
});
```

`checkAuth` sprawdza obecność nagłówka `Authorization`. Jeśli go nie ma - odsyła odpowiedź z kodem `401` (Unauthorized, czyli "brak autoryzacji") i **nie wywołuje `next()`**, dzięki czemu funkcja obsługująca trasę w ogóle się nie wykona. Jeśli nagłówek jest obecny, middleware wywołuje `next()` i obsługa żądania trafia do właściwej funkcji. Pełne uwierzytelnianie oparte o tokeny JWT to osobny, dalszy temat - tu chodzi wyłącznie o mechanizm middleware jako "bramki" przed właściwą trasą.

## 5. Walidacja danych wejściowych

Zanim zapiszemy dane przesłane przez klienta (np. w `req.body`), warto sprawdzić, czy zawierają to, czego oczekujemy. Najprostsza walidacja to zwykłe sprawdzenie warunkiem `if`:

```javascript
app.post("/api/users", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Pola name i email są wymagane" });
    }

    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);

    res.status(201).json({ message: "Użytkownik dodany", user: newUser });
});
```

Jeśli `name` lub `email` nie zostały przesłane (albo są pustym stringiem), warunek `!name || !email` jest prawdziwy i serwer odpowiada kodem `400` (Bad Request) razem z komunikatem, zamiast dodawać niepełne dane do tablicy. Kod `400` oznacza błąd po stronie klienta - to on przysłał niepoprawne dane, w odróżnieniu od `404` (zasobu nie ma) czy `500` (błąd po stronie serwera).

Walidację warto też wydzielić do własnego middleware, jeśli ma być używana w kilku trasach:

```javascript
function validateUser(req, res, next) {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Pola name i email są wymagane" });
    }

    next();
}

router.post("/", validateUser, (req, res) => {
    const newUser = req.body;
    users.push(newUser);

    res.status(201).json({ message: "Użytkownik dodany", user: newUser });
});
```

Trasa zakłada teraz, że dane są już sprawdzone - middleware `validateUser` zatrzyma żądanie wcześniej, jeśli coś jest nie tak. To ten sam mechanizm co `checkAuth` w poprzednim punkcie - middleware jako etap poprzedzający właściwą logikę trasy.

## 6. Najczęstsze błędy

**Zapomniany `next()` w middleware.** Jeśli middleware nie wywoła ani `next()`, ani nie wyśle odpowiedzi, żądanie zawiśnie na zawsze - klient nigdy nie dostanie odpowiedzi.

```javascript
function badMiddleware(req, res, next) {
    console.log("coś tam");
    // brak next() - żądanie utknie tutaj
}
```

**Wywołanie `next()` mimo wysłania odpowiedzi.** Jeśli middleware już odesłało odpowiedź (`res.status(401).json(...)`), nie wolno dodatkowo wywołać `next()` - trasa spróbuje wtedy wysłać drugą odpowiedź na to samo żądanie, co kończy się błędem.

**Mylenie `req.params` z `req.query`.** `req.params.id` działa tylko wtedy, gdy w ścieżce trasy faktycznie jest `:id`. Próba odczytania `req.params.search` przy trasie `/api/users` (bez parametru w ścieżce) zawsze da `undefined`.

**Zła kolejność middleware.** Middleware wykonują się w kolejności, w jakiej zostały zarejestrowane przez `app.use()`/`app.get()` itd. Jeśli `checkAuth` zostanie podpięte po trasie, którą miało chronić, nie zadziała - trasa obsłuży żądanie, zanim middleware zdąży je sprawdzić.

**Brak walidacji przed użyciem danych.** Próba odczytania właściwości z `req.body`, które w ogóle nie zostało przesłane, nie rzuca od razu błędu (da `undefined`), ale prowadzi do zapisania niepełnych, błędnych danych - stąd warto sprawdzać dane wejściowe, zanim trafią dalej.

## Co trzeba zapamiętać

```text
req.params
→ fragmenty samej ścieżki, zdefiniowane w trasie przez :nazwa
  (zawsze string, trzeba samodzielnie zamienić np. na Number)

req.query
→ parametry po znaku ? w adresie URL

express.Router()
→ tworzy zestaw tras, który można wydzielić do osobnego pliku

app.use(ścieżkaBazowa, router)
→ podpina router pod główną aplikację

middleware (req, res, next) => {}
→ funkcja pośrednicząca; next() przekazuje obsługę dalej

middleware podpięte pod konkretną trasę
→ app.get(ścieżka, middleware, handler)

walidacja danych wejściowych
→ sprawdzenie req.body przed użyciem go w logice trasy;
  przy błędzie odpowiedź z kodem 400
```

Pełną architekturę projektu opartą o routery, kontrolery i modele (foldery `routes`, `controllers`, `models`) oraz projektowanie REST API poznasz w dalszych tematach.

## Ćwiczenia

1. Dodaj do istniejącego API produktów trasę `GET /api/products/:id`, zwracającą jeden produkt na podstawie identyfikatora z adresu, albo kod `404`, jeśli produkt nie istnieje.
2. Wydziel trasy dotyczące produktów do osobnego pliku `routes/products.js` z użyciem `express.Router()` i podepnij go w głównym pliku pod ścieżką `/api/products`.
3. Napisz middleware `validateProduct`, które sprawdza, czy `req.body` zawiera pola `name` i `price`, i zwraca kod `400`, jeśli któregoś brakuje. Podepnij je pod trasę `POST /api/products`.
4. Napisz middleware `checkAuth` sprawdzające obecność nagłówka `Authorization`, i podepnij je tylko pod trasę usuwającą produkt (`DELETE /api/products/:id`).
5. Dodaj trasę `GET /api/products/:id/reviews/:reviewId` i wypisz w odpowiedzi oba parametry z adresu.
