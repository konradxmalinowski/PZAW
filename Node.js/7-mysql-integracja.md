# Integracja Node.js z bazą danych MySQL/MariaDB

Krótko: do tej pory dane w przykładach trzymaliśmy w zwykłej tablicy w pamięci - po restarcie serwera znikały. W realnej aplikacji dane muszą przetrwać restart, dlatego trzymamy je w bazie danych. Ten plik pokazuje, jak połączyć aplikację Node.js z relacyjną bazą MySQL (albo jej odpowiednikiem, MariaDB), tworzyć tabele i wykonywać na nich zapytania.

## 1. Czym jest baza relacyjna w tym kontekście?

**Baza danych** to osobny program (serwer), który na stałe przechowuje dane na dysku i pozwala je odczytywać oraz zmieniać - w odróżnieniu od zwykłej tablicy JavaScript w pamięci, dane w bazie przetrwają restart aplikacji, a nawet restart komputera. MySQL i MariaDB to konkretne, bardzo popularne programy tego typu, nazywane **relacyjnymi bazami danych** - "relacyjna" oznacza, że dane trzymane są w tabelach przypominających arkusz kalkulacyjny: każda tabela ma z góry ustalone kolumny (np. `name`, `email`), a każdy zapisany rekord to jeden **wiersz** tej tabeli. Tabele mogą być ze sobą powiązane relacjami (np. jeden użytkownik ma wiele wpisów) - do tego wracamy w sekcji 7.

Żeby cokolwiek zrobić z bazą - stworzyć tabelę, dodać wiersz, odczytać dane - trzeba wysłać do niej polecenie w języku **SQL** (*Structured Query Language*) - to nie jest JavaScript, tylko osobny, znacznie prostszy język, którego jedynym celem jest opisywanie operacji na danych w tabelach (np. `SELECT * FROM users` znaczy "pobierz wszystkie wiersze z tabeli `users`"). Node.js sam w sobie nie potrafi rozmawiać z MySQL - potrzebuje do tego biblioteki, która nawiązuje połączenie sieciowe z serwerem bazy danych, wysyła tam polecenia SQL i odbiera odpowiedź.

W tym kursie używamy biblioteki `mysql2` - aktualnego, szeroko stosowanego sterownika MySQL dla Node.js, który dodatkowo wspiera `async/await` (w podstawach Node.js, w pliku `1-podstawy.md`, poznałeś ideę operacji asynchronicznych - zapytania do bazy danych to kolejny przykład takiej operacji, bo zapytanie wysyłane jest przez sieć i trzeba poczekać na odpowiedź).

## 2. Instalacja

```bash
npm install mysql2
```

Biblioteka `mysql2` udostępnia dwa style pracy: klasyczny, oparty o callbacki, oraz nowszy, oparty o `Promise` (moduł `mysql2/promise`). W tym pliku korzystamy wyłącznie z wersji `mysql2/promise`, bo w połączeniu z `async/await` daje dużo czytelniejszy kod niż zagnieżdżone callbacki.

Uwaga: `npm install mysql2` instaluje tylko "tłumacza" po stronie Node.js - to nie jest sama baza danych. Żeby przykłady z tego pliku w ogóle zadziałały, potrzebujesz osobno uruchomionego serwera MySQL albo MariaDB, np. zainstalowanego lokalnie, uruchomionego przez XAMPP/MAMP, albo w kontenerze Docker - oraz utworzonej w nim bazy danych o dowolnej nazwie (w przykładach poniżej: `sklep`). To jednorazowa konfiguracja środowiska, niezwiązana bezpośrednio z Node.js.

## 3. Połączenie z bazą danych

Najprostszy sposób to `createConnection` - pojedyncze połączenie:

```javascript
const mysql = require("mysql2/promise");

async function main() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "haslo",
        database: "sklep"
    });

    console.log("Połączono z bazą danych");

    await connection.end();
}

main();
```

`mysql.createConnection()` zwraca `Promise`, dlatego funkcja `main` jest oznaczona jako `async`, a przed wywołaniem stoi `await` - kod czeka na nawiązanie połączenia, zanim przejdzie dalej. Obiekt konfiguracyjny (`host`, `user`, `password`, `database`) to dane dostępowe do serwera MySQL - w prawdziwym projekcie nie zapisuje się ich na sztywno w kodzie, tylko w zmiennych środowiskowych (`process.env`, temat opisany w `1-podstawy.md`). `connection.end()` zamyka połączenie, gdy nie jest już potrzebne.

### Pula połączeń zamiast pojedynczego połączenia

W realnej aplikacji serwer obsługuje wiele żądań jednocześnie, a jedno połączenie do bazy nie wystarczy - dwa zapytania nie mogą być wykonywane na tym samym połączeniu w tym samym momencie. Rozwiązaniem jest **pula połączeń** (*connection pool*) - zestaw kilku gotowych połączeń, z których biblioteka sama pożycza jedno na czas zapytania i oddaje z powrotem po jego zakończeniu.

