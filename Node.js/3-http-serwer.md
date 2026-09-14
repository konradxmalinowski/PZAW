# Protokół HTTP i tworzenie serwera w Node.js bez Express

Krótko: jak wygląda żądanie i odpowiedź HTTP w praktyce oraz jak zbudować serwer obsługujący kilka ścieżek, metody GET/POST i odpowiedzi JSON, korzystając wyłącznie z wbudowanego modułu `http`.

W pliku `1-podstawy.md` pojawił się już najprostszy możliwy serwer - jedna ścieżka, jedna odpowiedź tekstowa. Tutaj ten temat rozwijamy: routing, metody HTTP, kody statusu, JSON i obsługa błędów.

## 1. Jak wygląda komunikacja HTTP?

Klient (np. przeglądarka) wysyła do serwera **żądanie** (request), a serwer odsyła **odpowiedź** (response):

```text
Klient
   |
   |  żądanie: GET /api/users
   ↓
Serwer
   |
   |  odpowiedź: 200 OK + dane
   ↓
Klient
```

Żądanie HTTP zawiera m.in.:

* **metodę** - co klient chce zrobić (`GET`, `POST`, `PUT`, `DELETE`...),
* **ścieżkę** (URL) - do jakiego zasobu się odwołuje, np. `/api/users`,
* **nagłówki** (headers) - dodatkowe informacje, np. jakiego formatu danych klient oczekuje,
* opcjonalnie **treść** (body) - dane wysyłane przez klienta, np. formularz albo JSON.

Odpowiedź HTTP zawiera:

* **kod statusu** - liczbę informującą, jak zakończyła się obsługa żądania (np. `200`, `404`),
* **nagłówki** - np. jakiego typu dane są zwracane,
* **treść** - właściwe dane odpowiedzi.

## 2. Metody HTTP

Najczęściej spotykane metody:

```text
GET     - pobranie danych (nie powinien zmieniać stanu serwera)
POST    - wysłanie nowych danych (np. utworzenie nowego rekordu)
PUT     - aktualizacja istniejącego zasobu
DELETE  - usunięcie zasobu
```

Na poziomie tego kursu najważniejsze są `GET` i `POST` - resztę (`PUT`, `DELETE`) poznasz szerzej przy REST API. W surowym Node.js metodę żądania odczytujemy z `req.method`.

## 3. Kody statusu

Kod statusu to trzycyfrowa liczba, którą serwer zwraca razem z odpowiedzią:

```text
2xx - sukces           (200 OK, 201 Created)
3xx - przekierowanie   (301, 302)
4xx - błąd po stronie klienta  (400 Bad Request, 404 Not Found)
5xx - błąd po stronie serwera  (500 Internal Server Error)
```

Kilka, które warto znać na pamięć:

```text
200 - żądanie obsłużone poprawnie
201 - zasób został utworzony (typowe po POST)
400 - klient wysłał nieprawidłowe dane
404 - nie znaleziono zasobu pod podaną ścieżką
500 - błąd po stronie serwera (np. wyjątek w kodzie)
```

Kod statusu nie jest tylko formalnością - to on mówi klientowi (albo aplikacji frontendowej), czy żądanie się udało, i jeśli nie, to mniej więcej dlaczego.

## 4. Najprostszy serwer - przypomnienie

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Witaj na serwerze!");
});

server.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

`http.createServer()` przyjmuje funkcję, która wykonuje się przy **każdym** przychodzącym żądaniu - niezależnie od ścieżki i metody. `req` to obiekt żądania (co przyszło od klienta), `res` to obiekt odpowiedzi (co odsyłamy). `res.writeHead()` ustawia kod statusu i nagłówki, a `res.end()` kończy odpowiedź - bez wywołania `res.end()` klient będzie czekał w nieskończoność.

Żeby zobaczyć taki serwer w akcji, uruchamiasz plik poleceniem `node nazwa-pliku.js`, a potem w przeglądarce otwierasz `http://localhost:3000` (co dokładnie oznacza `localhost` i port, opisane jest w `1-podstawy.md`, sekcja 17). Serwer działa cały czas, dopóki nie zatrzymasz go w terminalu (`Ctrl+C`) - to nie jest skrypt, który się kończy, tylko program czekający na kolejne żądania.

