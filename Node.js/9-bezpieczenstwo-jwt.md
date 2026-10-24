# Bezpieczeństwo w aplikacjach webowych - hasła, JWT, sesje i ciasteczka

Krótko: w poprzednim pliku (`8-rest-api-crud-upload.md`) zbudowałeś pełne REST API z warstwami routes/controllers/models. Ten plik dokłada do tej samej architektury rejestrację, logowanie i autoryzację - czyli sposób na to, żeby aplikacja wiedziała, kto jest zalogowany, i mogła chronić wybrane endpointy przed niepowołanym dostępem.

## 1. Dlaczego nie przechowujemy haseł jako czysty tekst

Gdyby tabela `users` trzymała hasło w kolumnie `password` w takiej postaci, w jakiej użytkownik je wpisał, każdy, kto uzyska dostęp do bazy danych - włamywacz, ale też np. nieuczciwy administrator - od razu widziałby prawdziwe hasła wszystkich użytkowników. Ponieważ ludzie notorycznie używają tego samego hasła w wielu serwisach, wyciek jednej bazy oznaczałby przejęcie kont także gdzie indziej.

Dlatego hasła nigdy nie trafiają do bazy w oryginalnej postaci. Zamiast tego zapisuje się ich **hash** - wynik jednokierunkowej funkcji, z której nie da się odtworzyć oryginalnego hasła, ale którą można łatwo sprawdzić ("czy ten tekst po zahashowaniu da dokładnie taki wynik").

## 2. Hashowanie hasła - bcrypt

Do hashowania haseł w Node.js standardowo używa się biblioteki `bcrypt`.

```bash
npm install bcrypt
```

Hashowanie hasła przy rejestracji:

```javascript
const bcrypt = require("bcrypt");

async function hashPassword(plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    return hashedPassword;
}
```

Drugi argument `bcrypt.hash` (tu `10`) to liczba rund haszowania (tzw. *salt rounds*) - im wyższa, tym dłużej trwa liczenie hasha i tym trudniej go złamać **atakiem brute force** (czyli sprawdzeniem po kolei milionów możliwych haseł, aż któreś zadziała - im wolniej liczy się jeden hash, tym dłużej trwałoby sprawdzenie ich wszystkich). `10` to rozsądna wartość domyślna. Do tej liczby rund bcrypt automatycznie dolicza też losową wartość zwaną **salt** - dzięki niej dwa identyczne hasła dwóch różnych użytkowników dają w bazie dwa różne hashe, więc nie da się po prostu porównać kolumny `password` między wierszami, żeby znaleźć osoby z tym samym hasłem.

Weryfikacja hasła przy logowaniu wygląda inaczej - nie da się "odhashować" zapisanej wartości, więc porównuje się hasło podane przez użytkownika z zapisanym hashem funkcją `bcrypt.compare`:

```javascript
const isCorrect = await bcrypt.compare(plainPassword, hashedPasswordFromDb);
// true albo false
```

## 3. Endpoint rejestracji

Kontroler rejestracji hashuje hasło przed zapisaniem użytkownika w bazie:

```javascript
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Wymagane pola: name, email, password" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.createUser(name, email, hashedPassword);

        res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}
```

Odpowiedź celowo nie zawiera hasła ani jego hasha - klient nie potrzebuje tej informacji, a zwracanie jej w API to niepotrzebne ryzyko.

## 4. Endpoint logowania

Logowanie pobiera użytkownika po adresie e-mail i porównuje podane hasło z zapisanym hashem:

```javascript
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Nieprawidłowy e-mail lub hasło" });
        }

        const isCorrect = await bcrypt.compare(password, user.password);

        if (!isCorrect) {
            return res.status(401).json({ message: "Nieprawidłowy e-mail lub hasło" });
        }

        // tutaj wygenerujemy token - patrz sekcja 6
        res.json({ message: "Zalogowano" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}
```

Zwróć uwagę, że komunikat błędu jest identyczny niezależnie od tego, czy nie istnieje użytkownik o takim e-mailu, czy istnieje, ale hasło jest złe. Gdyby komunikaty się różniły ("nie ma takiego użytkownika" / "złe hasło"), ktoś mógłby w ten sposób sprawdzać, jakie adresy e-mail są zarejestrowane w systemie.

## 5. Czym jest JWT

**JWT** (*JSON Web Token*) to token - ciąg znaków - który serwer wystawia użytkownikowi po udanym logowaniu i który działa jak podpisany dowód tożsamości. Klient dołącza go do kolejnych żądań, a serwer na jego podstawie wie, kto wysyła żądanie, bez konieczności ponownego sprawdzania hasła.

Token JWT składa się z trzech części oddzielonych kropkami:

```text
nagłówek.dane.podpis
```

* **nagłówek** - informacja o algorytmie podpisu,
* **dane** (*payload*) - to, co token przenosi, np. `{ id: 5, email: "jan@example.com" }`,
* **podpis** - wygenerowany na podstawie nagłówka, danych i tajnego klucza znanego tylko serwerowi.