```javascript
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "haslo",
    database: "sklep",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
```

`createPool()` tworzy pulę zamiast pojedynczego połączenia. `connectionLimit: 10` oznacza maksymalnie 10 równoległych połączeń - kolejne zapytania czekają w kolejce (`waitForConnections: true`), zamiast od razu kończyć się błędem. W praktyce, w aplikacji z Express, pulę tworzy się raz, przy starcie serwera, i eksportuje jako moduł, żeby korzystały z niej wszystkie trasy - dokładnie tak, jak eksportowało się routery w pliku `5-express-routing-middleware.md`. Od tego miejsca w dalszej części tego pliku wszystkie przykłady zakładają taką współdzieloną pulę (`pool`).

## 4. Obsługa błędu połączenia

Nawiązanie połączenia (albo wykonanie zapytania) może się nie udać - zły adres serwera, złe hasło, baza danych niedostępna. Tak jak przy każdej operacji asynchronicznej, błąd trzeba obsłużyć przez `try/catch`:

```javascript
async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "zle-haslo",
            database: "sklep"
        });

        console.log("Połączono");
        await connection.end();
    } catch (error) {
        console.error("Błąd połączenia z bazą danych:", error.message);
    }
}

testConnection();
```

Bez `try/catch` błąd połączenia zakończyłby program (albo, w przypadku żądania HTTP, spowodował, że serwer nigdy nie odpowie klientowi). Ten sam wzorzec - `try/catch` wokół `await` - stosuje się przy każdym zapytaniu do bazy, nie tylko przy samym połączeniu.

## 5. Tworzenie tabeli - zapytania DDL

**DDL** (*Data Definition Language*) to część SQL odpowiedzialna za definiowanie struktury bazy - tworzenie, zmianę i usuwanie tabel. Zapytanie `CREATE TABLE` można wykonać bezpośrednio z poziomu Node.js:

```javascript
async function createUsersTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Tabela users gotowa");
}

createUsersTable();
```

`pool.query()` wysyła dowolne zapytanie SQL do bazy i zwraca `Promise` z wynikiem. `IF NOT EXISTS` sprawia, że zapytanie nie zwróci błędu, jeśli tabela już istnieje - przydatne przy wielokrotnym uruchamianiu skryptu.

Każda kolumna ma zadeklarowany **typ danych**, czyli rodzaj wartości, jaki może w niej być zapisany - `INT` to liczba całkowita, `VARCHAR(100)` to tekst o długości maksymalnie 100 znaków, a `TIMESTAMP` to data razem z godziną. Baza pilnuje tych typów sama - nie zapisze tekstu w kolumnie typu `INT`.

`id INT AUTO_INCREMENT PRIMARY KEY` to klucz główny (**primary key**) - unikalny identyfikator wiersza, automatycznie zwiększany o 1 przy każdym nowym rekordzie. `NOT NULL` oznacza, że kolumna nie może być pusta, `UNIQUE` - że wartość w tej kolumnie nie może się powtórzyć w żadnym innym wierszu (przydatne np. dla adresu e-mail).

W praktyce zapytania tworzące tabele wykonuje się zwykle raz, przy zakładaniu bazy danych - nie przy każdym starcie serwera.

## 6. Zapytania DML - SELECT, INSERT, UPDATE, DELETE

**DML** (*Data Manipulation Language*) to część SQL odpowiedzialna za odczyt i modyfikację danych - to właśnie te zapytania wykonuje aplikacja podczas normalnej pracy.

### SELECT - odczyt danych

```javascript
async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
}
```

`pool.query()` przy `SELECT` zwraca tablicę dwuelementową - pierwszy element to same wiersze wyniku, drugi to metadane kolumn, których zwykle nie potrzebujemy. Dlatego od razu przy odbiorze wyniku stosuje się destrukturyzację `const [rows] = ...` - `rows` to tablica obiektów, po jednym na każdy wiersz z bazy.

### INSERT - dodawanie danych i przygotowane zapytania

```javascript
async function addUser(name, email) {
    const [result] = await pool.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email]
    );

    return result.insertId;
}
```

Znaki zapytania `?` w zapytaniu to **przygotowane zapytanie** (*prepared statement*) - miejsca, w które biblioteka bezpiecznie wstawi wartości podane w drugim argumencie `pool.query()`, w tej samej kolejności. `result.insertId` to identyfikator (`id`) nowo dodanego wiersza, nadany automatycznie dzięki `AUTO_INCREMENT`.

To jeden z najważniejszych nawyków w tym temacie: **nigdy nie wolno wklejać wartości od użytkownika bezpośrednio do treści zapytania SQL przez sklejanie stringów**:

