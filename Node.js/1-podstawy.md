# Wprowadzenie do Node.js i środowiska pracy

## 1. Czym jest Node.js?

**Node.js** to środowisko uruchomieniowe pozwalające wykonywać kod JavaScript poza przeglądarką.

JavaScript początkowo kojarzył się głównie z kodem wykonywanym w przeglądarce:

```text
Przeglądarka
    ↓
HTML + CSS + JavaScript
    ↓
interakcja z użytkownikiem
```

Node.js pozwala uruchamiać JavaScript również na serwerze:

```text
Klient
  ↓
HTTP
  ↓
Serwer Node.js
  ↓
JavaScript
  ↓
baza danych / pliki / API / inne usługi
```

Dzięki temu JavaScript może być wykorzystywany do tworzenia **backendu**, czyli części aplikacji odpowiedzialnej m.in. za:

* obsługę żądań HTTP,
* logowanie użytkowników,
* komunikację z bazą danych,
* przetwarzanie danych,
* tworzenie API,
* obsługę plików,
* autoryzację,
* komunikację z innymi usługami.

Node.js nie jest językiem programowania. **Językiem jest JavaScript, a Node.js jest środowiskiem uruchomieniowym dla JavaScript.**

---

# 2. Node.js a JavaScript w przeglądarce

Ten sam język może być wykonywany w dwóch różnych środowiskach.

### JavaScript w przeglądarce

Ma dostęp m.in. do:

```javascript
document
window
localStorage
fetch()
```

Możemy więc manipulować stroną:

```javascript
document.querySelector("h1").textContent = "Hello";
```

### JavaScript w Node.js

Node.js nie posiada DOM-u przeglądarki, ale daje dostęp do funkcji potrzebnych na serwerze:

```javascript
console.log("Hello");
```

Możemy korzystać np. z:

```text
fs          - system plików
http        - serwer HTTP
path        - ścieżki
os          - informacje o systemie
crypto      - operacje kryptograficzne
process     - informacje o procesie
```

Przykład:

```javascript
const fs = require("fs");

fs.writeFileSync("test.txt", "Hello Node.js!");
```

Kod utworzy plik `test.txt`.

---

# 3. Skąd Node.js bierze swoją szybkość?

Node.js wykorzystuje silnik JavaScript **V8**, rozwijany przez Google i używany również w przeglądarce Chrome.

Schemat można uprościć do:

```text
Kod JavaScript
      ↓
Node.js
      ↓
silnik V8
      ↓
wykonywanie JavaScript
```

Sam V8 nie jest jednak całym Node.js.

Node.js dodaje do silnika JavaScript własne API i mechanizmy potrzebne do pracy z systemem operacyjnym, siecią, plikami itd.

---

# 4. Serwer w JavaScript

Najprostszy serwer HTTP można uruchomić bez Expressa, korzystając z modułu `http`.

Plik:

```text
server.js
```

Kod:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("Hello World!");
});

server.listen(3000, () => {
    console.log("Serwer działa na http://localhost:3000");
});
```

Uruchomienie:

```bash
node server.js
```

Następnie otwieramy:

```text
http://localhost:3000
```

Przeglądarka wysyła żądanie HTTP, a Node.js odpowiada.

```text
Przeglądarka
     |
     | GET /
     ↓
Node.js
     |
     | HTTP 200
     | "Hello World!"
     ↓
Przeglądarka
```

To jest podstawowa idea backendu.

---

# 5. Co oznacza Event Loop?

Jednym z najważniejszych elementów Node.js jest **Event Loop**, czyli pętla zdarzeń.

Node.js został zaprojektowany tak, aby dobrze radzić sobie z dużą liczbą operacji wejścia/wyjścia, np.:

* żądaniami HTTP,
* odczytem plików,
* zapytaniami do bazy danych,
* komunikacją sieciową.

Zamiast blokować wykonywanie programu podczas oczekiwania na takie operacje, Node.js może rozpocząć operację i zająć się innymi zadaniami.

Przykład:

```javascript
console.log("1");

setTimeout(() => {
    console.log("2");
}, 1000);

console.log("3");
```

Wynik:

```text
1
3
2
```

Dlaczego?

```text
console.log("1")
       ↓
setTimeout()
       ↓
ustawienie zadania
       ↓
console.log("3")
       ↓
...
       ↓
po około 1 sekundzie
       ↓
