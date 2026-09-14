# Wprowadzenie do Express.js - pierwszy serwer aplikacyjny

Krótko: Express to biblioteka (framework), która upraszcza pisanie serwerów HTTP w Node.js. To, co w pliku `3-http-serwer.md` robiliśmy ręcznie - sprawdzanie ścieżki i metody, zbieranie danych z żądania kawałek po kawałku, ustawianie nagłówków - Express załatwia w kilku liniach kodu.

**Framework** (w odróżnieniu od zwykłej biblioteki) to nie tylko zestaw gotowych funkcji do wywołania, ale też narzucona struktura, według której organizuje się cały program - w Expressie tą strukturą są trasy (`app.get`, `app.post`, ...) i middleware, o których za chwilę. Express instaluje się tak samo jak każdą inną paczkę npm - `require("express")` w kodzie zadziała dopiero po `npm install express` w katalogu projektu.

## 1. Po co Express, skoro jest moduł http?

W poprzednim pliku widziałeś, jak wygląda ręczny routing:

```javascript
if (req.url === "/" && req.method === "GET") {
    // ...
}

if (req.url === "/about" && req.method === "GET") {
    // ...
}
```

Przy kilku ścieżkach to jeszcze da się znieść. Przy kilkudziesięciu - kod zamienia się w nieczytelny ciąg warunków `if`. Do tego dochodzi ręczne zbieranie danych POST kawałek po kawałku i ręczne ustawianie nagłówków przy każdej odpowiedzi.

Express rozwiązuje te problemy, dając gotowe narzędzia do:

* definiowania tras (routing) bez pisania warunków `if`,
* automatycznego parsowania danych z żądania (JSON, dane z formularzy),
* organizowania kodu w czytelną, powtarzalną strukturę.

Express nie zastępuje modułu `http` - działa na nim, tylko chowa przed nami większość szczegółów niskopoziomowych.

## 2. Instalacja

Express instaluje się jak każdą inną bibliotekę, poleceniem npm, w katalogu projektu z istniejącym `package.json`:

```bash
npm install express
```

Po instalacji w `package.json` pojawia się nowa zależność:

```json
"dependencies": {
    "express": "^5.1.0"
}
```

## 3. Pierwszy serwer Express

```javascript
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Witaj na serwerze!");
});

app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

`express()` tworzy aplikację - obiekt `app`, na którym definiujemy wszystkie trasy i który na końcu uruchamiamy metodą `app.listen()`, tak samo jak `server.listen()` w module `http`. `app.get("/", ...)` mówi: dla żądania `GET` na ścieżkę `/` wykonaj tę funkcję. `res.send("Witaj na serwerze!")` odsyła odpowiedź - Express sam ustawia odpowiedni kod statusu (`200`) i nagłówek `Content-Type`, w zależności od tego, co mu przekażemy.

Warto porównać to z odpowiednikiem w czystym `http`:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Witaj na serwerze!");
        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Nie znaleziono strony");
});

server.listen(3000);
```

Ten sam efekt, znacznie mniej kodu - i bez ręcznego sprawdzania `req.url`/`req.method`, bez `return`, bez domyślnej obsługi 404 (Express sam odpowie kodem `404`, jeśli żadna trasa nie pasuje).

## 4. Definiowanie tras dla GET i POST

Trasę definiuje się metodą Express odpowiadającą metodzie HTTP - `app.get()` dla `GET`, `app.post()` dla `POST`:

```javascript
const express = require("express");

const app = express();

const users = [
    { id: 1, name: "Jan" },
    { id: 2, name: "Anna" }
];

app.get("/", (req, res) => {
    res.send("Strona główna");
});

app.get("/api/users", (req, res) => {
    res.json(users);
});

app.post("/api/users", (req, res) => {
    res.status(201).json({ message: "Użytkownik utworzony" });
});

app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

`res.json(users)` robi za nas dokładnie to, co w poprzednim pliku robiliśmy ręcznie - `JSON.stringify()` i ustawienie nagłówka `Content-Type: application/json`. `res.status(201).json(...)` ustawia kod statusu (tu `201`, bo powstał nowy zasób) i od razu zwraca dane jako JSON. Każda z tych funkcji (`res.send`, `res.json`, `res.status`) zwraca obiekt `res`, dzięki czemu można je łączyć w łańcuch (`res.status(201).json(...)`).

Nie widać tu żadnych warunków `if` sprawdzających `req.url` - Express sam dopasowuje żądanie do odpowiedniej trasy na podstawie ścieżki i metody podanej w `app.get()`/`app.post()`.

## 5. req.body - odczyt danych z żądania

Przy `POST` klient wysyła dane w treści żądania (body). W czystym `http` trzeba było ręcznie zbierać te dane zdarzeniami `"data"` i `"end"`. W Express wystarczy dane odczytać z `req.body` - pod warunkiem że włączymy odpowiednie middleware.

```javascript
const express = require("express");

