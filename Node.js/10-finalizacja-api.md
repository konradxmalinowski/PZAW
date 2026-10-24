# Finalizacja backendowego API - obsługa błędów, testy, dokumentacja i upload plików

Krótko: w plikach `8-rest-api-crud-upload.md` i `9-bezpieczenstwo-jwt.md` powstało działające REST API z warstwami routes/controllers/models, CRUD-em, uploadem plików i autoryzacją JWT. Ten plik porządkuje to, co już istnieje - scentralizowaną obsługę błędów zamiast powtarzanego try/catch, systematyczne testowanie endpointów, prostą dokumentację API i finalną strukturę projektu. To ostatni plik w serii Node.js/Express - domyka backend przed podpięciem frontendu.

## 1. Problem: obsługa błędów rozsiana po kontrolerach

W plikach 8 i 9 każda funkcja kontrolera wyglądała podobnie:

```javascript
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
```

Ten sam blok `try/catch` z tym samym `res.status(500).json(...)` powtarza się w każdej funkcji kontrolera - w pliku z dziesięcioma endpointami to dziesięć razy ten sam kod. Gorzej, jeśli ktoś kiedyś zmieni format odpowiedzi błędu, musi pamiętać, żeby poprawić to w każdym miejscu osobno.

Express pozwala to rozwiązać jednym, centralnym middleware błędów.

## 2. Middleware błędów w Express

Zwykły middleware ma trzy argumenty: `(req, res, next)`. Middleware błędów ma ich **cztery** - Express rozpoznaje go właśnie po tym, że pierwszym argumentem jest `err`:

```javascript
function errorHandler(err, req, res, next) {
    console.error(err);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || "Błąd serwera" });
}

module.exports = errorHandler;
```

Taki middleware podpina się w `server.js` **na samym końcu**, po wszystkich routerach:

```javascript
const errorHandler = require("./middleware/errorHandler");

app.use("/api/users", usersRouter);
app.use(errorHandler);
```

Express sam wywoła ten middleware, jeśli gdziekolwiek w łańcuchu obsługi żądania zostanie wywołane `next(err)` - albo jeśli funkcja kontrolera oznaczona jako `async` rzuci wyjątkiem, który zostanie przekazany dalej (patrz sekcja 4).

Kontroler po refaktoryzacji, bez własnego `try/catch`:

```javascript
async function getUser(req, res, next) {
    try {
        const user = await userModel.getUserById(req.params.id);

        if (!user) {
            const error = new Error("Nie znaleziono użytkownika");
            error.statusCode = 404;
            return next(error);
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
}
```

`try/catch` w kontrolerze wciąż istnieje - bez niego wyjątek z funkcji `async` w ogóle nie trafi do Expressa - ale zamiast samodzielnie budować odpowiedź, kontroler tylko woła `next(error)` i oddaje decyzję o formacie odpowiedzi do jednego, wspólnego miejsca.

## 3. Własna klasa błędu - AppError

Ręczne dopisywanie `error.statusCode = 404` przy każdym błędzie jest powtarzalne. Wygodniej jest mieć jedną klasę błędu, która od razu przyjmuje kod statusu:

```javascript
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = AppError;
```

To pierwsza klasa (`class`) w tym kursie, więc krótko o składni: `class AppError extends Error` tworzy nowy "szablon" błędu, który dziedziczy po wbudowanej w JavaScript klasie `Error` - czyli automatycznie ma wszystko to, co ma zwykły błąd (np. pole `message`), a dodatkowo własne pole `statusCode`. `constructor` to funkcja wywoływana przy tworzeniu nowego obiektu przez `new AppError(...)`. `super(message)` musi być wywołane jako pierwsze - przekazuje wiadomość błędu do konstruktora klasy `Error`, po którym dziedziczymy. Efekt: `new AppError("Nie znaleziono", 404)` tworzy obiekt, który zachowuje się jak zwykły błąd, ale dodatkowo niesie ze sobą kod statusu HTTP.

Kontroler z użyciem `AppError`:

```javascript
const AppError = require("../utils/AppError");

async function getUser(req, res, next) {
    try {
        const user = await userModel.getUserById(req.params.id);

        if (!user) {
            return next(new AppError("Nie znaleziono użytkownika", 404));
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
}
```

`AppError` dziedziczy po wbudowanej klasie `Error`, więc działa wszędzie tam, gdzie zwykły błąd - `errorHandler` z sekcji 2 obsłuży go bez żadnych zmian, bo wciąż ma pola `message` i `statusCode`.

## 4. Kategorie błędów i kody statusu

Warto trzymać się jednego, spójnego przyporządkowania kodu statusu do typu problemu:

| Sytuacja | Kod statusu | Przykład |
|---|---|---|
| dane od klienta są niepoprawne | 400 Bad Request | brak wymaganego pola w `req.body` |
| brak tokenu / niezalogowany | 401 Unauthorized | brak nagłówka `Authorization` |
| zalogowany, ale bez uprawnień | 403 Forbidden | zwykły użytkownik próbuje usunąć cudze konto |
| zasób o podanym id nie istnieje | 404 Not Found | `GET /api/users/999`, gdy nie ma takiego id |
| coś poszło nie tak po stronie serwera | 500 Internal Server Error | baza danych chwilowo niedostępna |

Rozróżnienie 401 od 403 bywa mylone: 401 znaczy "nie wiem, kim jesteś" (brak tokenu albo token nieprawidłowy - patrz `requireAuth` z pliku `9-bezpieczenstwo-jwt.md`), 403 znaczy "wiem, kim jesteś, ale nie masz do tego prawa" (token poprawny, ale np. rola użytkownika nie pozwala na tę operację).

## 5. Dokumentacja API dla frontendowców

Zanim ktoś zacznie pisać frontend do tego API, potrzebuje wiedzieć, jakie endpointy istnieją, czego oczekują i co zwracają. Nie trzeba do tego żadnego dodatkowego narzędzia - wystarczy plik Markdown w repozytorium, opisujący każdy endpoint w jednym, powtarzalnym formacie:

```markdown
### GET /api/users/:id

Zwraca dane pojedynczego użytkownika.

**Nagłówki:** `Authorization: Bearer <token>`

**Odpowiedź 200:**
```json
{ "id": 5, "name": "Jan Kowalski", "email": "jan@example.com" }
```

**Odpowiedź 404:**
```json
{ "message": "Nie znaleziono użytkownika" }
```
```

Dla endpointów przyjmujących dane dopisuje się jeszcze sekcję **Body żądania**:

```markdown
### POST /api/users

**Body żądania:**
```json
{ "name": "Jan Kowalski", "email": "jan@example.com" }
```

**Odpowiedź 201:**
```json
{ "id": 6, "name": "Jan Kowalski", "email": "jan@example.com" }
```

**Odpowiedź 400:**
```json
{ "message": "Pola name i email są wymagane" }
```
```

Taki dokument dla całego API to po prostu lista takich bloków, jeden pod drugim - metoda, adres, wymagane nagłówki, przykładowe body, przykładowe odpowiedzi sukcesu i błędu. Osoba piszącej frontend w Reactcie nie musi czytać kodu backendu, żeby wiedzieć, jak wywołać dany endpoint.

## 6. Systematyczne testowanie endpointów

W pliku `8-rest-api-crud-upload.md` pojawił się Postman jako narzędzie do ręcznego wysyłania żądań. Przy finalizacji API warto przetestować **wszystkie** endpointy, i to nie tylko w scenariuszu "wszystko poszło dobrze".

Dla każdego endpointu sprawdza się zwykle cztery typy scenariuszy:

```text
1. poprawne dane      → oczekiwany sukces (200/201)
2. brakujące dane      → 400
3. brak autoryzacji    → 401
4. nieistniejący zasób → 404
```

Przykładowo dla `GET /api/users/:id` chronionego przez `requireAuth`:

| Scenariusz | Żądanie | Oczekiwany wynik |
|---|---|---|
| poprawny token, istniejące id | `GET /api/users/5` + `Authorization: Bearer <token>` | 200, dane użytkownika |
| brak nagłówka Authorization | `GET /api/users/5` | 401 |
| nieistniejące id | `GET /api/users/999` + poprawny token | 404 |

W Postmanie zapisuje się takie żądania jako **kolekcję** - jeden folder na zasób, po jednym żądaniu na każdy scenariusz. Dzięki temu po każdej zmianie w kodzie backendu wystarczy odpalić całą kolekcję jeszcze raz, zamiast przypominać sobie ręcznie, co trzeba sprawdzić.

## 7. CORS - dlaczego frontend nie połączy się bez tego

Przeglądarki domyślnie blokują żądania JavaScriptu do innej domeny/portu niż ten, z którego strona została załadowana - to mechanizm bezpieczeństwa zwany **same-origin policy**. Backend Node.js działa np. na `localhost:3000`, a aplikacja Reactowa (poznawana w dalszej części kursu) na `localhost:5173` - z punktu widzenia przeglądarki to dwa różne źródła (*origin*), więc żądanie `fetch` z Reacta do tego API zostanie domyślnie zablokowane.

**CORS** (*Cross-Origin Resource Sharing*) to mechanizm, dzięki któremu serwer może jawnie zezwolić na żądania z innych źródeł. W Expressie włącza się go pakietem `cors`:

```bash
npm install cors
```

```javascript
const cors = require("cors");

app.use(cors());
```

`app.use(cors())` bez żadnych opcji zezwala na żądania z dowolnego źródła - wygodne podczas nauki i developmentu. W prawdziwym projekcie zawęża się to do konkretnego adresu frontendu:

```javascript
app.use(cors({
    origin: "http://localhost:5173"
}));
```