console.log("2")
```

Node.js nie zatrzymuje całego programu na sekundę.

---

# 6. Kod synchroniczny i asynchroniczny

### Synchronicznie

Instrukcje wykonywane są jedna po drugiej.

```javascript
console.log("A");
console.log("B");
console.log("C");
```

Wynik:

```text
A
B
C
```

### Asynchronicznie

Rozpoczynamy operację, ale nie musimy czekać na jej zakończenie, żeby wykonywać dalszy kod.

Przykład:

```javascript
const fs = require("fs");

fs.readFile("plik.txt", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(data);
});

console.log("Koniec");
```

Możemy otrzymać:

```text
Koniec
zawartość pliku
```

Node.js rozpoczął odczytywanie pliku, ale nie musiał czekać na jego zakończenie.

---

# 7. Event Loop - uproszczony model

Można wyobrazić go sobie tak:

```text
             ┌─────────────────┐
             │  Kod JavaScript │
             └────────┬────────┘
                      ↓
               operacja I/O
                      ↓
             ┌─────────────────┐
             │ system / Node.js│
             └────────┬────────┘
                      ↓
              operacja gotowa
                      ↓
             ┌─────────────────┐
             │    Event Loop   │
             └────────┬────────┘
                      ↓
              callback / zadanie
                      ↓
             kod JavaScript
```

Przykładowo:

```javascript
fs.readFile("data.txt", callback);
```

Node.js zleca odczyt pliku, a następnie może wykonywać kolejne instrukcje.

Gdy odczyt się zakończy, funkcja `callback` zostanie wykonana.

---

# 8. Czy Node.js jest wielowątkowy?

W tym miejscu łatwo o nieporozumienie.

Kod JavaScript aplikacji Node.js jest zasadniczo wykonywany przez **pojedynczy główny wątek**.

Nie oznacza to jednak, że cały Node.js jest ograniczony do jednego wątku.

Node.js korzysta również z mechanizmów systemowych i puli wątków, m.in. poprzez bibliotekę **libuv**.

Najważniejsza rzecz do zapamiętania:

> Node.js wykorzystuje nieblokujące operacje I/O i Event Loop, dzięki czemu jeden główny wątek JavaScript może obsługiwać wiele operacji oczekujących na dane.

Dlatego Node.js bardzo dobrze pasuje do aplikacji, w których dużo czasu zajmuje oczekiwanie na:

```text
HTTP
bazy danych
pliki
sieć
API
```

---

# 9. Dlaczego nie należy blokować Event Loop?

Jeżeli wykonamy bardzo ciężką operację synchroniczną, główny wątek może zostać zajęty.

Na przykład:

```javascript
while (true) {
}
```

Program utknie w nieskończonej pętli.

Nie będzie mógł normalnie obsługiwać kolejnych żądań.

Podobny problem może wystąpić przy bardzo ciężkich obliczeniach wykonywanych synchronicznie.

Przykład:

```javascript
function veryHeavyCalculation() {
    // bardzo dużo obliczeń
}