```javascript
// NIGDY TAK - podatne na SQL injection
const query = `INSERT INTO users (name, email) VALUES ('${name}', '${email}')`;
await pool.query(query);
```

Gdyby ktoś jako `name` wysłał specjalnie spreparowany tekst zawierający fragment SQL, mógłby w ten sposób wykonać własne, niezamierzone zapytanie na bazie danych - to atak zwany **SQL injection**. Znaki `?` i osobno przekazana tablica wartości całkowicie eliminują to ryzyko, bo biblioteka sama odpowiednio je "opakowuje", zamiast wklejać jako tekst zapytania.

### UPDATE - aktualizacja danych

```javascript
async function updateUser(id, name, email) {
    const [result] = await pool.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, id]
    );

    return result.affectedRows;
}
```

`WHERE id = ?` jest tu kluczowe - bez tego warunku zapytanie zmieniłoby dane we **wszystkich** wierszach tabeli. `result.affectedRows` mówi, ile wierszy faktycznie zmieniło się w wyniku zapytania (0, jeśli nie znaleziono wiersza o podanym `id`).

### DELETE - usuwanie danych

```javascript
async function deleteUser(id) {
    const [result] = await pool.query(
        "DELETE FROM users WHERE id = ?",
        [id]
    );

    return result.affectedRows;
}
```

Tak samo jak przy `UPDATE` - warunek `WHERE` decyduje, który wiersz zostanie usunięty. `DELETE FROM users` bez `WHERE` usunąłby wszystkie wiersze z tabeli.

## 7. Prosty model relacyjny

Relacja to powiązanie między wierszami dwóch tabel - typowy przykład to jeden użytkownik i wiele jego wpisów (postów):

```text
users                      posts
┌────┬──────┐              ┌────┬─────────┬─────────┐
│ id │ name │              │ id │ title   │ user_id │
├────┼──────┤              ├────┼─────────┼─────────┤
│ 1  │ Jan  │  ←────────── │ 1  │ "Cześć" │    1    │
│ 2  │ Anna │  ←────────── │ 2  │ "Hej"   │    2    │
└────┴──────┘              │ 3  │ "Test"  │    1    │
                            └────┴─────────┴─────────┘
```

Kolumna `user_id` w tabeli `posts` to **klucz obcy** (*foreign key*) - wskazuje, do którego wiersza w tabeli `users` należy dany wpis. Definicja obu tabel razem z relacją:

```javascript
async function createTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
}
```

`FOREIGN KEY (user_id) REFERENCES users(id)` mówi bazie danych: wartość w kolumnie `user_id` musi odpowiadać jakiemuś istniejącemu `id` w tabeli `users`. Dzięki temu baza sama pilnuje spójności danych - nie pozwoli dodać wpisu wskazującego na nieistniejącego użytkownika.

Pobranie wpisów razem z danymi autora wymaga połączenia obu tabel w jednym zapytaniu (`JOIN`):

```javascript
async function getPostsWithAuthors() {
    const [rows] = await pool.query(`
        SELECT posts.id, posts.title, users.name AS author
        FROM posts
        JOIN users ON posts.user_id = users.id
    `);

    return rows;
}
```

`JOIN users ON posts.user_id = users.id` łączy każdy wiersz z `posts` z odpowiadającym mu wierszem z `users`, na podstawie zgodności `user_id` z `id`. `users.name AS author` nadaje kolumnie w wyniku bardziej czytelną nazwę (`author` zamiast `name`).

## 8. Podstawy indeksów

**Indeks** to dodatkowa struktura, którą baza danych tworzy dla wybranej kolumny, żeby dużo szybciej wyszukiwać wiersze po jej wartości - działa podobnie do skorowidza na końcu książki, dzięki któremu nie trzeba przeglądać całej treści, żeby znaleźć konkretne hasło.

Klucz główny (`PRIMARY KEY`) dostaje indeks automatycznie. Kolumnę `UNIQUE` (jak `email` w tabeli `users`) też. Jeśli aplikacja często wyszukuje wiersze po innej kolumnie, np. wpisy konkretnego użytkownika (`WHERE user_id = ?`), warto dodać indeks ręcznie:

```javascript
await pool.query("CREATE INDEX idx_posts_user_id ON posts (user_id)");
```

Bez indeksu baza przy takim zapytaniu musiałaby sprawdzić każdy wiersz tabeli po kolei. Z indeksem potrafi od razu przejść do właściwych wierszy. Indeksy przyspieszają odczyt, ale każdy dodatkowy indeks nieco spowalnia zapis (`INSERT`/`UPDATE`), bo baza musi go na bieżąco aktualizować - dlatego nie dodaje się ich bezmyślnie do każdej kolumny, tylko tam, gdzie realnie przyspieszają najczęstsze zapytania.