const app = express();

app.use(express.json());

app.post("/api/users", (req, res) => {
    const newUser = req.body;
    console.log("Otrzymano:", newUser);

    res.status(201).json({ message: "Użytkownik utworzony", user: newUser });
});

app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

`express.json()` to wbudowane **middleware** - funkcja pośrednicząca w obsłudze żądania. Middleware wykonuje się jeszcze zanim żądanie trafi do właściwej trasy (`app.post`), i w tym wypadku ma jedno zadanie: odczytać treść żądania, sprawdzić czy to poprawny JSON, i jeśli tak - zamienić go na zwykły obiekt JavaScript dostępny potem jako `req.body`. `app.use(express.json())` włącza to middleware dla całej aplikacji, dla każdego żądania.

Bez tej linijki `req.body` jest `undefined`, niezależnie od tego, co klient faktycznie wysłał.

## 6. Middleware - podstawy

Middleware to funkcja, która ma dostęp do `req`, `res` i dodatkowo do trzeciego argumentu, zwykle nazywanego `next`. Jej zadaniem jest coś zrobić z żądaniem (odczytać, zmodyfikować, zalogować) i przekazać obsługę dalej, wywołując `next()`.

`express.json()` jest gotowym middleware, ale można napisać też własne. Proste middleware logujące każde żądanie:

```javascript
const express = require("express");

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.send("Strona główna");
});

app.listen(3000);
```

Ta funkcja wykonuje się dla **każdego** żądania, jeszcze zanim trafi ono do `app.get("/")`. Wypisuje metodę i ścieżkę w konsoli, a potem wywołuje `next()` - to przekazanie sterowania dalej, do kolejnego middleware albo do właściwej trasy. Bez `next()` żądanie utknie na tym middleware i klient nigdy nie dostanie odpowiedzi, dokładnie tak samo jak przy braku `res.end()` w czystym `http`.

Na razie to tylko podstawa działania middleware - własne middleware przypięte do konkretnych tras, routery i walidację danych poznasz w kolejnym temacie.

## 7. req.query - parametry z adresu URL

`req.query` daje dostęp do parametrów doklejonych do adresu po znaku `?`:

```javascript
app.get("/api/users", (req, res) => {
    const search = req.query.search;

    if (search) {
        const filtered = users.filter((user) => user.name.includes(search));
        return res.json(filtered);
    }

    res.json(users);
});
```

Żądanie pod adresem `/api/users?search=Jan` sprawi, że `req.query.search` będzie miało wartość `"Jan"`. Jeśli parametr `search` nie zostanie podany w adresie, `req.query.search` będzie `undefined`. Warto zapamiętać: `req.query` służy do parametrów opcjonalnych, doklejanych po `?` (np. wyszukiwanie, filtrowanie, sortowanie) - to nie to samo co `req.params`, który poznasz przy dynamicznych ścieżkach typu `/users/:id` w kolejnym temacie.

## 8. Obsługa formularza HTML

Formularz HTML wysłany metodą `POST` domyślnie trafia do serwera w innym formacie niż JSON - jako `application/x-www-form-urlencoded`. Żeby Express poprawnie zamienił takie dane na `req.body`, potrzebne jest inne middleware niż `express.json()`:

```html
<form action="/contact" method="POST">
    <input type="text" name="email" />
    <input type="text" name="message" />
    <button type="submit">Wyślij</button>
</form>
```

```javascript
const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.post("/contact", (req, res) => {
    const { email, message } = req.body;
    console.log("Wiadomość od:", email, message);

    res.send("Dziękujemy za wiadomość!");
});

app.listen(3000);
```

`express.urlencoded({ extended: true })` to middleware parsujące dane wysłane z klasycznego formularza HTML. `{ extended: true }` pozwala na bardziej złożone struktury danych w formularzu (np. zagnieżdżone obiekty) - w praktyce niemal zawsze ustawia się tę opcję na `true`. `req.body` po zastosowaniu tego middleware zawiera pola formularza jako zwykły obiekt, np. `{ email: "...", message: "..." }` - dzięki destrukturyzacji `const { email, message } = req.body` od razu wyciągamy z niego potrzebne wartości.