veryHeavyCalculation();
```

Jeżeli obliczenia trwają kilka sekund, przez ten czas Event Loop nie może normalnie wykonywać kolejnych zadań JavaScript.

W aplikacjach serwerowych trzeba więc uważać na:

```text
bardzo ciężkie obliczenia
duże operacje synchroniczne
nieskończone pętle
blokujące API
```

---

# 10. Instalacja Node.js

Po zainstalowaniu Node.js powinniśmy mieć dostęp do dwóch podstawowych poleceń:

```bash
node
```

oraz:

```bash
npm
```

Sprawdzenie wersji Node.js:

```bash
node --version
```

lub:

```bash
node -v
```

Przykładowy wynik:

```text
v22.18.0
```

Sprawdzenie npm:

```bash
npm -v
```

---

# 11. Czym jest npm?

**npm** oznacza **Node Package Manager**.

Jest to narzędzie służące m.in. do:

* instalowania bibliotek,
* zarządzania zależnościami,
* tworzenia projektu,
* uruchamiania skryptów,
* publikowania pakietów.

Przykładowo chcemy zainstalować Express:

```bash
npm install express
```

npm pobierze bibliotekę i zapisze ją jako zależność projektu.

---

# 12. Inicjalizacja projektu

Najpierw tworzymy katalog:

```bash
mkdir moja-aplikacja
```

Przechodzimy do niego:

```bash
cd moja-aplikacja
```

Następnie:

```bash
npm init
```

npm zada nam kilka pytań dotyczących projektu.

Możemy też użyć:

```bash
npm init -y
```

Opcja `-y` automatycznie akceptuje domyślne wartości.

Po wykonaniu polecenia powstanie:

```text
moja-aplikacja/
└── package.json
```

---

# 13. Plik package.json

`package.json` jest jednym z najważniejszych plików projektu Node.js.

Przechowuje informacje o projekcie, m.in.:

* nazwę,
* wersję,
* opis,
* punkt wejścia,
* skrypty,
* zależności.

Przykład:

```json
{
    "name": "moja-aplikacja",
    "version": "1.0.0",
    "description": "Moja pierwsza aplikacja Node.js",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {}
}
```

---

# 14. Najważniejsze pola package.json

## name

Nazwa projektu:

```json
"name": "moja-aplikacja"
```

## version

Wersja:

```json
"version": "1.0.0"
```

Często stosuje się tutaj **Semantic Versioning**, czyli np.:

```text
1.0.0
```

gdzie:

```text
1 - major
0 - minor
0 - patch
```

## description

Opis projektu:

```json
"description": "Backend aplikacji"
```

## main

Określa główny plik aplikacji:

```json
"main": "server.js"
```

## scripts

Definiuje własne polecenia:

```json
"scripts": {
    "start": "node server.js"
}
```

## dependencies

Zawiera zależności wymagane przez aplikację:

```json
"dependencies": {
    "express": "^5.1.0"
}
```

---

# 15. Instalowanie biblioteki

Przykładowo instalujemy Express:

```bash
npm install express
```

Po instalacji `package.json` może zawierać:

```json
"dependencies": {
    "express": "^5.1.0"
}
```

Pojawi się również katalog:

```text
node_modules/
```

W nim npm przechowuje zainstalowane pakiety oraz ich zależności.

Struktura projektu może wyglądać tak:

```text
moja-aplikacja/
│
├── node_modules/
├── package.json
├── package-lock.json
└── server.js
```

---

# 16. package-lock.json

Podczas instalacji zależności npm tworzy również:

```text
package-lock.json
```

Jego zadaniem jest zapisanie dokładnego drzewa zależności projektu.

Ma to znaczenie np. wtedy, gdy projekt zostanie sklonowany na innym komputerze.

Chcemy, żeby:

```text
komputer A
       ↓
npm install
       ↓
konkretne wersje zależności

komputer B
       ↓
npm install
       ↓
te same wersje
```

`package-lock.json` pomaga zapewnić powtarzalność instalacji.

---

# 17. node_modules

Po:

```bash
npm install express
```

powstaje:

```text
node_modules/
```

Nie powinno się zazwyczaj dodawać tego katalogu do repozytorium Git.

Tworzymy:

```text
.gitignore
```

i wpisujemy:

```gitignore
node_modules/
```

Jeżeli ktoś pobierze projekt z GitHuba, może później wykonać:

```bash
npm install
```

npm odczyta:

```text
package.json
package-lock.json
```

i zainstaluje wymagane zależności.

---

# 18. Pierwszy projekt Node.js

Utwórzmy:

```text
moja-aplikacja/
├── package.json
└── server.js
```

`server.js`:

```javascript
console.log("Witaj w Node.js!");
```

Uruchamiamy:

```bash
node server.js
```

Wynik:

```text
Witaj w Node.js!
```

Node.js wykonał JavaScript bez potrzeby używania przeglądarki.

---

# 19. Prosty serwer HTTP

Teraz możemy stworzyć pierwszy backend.

`server.js`:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Witaj na serwerze!");
});

server.listen(3000, () => {
    console.log("Serwer działa na porcie 3000");
});
```

Uruchomienie:

```bash
node server.js
```

Następnie:

```text
http://localhost:3000
```

---

# 20. localhost i port

`localhost` oznacza lokalny komputer.

Przykład:

```text
http://localhost:3000
```

oznacza:

```text
http://
   ↓
protokół

localhost
   ↓
mój komputer

3000
   ↓
port
```

Port pozwala uruchamiać wiele usług na tym samym komputerze.

Przykładowo:

```text
localhost:3000  → aplikacja Node.js
localhost:4200  → Angular
localhost:5173  → Vite
localhost:8080  → inna aplikacja
```