Kluczowa cecha: dane w tokenie są tylko **zakodowane**, a nie zaszyfrowane - każdy, kto ma token, może je odczytać (np. na stronie jwt.io). Nie wolno więc trzymać w tokenie haseł ani innych wrażliwych danych. Ochronę daje dopiero podpis - dzięki niemu serwer wie, że token nie został zmieniony po drodze. Jeśli ktoś podmieni dane w tokenie bez znajomości tajnego klucza, podpis przestanie się zgadzać i serwer odrzuci taki token.

## 6. Generowanie tokenu - jsonwebtoken

```bash
npm install jsonwebtoken
```

Generowanie tokenu po udanym logowaniu:

```javascript
const jwt = require("jsonwebtoken");

const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);
```

`jwt.sign` przyjmuje dane, które mają trafić do tokenu, tajny klucz oraz opcje - tutaj czas wygaśnięcia tokenu (`expiresIn`). Tajny klucz (`process.env.JWT_SECRET`) trzymamy w zmiennej środowiskowej, dokładnie tak jak numer portu w pliku `1-podstawy.md` - nigdy nie wpisujemy go na stałe w kodzie, bo kod (i sekret razem z nim) łatwo trafia do repozytorium Git.

Pełny kontroler logowania z wystawieniem tokenu:

```javascript
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.getUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Nieprawidłowy e-mail lub hasło" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
}
```

## 7. Middleware autoryzacji - ochrona tras

Sam wygenerowany token na nic się nie przyda, jeśli żaden endpoint go nie sprawdza. Middleware autoryzacyjny działa dokładnie tak samo jak middleware poznane w pliku `5-express-routing-middleware.md` - funkcja `(req, res, next)`, którą podpina się przed właściwą funkcją kontrolera:

```javascript
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Brak tokenu" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Nieprawidłowy lub wygasły token" });
    }
}

module.exports = requireAuth;
```

`jwt.verify` sprawdza podpis tokenu tym samym tajnym kluczem, którym został podpisany. Jeśli token został sfałszowany albo minął jego czas ważności, `jwt.verify` rzuca błędem - stąd `try/catch`. Jeśli token jest poprawny, dane z niego trafiają do `req.user`, żeby kolejne funkcje (kontroler) wiedziały, kto wysyła żądanie.

Podpięcie middleware do konkretnej trasy:

```javascript
const requireAuth = require("../middleware/requireAuth");

router.get("/profile", requireAuth, usersController.getProfile);
```

Żądanie do `/profile` bez poprawnego tokenu nigdy nie dotrze do `getProfile` - middleware zatrzyma je wcześniej, zwracając `401`.

## 8. Jak token trafia od klienta do serwera

Token trzeba jakoś przekazać z powrotem do serwera przy każdym kolejnym żądaniu. Są dwa typowe podejścia.

**Nagłówek Authorization.** Klient (np. aplikacja frontendowa) sam dokłada token do każdego żądania:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Frontend najczęściej trzyma wtedy token np. w pamięci aplikacji i sam odpowiada za dołączanie go do żądań. To podejście dobrze pasuje do aplikacji typu SPA (jak React, poznawany w dalszej części kursu) rozmawiającej z API przez `fetch`.

**Ciasteczko (cookie).** Serwer może zamiast zwracać token w odpowiedzi JSON, zapisać go od razu w ciasteczku przeglądarki:

```javascript
res.cookie("token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1 godzina w milisekundach
});
```

Do odczytu ciasteczek z przychodzących żądań potrzebny jest pakiet `cookie-parser`:

```bash
npm install cookie-parser
```

```javascript
const cookieParser = require("cookie-parser");
app.use(cookieParser());
```

Przy tym podejściu przeglądarka sama dołącza ciasteczko do każdego żądania do tej samej domeny - frontend nie musi ręcznie zarządzać tokenem. Opcja `httpOnly: true` sprawia, że ciasteczko jest niedostępne z poziomu JavaScriptu działającego w przeglądarce (np. `document.cookie` go nie zobaczy) - to ważne zabezpieczenie przed wykradzeniem tokenu przez złośliwy skrypt.

Które podejście wybrać, zależy od architektury aplikacji - obie metody przenoszą dokładnie ten sam token, różnią się tylko sposobem transportu.

## 9. Sesje jako alternatywa dla JWT

**Sesja** to inne podejście do tego samego problemu - "jak rozpoznać zalogowanego użytkownika przy kolejnych żądaniach". Zamiast wystawiać podpisany token, serwer po zalogowaniu zapamiętuje dane użytkownika u siebie (np. w pamięci albo w bazie danych) pod losowym identyfikatorem, a klientowi wysyła tylko ten identyfikator w ciasteczku.

```bash
npm install express-session
```

```javascript
const session = require("express-session");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
```