## 5. Obsługa kilku ścieżek - ręczny routing

Skoro funkcja obsługi wykonuje się dla każdego żądania, to wewnątrz niej musimy sami sprawdzić, o jaką ścieżkę i metodę chodzi. Do tego służy `req.url` (ścieżka) i `req.method` (metoda):

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Strona główna");
        return;
    }

    if (req.url === "/about" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("O nas");
        return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Nie znaleziono strony");
});

server.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

To jest **ręczny routing** - sami, warunkami `if`, decydujemy, co zrobić z danym żądaniem. `return` po każdej obsłużonej ścieżce jest konieczne - bez niego kod poleciałby dalej i próbował wykonać `res.end()` po raz drugi, co skończy się błędem. Ostatni blok (bez żadnego `if`) to obsługa wszystkich ścieżek, które nie pasują do żadnej znanej - stąd kod `404`.

Konkretną parę "ścieżka + metoda" (np. `GET /about`) często nazywa się **endpointem** - to jeden punkt wejścia do serwera, pod którym dzieje się coś konkretnego. Serwer z tego przykładu ma dwa endpointy: `GET /` i `GET /about`.

Widać już tutaj główny problem tego podejścia: przy kilkunastu ścieżkach kod zamienia się w długi ciąg `if`-ów. To jeden z powodów, dla których w praktyce korzysta się z frameworków takich jak Express (kolejny temat) - ale zrozumienie, co dzieje się "pod spodem", bardzo ułatwia późniejszą naukę Expressa.

## 6. Zwracanie danych w formacie JSON

Backend najczęściej komunikuje się z frontendem (albo inną aplikacją) w formacie JSON, nie zwykłym tekstem. Zwykły obiekt JavaScript trzeba zamienić na tekst JSON funkcją `JSON.stringify()`:

```javascript
const http = require("http");

const users = [
    { id: 1, name: "Jan" },
    { id: 2, name: "Anna" }
];

const server = http.createServer((req, res) => {
    if (req.url === "/api/users" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Nie znaleziono zasobu" }));
});

server.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

Nagłówek `"Content-Type": "application/json"` informuje klienta, że treść odpowiedzi to JSON, a nie zwykły tekst czy HTML - dzięki temu np. przeglądarka albo biblioteka HTTP po stronie klienta wie, jak zinterpretować odebrane dane. `JSON.stringify(users)` zamienia tablicę obiektów JavaScript na tekst w formacie JSON, bo `res.end()` przyjmuje wyłącznie tekst (albo dane binarne) - nigdy gotowego obiektu.

## 7. Odbieranie danych wysłanych przez klienta (POST)

Przy żądaniu `GET` dane najczęściej przekazuje się w samym adresie URL. Przy `POST` dane trafiają do treści żądania (body), a Node.js dostarcza je stopniowo, kawałkami - `req` jest strumieniem (patrz `2-moduly-fs-path.md`, sekcja o strumieniach). Trzeba więc "zebrać" te kawałki, zanim będziemy mieli komplet danych:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
    if (req.url === "/api/users" && req.method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            const newUser = JSON.parse(body);
            console.log("Otrzymano:", newUser);

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Użytkownik utworzony", user: newUser }));
        });

        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Nie znaleziono zasobu" }));
});

server.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

Zdarzenie `"data"` wywołuje się za każdym razem, gdy przyjdzie kolejny fragment danych (`chunk`) - doklejamy go do zmiennej `body`. Zdarzenie `"end"` wywołuje się, gdy cała treść żądania dotarła - dopiero wtedy `body` zawiera komplet danych i można je bezpiecznie zamienić z tekstu JSON na obiekt JavaScript funkcją `JSON.parse()`. Kod `201` (zamiast `200`) sygnalizuje, że w wyniku żądania powstał nowy zasób.

To dość niewygodny sposób odbierania danych - Express (kolejny temat) załatwia to jedną linijką middleware.

## 8. Podstawowa obsługa błędów

`JSON.parse()` rzuci wyjątkiem, jeśli klient wyśle tekst, który nie jest poprawnym JSON-em. Bez obsługi takiego błędu serwer się wywali (albo zawiśnie to konkretne żądanie bez żadnej odpowiedzi):

```javascript
req.on("end", () => {
    try {
        const newUser = JSON.parse(body);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Użytkownik utworzony", user: newUser }));
    } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Nieprawidłowy format danych" }));
    }
});
```

`try/catch` przechwytuje błąd parsowania. Zamiast pozwolić programowi się wywalić, odsyłamy klientowi zrozumiałą odpowiedź z kodem `400` - to klient przesłał złe dane, więc kod błędu zaczyna się od `4`, nie od `5`.

## 9. Najczęstsze błędy

**Brak `res.end()`.** Bez tego wywołania żądanie nigdy się nie kończy - klient (albo przeglądarka) będzie czekał w nieskończoność na odpowiedź.

**Brak `return` po obsłużeniu ścieżki w ręcznym routingu.**

```javascript
if (req.url === "/") {
    res.end("Strona główna");
}