Nic nie stoi na przeszkodzie, żeby mieć oba middleware naraz - `express.json()` obsłuży żądania z JSON-em (typowe dla API), a `express.urlencoded()` żądania z klasycznych formularzy HTML.

## 9. Pierwsze proste API w Express

Łącząc powyższe elementy, można zbudować małe, działające API:

```javascript
const express = require("express");

const app = express();

app.use(express.json());

const users = [
    { id: 1, name: "Jan" },
    { id: 2, name: "Anna" }
];

app.get("/api/users", (req, res) => {
    res.json(users);
});

app.post("/api/users", (req, res) => {
    const newUser = req.body;
    users.push(newUser);

    res.status(201).json({ message: "Użytkownik dodany", user: newUser });
});

app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

`GET /api/users` zwraca listę wszystkich użytkowników. `POST /api/users` dodaje nowego użytkownika do tablicy `users` (przechowywanej tylko w pamięci - po restarcie serwera dane znikną, bo nie mamy jeszcze żadnej bazy danych) i odsyła go z powrotem razem z kodem `201`.

## 10. Najczęstsze błędy

**Brak `express.json()`, a próba odczytu `req.body`.** Jeśli middleware nie zostało włączone, `req.body` jest `undefined`, niezależnie od tego, co klient wysłał w żądaniu.

```javascript
app.post("/api/users", (req, res) => {
    console.log(req.body); // undefined, bo brakuje app.use(express.json())
});
```

**Mylenie `req.body`, `req.query` i `req.params`.** `req.body` to dane z treści żądania (JSON, formularz), `req.query` to parametry po `?` w adresie, `req.params` to fragmenty samej ścieżki (`/users/:id`) - o tym ostatnim więcej w kolejnym temacie.

**Brak wywołania `res.send()`/`res.json()`/`res.end()`.** Tak samo jak w czystym `http` - jeśli żadna z tych funkcji się nie wykona, żądanie zawiśnie i klient nigdy nie dostanie odpowiedzi.

**Zapomniany `next()` we własnym middleware.** Jeśli middleware nie wywoła `next()` (i samo nie wyśle odpowiedzi), żądanie utknie na nim na zawsze.

**Wysyłanie odpowiedzi dwa razy.**

```javascript
app.get("/", (req, res) => {
    res.send("Cześć");
    res.send("Jeszcze raz"); // błąd - odpowiedź już została wysłana
});
```

Podobnie jak w module `http`, na jedno żądanie można wysłać tylko jedną odpowiedź.

## Co trzeba zapamiętać

```text
express()
→ tworzy aplikację Express (obiekt app)

app.get(ścieżka, fn) / app.post(ścieżka, fn)
→ definiują trasę dla danej metody HTTP i ścieżki

res.send() / res.json() / res.status()
→ wysyłają odpowiedź (tekst, JSON, kod statusu)

app.use(middleware)
→ włącza middleware dla całej aplikacji

express.json()
→ middleware parsujące JSON z treści żądania do req.body

express.urlencoded({ extended: true })
→ middleware parsujące dane z formularza HTML do req.body

req.body
→ dane wysłane w treści żądania (POST)

req.query
→ parametry z adresu URL po znaku ?

next()
→ przekazuje obsługę żądania do kolejnego middleware/trasy
```

Zaawansowany routing (`req.params`, `express.Router`, własne middleware przypięte do konkretnych tras, walidacja danych) to temat kolejnego pliku.

## Ćwiczenia

1. Zainstaluj Express w nowym projekcie i napisz serwer z jedną trasą `GET /`, zwracającą prosty tekst powitalny.
2. Dodaj trasę `GET /api/products`, zwracającą tablicę kilku produktów jako JSON.
3. Dodaj trasę `POST /api/products`, która odbiera nowy produkt z `req.body` (pamiętaj o `express.json()`) i dodaje go do tablicy, odsyłając odpowiedź z kodem `201`.
4. Dodaj do `GET /api/products` obsługę parametru `req.query.category`, który filtruje produkty po kategorii, jeśli parametr został podany w adresie.
5. Napisz własne middleware logujące w konsoli metodę i ścieżkę każdego żądania, i podłącz je do aplikacji przez `app.use()`.