`secret` działa podobnie jak `JWT_SECRET` - to tajny klucz, którym serwer podpisuje identyfikator sesji zapisywany w ciasteczku, żeby nikt z zewnątrz nie mógł go podrobić. `resave: false` mówi bibliotece, żeby nie zapisywała sesji ponownie, jeśli nic się w niej nie zmieniło, a `saveUninitialized: false` - żeby nie tworzyła sesji dla użytkowników, którzy jeszcze nic w niej nie zapisali (np. samo wejście na stronę bez logowania). Obie opcje w praktyce po prostu ograniczają liczbę niepotrzebnych zapisów.

Po zalogowaniu zapisuje się dane w sesji:

```javascript
req.session.userId = user.id;
```

a przy kolejnych żądaniach `req.session.userId` jest dostępne automatycznie, dopóki sesja nie wygaśnie albo użytkownik się nie wyloguje (`req.session.destroy()`).

Podstawowa różnica względem JWT:

| | Sesja | JWT |
|---|---|---|
| gdzie trzymany jest stan | po stronie serwera | w samym tokenie, po stronie klienta |
| co ma klient | tylko identyfikator sesji | pełne dane + podpis |
| wylogowanie | proste - usunięcie sesji na serwerze | trudniejsze - token jest ważny do wygaśnięcia, chyba że dodamy dodatkowy mechanizm |
| skalowanie na wiele serwerów | wymaga wspólnego magazynu sesji | działa od razu, bo token wystarczy sam sobie |

Nie ma jednego uniwersalnie "lepszego" rozwiązania - to dwa różne modele, oba wciąż spotykane w prawdziwych projektach.

## 10. Najczęstsze błędy

**Przechowywanie hasła jawnym tekstem albo własnoręcznie napisanym "szyfrowaniem".** Zawsze `bcrypt.hash`, nigdy nic innego - to sprawdzona, standardowa biblioteka, nie ma powodu wymyślać własnego rozwiązania.

**Sekret JWT wpisany na stałe w kodzie.** `jwt.sign(payload, "mojTajnyKlucz123")` trafia razem z kodem do repozytorium Git - każdy, kto ma dostęp do kodu, może podpisywać dowolne tokeny. Sekret zawsze w zmiennej środowiskowej.

**Zwracanie hasła (albo jego hasha) w odpowiedzi API.** Nawet zahashowane hasło nie powinno pojawiać się w JSON-ie zwracanym do klienta - to niepotrzebna ekspozycja danych.

**Brak `httpOnly` przy tokenie w ciasteczku.** Bez tej opcji token jest czytelny dla JavaScriptu na stronie, co ułatwia jego kradzież przy ataku typu **XSS** (*Cross-Site Scripting*) - czyli sytuacji, w której na stronie udaje się uruchomić obcy, złośliwy kod JavaScript, np. wklejony przez atakującego w pole formularza, które strona wyświetla innym użytkownikom bez odpowiedniego zabezpieczenia. Taki kod, gdyby token był dostępny przez `document.cookie`, mógłby go po prostu odczytać i wysłać na serwer atakującego.

**Brak obsługi błędu przy `jwt.verify`.** Wygasły albo sfałszowany token rzuca wyjątkiem - middleware bez `try/catch` wywali cały serwer zamiast zwrócić `401`.

**Ten sam komunikat błędu, ale różne kody statusu w różnych miejscach logowania.** Warto trzymać się jednego kodu (`401 Unauthorized`) dla wszystkich przypadków nieudanego logowania i braku/błędnego tokenu.

## Co trzeba zapamiętać

```text
bcrypt.hash
→ hashowanie hasła przed zapisem do bazy

bcrypt.compare
→ porównanie hasła z logowania z zapisanym hashem

JWT
→ podpisany token: nagłówek.dane.podpis
→ dane w tokenie są czytelne, podpis chroni przed modyfikacją

jwt.sign
→ wystawienie tokenu po udanym logowaniu

jwt.verify
→ sprawdzenie podpisu tokenu w middleware autoryzacyjnym

process.env.JWT_SECRET
→ tajny klucz do podpisywania - zawsze w zmiennej środowiskowej

httpOnly
→ ciasteczko niedostępne z JavaScriptu w przeglądarce

sesja (express-session)
→ stan zalogowania trzymany po stronie serwera, klient ma tylko identyfikator
```

## Ćwiczenia

1. Dodaj do istniejącego API użytkowników (z pliku `8-rest-api-crud-upload.md`) endpointy `POST /api/auth/register` i `POST /api/auth/login`, korzystając z `bcrypt`.
2. Po udanym logowaniu wystaw token JWT zawierający `id` i `email` użytkownika, ważny przez 2 godziny.
3. Napisz middleware `requireAuth` i zabezpiecz nim endpoint `GET /api/users/:id`, tak żeby dostęp miał tylko zalogowany użytkownik.
4. Zmodyfikuj logowanie tak, żeby zamiast zwracać token w odpowiedzi JSON, zapisywało go w ciasteczku z opcją `httpOnly`.
5. Napisz jednym zdaniem, jaka jest różnica między `401 Unauthorized` a `403 Forbidden` w kontekście tego middleware (podpowiedź: brak tokenu vs poprawny token, ale za mało uprawnień).