---

# 21. Skrypty npm

Zamiast za każdym razem pisać:

```bash
node server.js
```

możemy utworzyć skrypt.

W `package.json`:

```json
{
    "scripts": {
        "start": "node server.js"
    }
}
```

Teraz:

```bash
npm start
```

wykona:

```bash
node server.js
```

Możemy tworzyć wiele własnych skryptów:

```json
{
    "scripts": {
        "start": "node server.js",
        "dev": "node server.js",
        "test": "..."
    }
}
```

Uruchomienie:

```bash
npm run dev
```

Dla `start` npm pozwala użyć skróconej formy:

```bash
npm start
```

zamiast:

```bash
npm run start
```

---

# 22. Przykładowy projekt od zera

Cały proces może wyglądać tak:

```bash
mkdir backend
cd backend
npm init -y
```

Tworzymy:

```text
server.js
```

Dodajemy:

```javascript
console.log("Backend działa");
```

Uruchamiamy:

```bash
node server.js
```

Następnie instalujemy Express:

```bash
npm install express
```

i projekt zaczyna wyglądać mniej więcej tak:

```text
backend/
│
├── node_modules/
├── package-lock.json
├── package.json
└── server.js
```

---

# 23. Przykładowy package.json

Po dodaniu skryptu:

```json
{
    "name": "backend",
    "version": "1.0.0",
    "description": "Pierwszy backend Node.js",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "express": "^5.1.0"
    }
}
```

Możemy uruchomić:

```bash
npm start
```

---

# 24. Najważniejsze polecenia

### Sprawdzenie wersji Node.js

```bash
node -v
```

### Sprawdzenie npm

```bash
npm -v
```

### Uruchomienie pliku

```bash
node server.js
```

### Utworzenie projektu

```bash
npm init
```

### Utworzenie projektu z wartościami domyślnymi

```bash
npm init -y
```

### Instalacja zależności

```bash
npm install express
```

### Instalacja zależności tylko do developmentu

```bash
npm install --save-dev <pakiet>
```

### Instalacja wszystkich zależności projektu

```bash
npm install
```

### Uruchomienie skryptu

```bash
npm run <nazwa>
```

Przykład:

```bash
npm run dev
```

### Uruchomienie skryptu start

```bash
npm start
```

---

# 25. `dependencies` a `devDependencies`

W `package.json` możemy mieć:

```json
"dependencies": {
    "express": "^5.1.0"
}
```

oraz:

```json
"devDependencies": {
    "nodemon": "^3.0.0"
}
```

### dependencies

Pakiety potrzebne do działania aplikacji.

Przykładowo:

```text
express
mysql2
jsonwebtoken
bcrypt
```

### devDependencies

Pakiety potrzebne głównie podczas tworzenia aplikacji.

Przykładowo:

```text
nodemon
eslint
test framework
```

Instalacja:

```bash
npm install express
```

dla zwykłej zależności.

Dla zależności developerskiej:

```bash
npm install --save-dev nodemon
```

---

# 26. Co dzieje się po `npm install`?

Załóżmy, że `package.json` zawiera:

```json
"dependencies": {
    "express": "^5.1.0"
}
```

Wykonujemy:

```bash
npm install
```

npm:

```text
czyta package.json
       ↓
sprawdza zależności
       ↓
pobiera potrzebne pakiety
       ↓
tworzy / aktualizuje node_modules
       ↓
aktualizuje package-lock.json
```

Dlatego nie musimy przesyłać całego `node_modules` razem z projektem.

Wystarczy:

```text
package.json
package-lock.json
kod aplikacji
```

a następnie:

```bash
npm install
```

---

# 27. `node` jako interpreter

Możemy również uruchomić:

```bash
node
```

bez podawania pliku.

Otworzy się wtedy interaktywne środowisko Node.js:

```text
>
```

Możemy wpisać:

```javascript
2 + 2
```

i otrzymamy:

```text
4
```

Możemy też:

```javascript
console.log("Hello");
```

W ten sposób można szybko sprawdzać działanie fragmentów JavaScript.

Wyjście:

```text
.exit
```

lub:

```text
Ctrl + C
Ctrl + C
```

---

# 28. `process`

Node.js udostępnia globalny obiekt:

```javascript
process
```

Zawiera informacje dotyczące aktualnie uruchomionego procesu.