Bez tego middleware każde żądanie z Reacta do tego API - nawet proste `GET` - zakończy się błędem CORS w konsoli przeglądarki, mimo że sam backend działa poprawnie (to samo żądanie z Postmana albo bezpośrednio z adresu w przeglądarce zadziała bez problemu, bo Postman i wpisanie adresu w pasku nie podlegają temu ograniczeniu).

## 8. Finalna struktura projektu

Po wszystkich tematach z serii Node.js/Express, kompletny projekt backendowy wygląda mniej więcej tak:

```text
projekt/
│
├── routes/
│   └── users.js
├── controllers/
│   └── usersController.js
├── models/
│   └── userModel.js
├── middleware/
│   ├── requireAuth.js
│   └── errorHandler.js
├── utils/
│   └── AppError.js
├── uploads/
├── db.js
├── server.js
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

`server.js` spina wszystko w całość:

```javascript
const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log("Serwer działa");
});
```

Kolejność ma znaczenie: `cors()` i `express.json()` muszą być podpięte przed routerami, bo obsługują każde przychodzące żądanie. `errorHandler` musi być podpięty **na końcu**, po wszystkich routerach - Express przekazuje błąd dalej po łańcuchu middleware, więc jeśli obsługa błędów byłaby wcześniej, nigdy by go nie zobaczyła.

Od tego miejsca backend jest gotowy - ma CRUD, autoryzację, spójną obsługę błędów i CORS pozwalający na komunikację z aplikacją frontendową. Kolejne pliki w tym kursie przechodzą do budowy frontendu w Reactcie, który będzie korzystał właśnie z takiego API.

## 9. Najczęstsze błędy

**`errorHandler` podpięty przed routerami zamiast po nich.** Middleware błędów musi być ostatnim `app.use()` w pliku - w przeciwnym razie nigdy nie zostanie wywołany.

**Zapomniane `next(error)` w bloku `catch`.** Jeśli kontroler złapie błąd i nic z nim nie zrobi (albo zapomni wywołać `next`), żądanie po prostu "zawiśnie" - klient nigdy nie dostanie żadnej odpowiedzi.

**CORS włączony zbyt późno albo wcale.** `app.use(cors())` musi być wywołane przed routerami, tak jak `express.json()` - w przeciwnym razie żądania z frontendu i tak zostaną zablokowane przez przeglądarkę.

**Różne kształty odpowiedzi błędu w różnych miejscach.** Jeśli `errorHandler` istnieje, ale część kontrolerów wciąż samodzielnie buduje własne odpowiedzi błędów (jak w plikach 8-9 przed refaktoryzacją), frontend znowu musi obsługiwać kilka różnych formatów.

**Dokumentacja API, która nie jest aktualizowana.** Opis endpointu, który nie zgadza się z tym, co kod faktycznie robi, jest gorszy niż brak dokumentacji - wprowadza w błąd zamiast pomagać.

## Co trzeba zapamiętać

```text
middleware błędów
→ funkcja (err, req, res, next), podpięta na końcu łańcucha middleware

next(error)
→ przekazuje błąd z kontrolera do middleware błędów

AppError
→ własna klasa błędu z polem statusCode, wygodna do rzucania błędów o znanym kodzie

kody statusu
→ 400 złe dane, 401 brak/zły token, 403 brak uprawnień,
  404 nie ma zasobu, 500 błąd serwera

CORS
→ zgoda serwera na żądania z innego źródła (innego portu/domeny)
→ bez tego przeglądarka blokuje żądania z aplikacji frontendowej

dokumentacja API
→ metoda, adres, nagłówki, body żądania, przykładowa odpowiedź sukcesu i błędu

testowanie API
→ dla każdego endpointu: poprawne dane, brakujące dane, brak autoryzacji, nieistniejący zasób
```

## Ćwiczenia

1. Napisz middleware `errorHandler` i klasę `AppError`, a następnie zrefaktoryzuj jeden z kontrolerów z pliku `8-rest-api-crud-upload.md` tak, żeby korzystał z `next(error)` zamiast własnego `try/catch` z ręczną odpowiedzią.
2. Dodaj do `server.js` middleware `cors()` i sprawdź w Postmanie (albo przez prosty `fetch` w konsoli przeglądarki na innej domenie/porcie), że żądanie faktycznie przechodzi.
3. Napisz dokumentację (w Markdown) dla trzech endpointów z istniejącego API - w formacie z sekcji 5, z przykładowym body i odpowiedziami sukcesu oraz błędu.
4. Przetestuj systematycznie jeden wybrany endpoint chroniony przez `requireAuth` - sprawdź wszystkie cztery scenariusze z sekcji 6 i zanotuj otrzymane kody statusu.
5. Zamień jeden przypadek `403 Forbidden` (np. próbę edycji cudzego konta) tak, żeby middleware błędów zwracał go poprawnie przez `next(new AppError(...))`.