## 9. Baza danych w praktyce - endpoint Express

Poniższy przykład łączy poznany wcześniej Express (`4-express-podstawy.md`) z zapytaniem do bazy danych - jeden endpoint zwracający listę użytkowników jako JSON:

```javascript
const express = require("express");
const pool = require("./db");

const app = express();

app.get("/api/users", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email FROM users");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Błąd serwera" });
    }
});

app.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

Funkcja obsługująca trasę jest oznaczona jako `async`, dzięki czemu można w niej użyć `await pool.query(...)`. Cała logika jest opakowana w `try/catch` - jeśli zapytanie do bazy się nie powiedzie (np. baza jest chwilowo niedostępna), serwer nie "zawiesza" żądania, tylko odsyła kod `500` (błąd po stronie serwera) zamiast pustej odpowiedzi. Pełną architekturę endpointów CRUD (dodawanie, edycję, usuwanie zasobów przez REST API, podział na foldery `routes`/`controllers`/`models`) poznasz w kolejnym temacie - tutaj chodziło wyłącznie o pokazanie, jak backend i baza danych spinają się w jedną całość.

## 10. Najczęstsze błędy

**Sklejanie zapytania SQL ze stringów zamiast przygotowanych zapytań.** To najpoważniejszy błąd z tego tematu - otwiera drogę do SQL injection. Zawsze używaj `?` i osobnej tablicy wartości.

**Brak `try/catch` wokół zapytań.** Błąd zapytania bez obsługi wyjątku w kontekście Express może sprawić, że żądanie nigdy nie dostanie odpowiedzi albo serwer się wywróci.

**Zapomniany `await` przed zapytaniem.**

```javascript
const rows = pool.query("SELECT * FROM users"); // brak await
console.log(rows); // Promise { <pending> }, nie tablica wyników
```

Bez `await` zmienna `rows` przechowuje sam obiekt `Promise`, a nie wynik zapytania - trzeba poczekać na jego rozwiązanie.

**Zapomniany warunek `WHERE` przy UPDATE/DELETE.** Zapytanie `UPDATE users SET name = 'X'` bez `WHERE id = ?` zmieni dane we wszystkich wierszach tabeli, nie tylko w jednym.

**Złe typy danych w kolumnach.** Przechowywanie liczb jako `VARCHAR` albo dat jako zwykłego tekstu utrudnia później sortowanie, porównywanie i obliczenia na tych danych - warto od razu dobrać typ kolumny (`INT`, `VARCHAR`, `TIMESTAMP` itd.) zgodny z rodzajem przechowywanych danych.

**Tworzenie nowego połączenia przy każdym żądaniu zamiast korzystania z puli.** Nawiązywanie połączenia trwa dłużej niż samo zapytanie - pula połączeń tworzy je raz i wielokrotnie wykorzystuje.

## Co trzeba zapamiętać

```text
mysql2/promise
→ biblioteka do MySQL/MariaDB w Node.js, wspiera async/await

mysql.createPool(config)
→ tworzy pulę połączeń, współdzieloną przez całą aplikację

pool.query(sql, wartości)
→ wykonuje zapytanie SQL, zwraca Promise

DDL (CREATE TABLE, CREATE INDEX)
→ definiowanie struktury bazy danych

DML (SELECT, INSERT, UPDATE, DELETE)
→ odczyt i modyfikacja danych

przygotowane zapytania (?)
→ bezpieczny sposób wstawiania wartości do zapytania, chroni przed SQL injection

FOREIGN KEY
→ klucz obcy, wiąże wiersz jednej tabeli z wierszem innej tabeli (relacja)

indeks
→ struktura przyspieszająca wyszukiwanie po danej kolumnie
```

## Ćwiczenia

1. Utwórz bazę danych `biblioteka` i tabelę `books` z kolumnami: `id` (klucz główny, autoincrement), `title` (`VARCHAR`, wymagane), `author` (`VARCHAR`, wymagane), `year` (`INT`).
2. Napisz funkcję `addBook(title, author, year)`, która dodaje nową książkę do tabeli, korzystając z przygotowanego zapytania.
3. Napisz funkcję `getBooksByAuthor(author)`, która zwraca wszystkie książki danego autora (`SELECT ... WHERE author = ?`).
4. Dodaj tabelę `borrowers` (`id`, `name`) i tabelę `loans` (`id`, `book_id`, `borrower_id`, `loan_date`) z odpowiednimi kluczami obcymi do `books` i `borrowers`.
5. Napisz zapytanie z `JOIN`, które zwraca listę wypożyczeń razem z tytułem książki i imieniem wypożyczającego.
6. Dodaj do Express prosty endpoint `GET /api/books`, zwracający wszystkie książki jako JSON, z obsługą błędu przez `try/catch` i kodem `500` w razie niepowodzenia.