Przykład:

```javascript
console.log(process.version);
```

Możemy otrzymać:

```text
v22.x.x
```

Możemy również odczytać argumenty przekazane do programu:

```javascript
console.log(process.argv);
```

Przykładowo:

```bash
node app.js hello
```

Argument `hello` znajdzie się w:

```javascript
process.argv
```

---

# 29. Zmienne środowiskowe

Node.js może korzystać ze zmiennych środowiskowych.

Przykład:

```javascript
console.log(process.env.PORT);
```

Jeżeli ustawimy:

```text
PORT=3000
```

aplikacja może wykorzystać tę wartość.

Często spotyka się:

```javascript
const port = process.env.PORT || 3000;
```

Czyli:

```text
jeżeli PORT istnieje
        ↓
użyj PORT
        ↓
w przeciwnym przypadku
        ↓
użyj 3000
```

Jest to bardzo częsty sposób konfiguracji aplikacji backendowych.

---

# 30. Najważniejsza rzecz: Node.js nie jest frameworkiem

To bardzo częsta rzecz do pomylenia.

```text
JavaScript
    ↓
język programowania

Node.js
    ↓
środowisko uruchomieniowe

Express
    ↓
framework / biblioteka do tworzenia aplikacji HTTP

npm
    ↓
menedżer pakietów
```

Możemy więc mieć:

```text
JavaScript
   +
Node.js
   +
Express
   +
MySQL
```

i na tej podstawie stworzyć kompletny backend.

---

# 31. Jak wygląda typowy przepływ pracy?

Przy tworzeniu backendu Node.js często zaczynamy od:

```text
1. Instalacja Node.js
        ↓
2. Utworzenie katalogu projektu
        ↓
3. npm init
        ↓
4. package.json
        ↓
5. Instalacja bibliotek
        ↓
6. Utworzenie kodu
        ↓
7. Skrypty npm
        ↓
8. Uruchomienie aplikacji
```

Przykład:

```bash
mkdir moja-aplikacja
cd moja-aplikacja
npm init -y
npm install express
npm start
```

---

# 32. Co trzeba umieć na INF.04 z tego tematu?

Po przerobieniu tego zagadnienia powinieneś swobodnie rozumieć:

* czym jest Node.js,
* czym różni się Node.js od JavaScriptu,
* czym różni się Node.js od przeglądarki,
* czym jest backend,
* do czego wykorzystuje się Node.js,
* czym jest V8,
* czym jest Event Loop,
* czym jest operacja synchroniczna,
* czym jest operacja asynchroniczna,
* dlaczego nie należy blokować Event Loop,
* czym jest npm,
* jak sprawdzić wersję Node.js,
* jak utworzyć projekt przez `npm init`,
* czym jest `package.json`,
* do czego służy `package-lock.json`,
* czym jest `node_modules`,
* czym są `dependencies`,
* czym są `devDependencies`,
* jak instalować pakiety,
* jak uruchamiać skrypty npm,
* jak uruchomić plik `.js` przez `node`,
* czym jest `localhost`,
* czym jest port,
* jak stworzyć prosty serwer HTTP,
* do czego służy `process`,
* czym są zmienne środowiskowe.

## Minimum, które powinno wejść w pamięć

```text
Node.js
→ środowisko uruchomieniowe JavaScript

npm
→ menedżer pakietów

package.json
→ konfiguracja projektu i jego zależności

package-lock.json
→ dokładny zapis wersji/drzewa zależności

node_modules
→ zainstalowane pakiety

Event Loop
→ mechanizm pozwalający Node.js obsługiwać zadania asynchroniczne

Express
→ narzędzie upraszczające tworzenie aplikacji HTTP

node plik.js
→ uruchomienie programu Node.js

npm init -y
→ utworzenie projektu z domyślnym package.json

npm install <pakiet>
→ instalacja zależności

npm start
→ uruchomienie skryptu start
```

### Najprostszy model do zapamiętania

```text
JavaScript
    ↓
Node.js
    ↓
backend
    ↓
HTTP / API / pliki / baza danych
```

a zarządzanie projektem:

```text
npm
 ↓
package.json
 ↓
dependencies
 ↓
node_modules
```

i wykonywanie operacji:

```text
JavaScript
    ↓
Event Loop
    ↓
obsługa wielu operacji I/O
    ↓
serwer może odpowiadać wielu klientom
```