if (req.url === "/about") {
    // ...
}
```

Bez `return` kod wykonuje się dalej i sprawdza kolejne warunki, nawet jeśli poprzedni już obsłużył żądanie i wysłał odpowiedź - może to skończyć się próbą wywołania `res.end()` drugi raz i błędem.

**Zapomniany nagłówek `Content-Type` przy JSON-ie.** Bez `"Content-Type": "application/json"` odpowiedź technicznie dotrze, ale klient może nie zinterpretować jej poprawnie jako JSON.

**`JSON.stringify()` zapomniane przy zwracaniu obiektu.**

```javascript
res.end(users); // błąd - res.end() nie przyjmuje obiektu
```

`res.end()` przyjmuje tekst albo dane binarne, nigdy gotowy obiekt JavaScript - trzeba go najpierw zamienić funkcją `JSON.stringify()`.

**Brak obsługi nieznanej ścieżki.** Jeśli żaden `if` nie pasuje i nie ma na końcu domyślnej odpowiedzi z kodem `404`, żądanie zawiśnie tak samo jak przy braku `res.end()`.

## Co trzeba zapamiętać

```text
req
→ obiekt żądania: req.url, req.method, dane wysyłane w treści (dla POST)

res
→ obiekt odpowiedzi: res.writeHead(kod, nagłówki), res.end(treść)

Kod statusu
→ 200 sukces, 201 utworzono, 400 błąd klienta, 404 nie znaleziono, 500 błąd serwera

Content-Type
→ nagłówek informujący, jakiego formatu są zwracane dane (text/plain, application/json)

JSON.stringify()
→ zamienia obiekt/tablicę JavaScript na tekst JSON (do wysłania w odpowiedzi)

JSON.parse()
→ zamienia tekst JSON na obiekt/tablicę JavaScript (przy odbiorze danych)

Ręczny routing
→ warunki if sprawdzające req.url i req.method - działa, ale szybko robi się nieczytelny
```

Ręczne sprawdzanie ścieżek i zbieranie danych z żądania kawałek po kawałku to dokładnie te rzeczy, które w praktyce upraszcza framework Express - to temat kolejnego pliku.

## Ćwiczenia

1. Napisz serwer HTTP z trzema ścieżkami: `GET /`, `GET /api/products` (zwraca tablicę produktów jako JSON) oraz domyślną obsługą 404 dla pozostałych ścieżek.
2. Rozbuduj serwer z zadania 1. o `POST /api/products`, który odbiera JSON z nowym produktem, wypisuje go w konsoli i odsyła odpowiedź z kodem `201`.
3. Dodaj do endpointu z zadania 2. obsługę błędu w `try/catch` - jeśli klient wyśle niepoprawny JSON, serwer powinien odpowiedzieć kodem `400` zamiast się wywalić.
4. Sprawdź w przeglądarce, co się stanie, gdy wejdziesz na ścieżkę, której serwer nie obsługuje - jaki kod statusu i jaką treść dostajesz.
