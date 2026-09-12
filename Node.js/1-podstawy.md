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

## 2. Node.js a JavaScript w przeglądarce

Ten sam język może być wykonywany w dwóch różnych środowiskach, ale mają one dostęp do zupełnie innych rzeczy.

W przeglądarce JavaScript ma dostęp do obiektów związanych ze stroną i użytkownikiem, takich jak `document`, `window`, `localStorage` czy `fetch()`. Dzięki temu może np. zmieniać treść strony po kliknięciu przycisku.

W Node.js nie istnieje `document` ani `window`, bo nie ma tam żadnej strony do wyświetlenia. Zamiast tego Node.js udostępnia moduły przydatne na serwerze:

```text
fs          - system plików
http        - serwer HTTP
path        - ścieżki
os          - informacje o systemie
crypto      - operacje kryptograficzne
process     - informacje o procesie
```

Za pomocą modułu `fs` można na przykład zapisać plik na dysku - coś, co w przeglądarce ze względów bezpieczeństwa jest niemożliwe.

Żeby skorzystać z takiego modułu we własnym kodzie, trzeba go najpierw wczytać funkcją `require()`, podając w cudzysłowie jego nazwę, np. `require("fs")`. Wynik zwykle zapisujemy do zmiennej o tej samej nazwie co moduł - dzięki temu w dalszym kodzie mamy dostęp do wszystkich jego funkcji, np. `fs.writeFileSync(...)`. Zobaczysz to w praktyce już w przykładzie 3.

| JavaScript w przeglądarce | JavaScript w Node.js |
|---|---|
| ma dostęp do `document`, `window` | nie ma dostępu do DOM-u |
| działa w kontekście jednej strony | działa jako samodzielny program |
| ograniczony dostęp do systemu plików | pełny dostęp do plików, sieci, systemu |
| uruchamiany przez przeglądarkę | uruchamiany poleceniem `node` |

Praktyczny przykład zapisu pliku znajdziesz w sekcji z kodem, przykład 3.

---

## 3. Skąd Node.js bierze swoją szybkość?

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

Sam V8 nie jest jednak całym Node.js. Node.js dodaje do silnika JavaScript własne API i mechanizmy potrzebne do pracy z systemem operacyjnym, siecią, plikami itd.

---

## 4. Jak działa serwer napisany w Node.js?

Node.js pozwala napisać serwer HTTP obsługujący żądania od klientów, korzystając z wbudowanego modułu `http`.

Przeglądarka (albo dowolny inny klient) wysyła żądanie HTTP pod konkretny adres, a Node.js odbiera je, przetwarza i odsyła odpowiedź:

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

To jest podstawowa idea backendu - program działający cały czas, nasłuchujący na określonym porcie i odpowiadający na przychodzące żądania. Pełny przykład takiego serwera znajduje się w sekcji z kodem, przykład 11.

---

## 5. Co oznacza Event Loop?

Jednym z najważniejszych elementów Node.js jest **Event Loop**, czyli pętla zdarzeń.

Node.js został zaprojektowany tak, aby dobrze radzić sobie z dużą liczbą operacji wejścia/wyjścia (I/O), np.:

* żądaniami HTTP,
* odczytem plików,
* zapytaniami do bazy danych,
* komunikacją sieciową.

Zamiast blokować wykonywanie programu podczas oczekiwania na taką operację, Node.js może ją rozpocząć i w międzyczasie zająć się innymi zadaniami. Gdy operacja się zakończy, Event Loop zadba o to, żeby uruchomić kod, który na nią czekał.

Uproszczony przebieg wygląda tak:

```text
console.log("1")
       ↓
setTimeout()
       ↓
ustawienie zadania na później
       ↓
console.log("3")
       ↓
...
       ↓
po około 1 sekundzie
       ↓
console.log("2")
```

Node.js nie zatrzymuje całego programu na czas oczekiwania - dalszy kod wykonuje się od razu, a zadanie oczekujące dołącza dopiero wtedy, gdy jest gotowe. Konkretny przykład kodu do tego mechanizmu znajduje się w sekcji z kodem, przykład 4.

---

## 6. Kod synchroniczny i asynchroniczny

**Kod synchroniczny** wykonuje się linia po linii - każda kolejna instrukcja czeka, aż poprzednia się zakończy.

**Kod asynchroniczny** pozwala rozpocząć operację (np. odczyt pliku) i nie czekać na jej zakończenie, żeby wykonywać dalszy kod. Wynik takiej operacji dostajemy później, zwykle w funkcji zwrotnej (**callback**) - czyli zwykłej funkcji, którą przekazujemy jako argument do innej funkcji, a Node.js sam ją wywoła, gdy operacja się zakończy. Innym sposobem odbierania takiego wyniku jest `Promise` - poznasz go szczegółowo w kolejnej lekcji.

W Node.js większość operacji I/O - odczyt plików, zapytania sieciowe, zapytania do bazy danych - jest asynchroniczna. To jedna z podstawowych cech tego środowiska. Przykłady obu podejść znajdziesz w sekcji z kodem, przykłady 5 i 6.

---

## 7. Event Loop - uproszczony model

Mechanizm obsługi operacji asynchronicznych można wyobrazić sobie tak:

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

Node.js zleca np. odczyt pliku, a następnie może wykonywać kolejne instrukcje. Gdy odczyt się zakończy, funkcja `callback` przekazana do tej operacji zostanie wykonana - Event Loop dba o to, żeby trafiła z powrotem do kolejki wykonania.

---

## 8. Czy Node.js jest wielowątkowy?

W tym miejscu łatwo o nieporozumienie.

Kod JavaScript aplikacji Node.js jest zasadniczo wykonywany przez **pojedynczy główny wątek**. Nie oznacza to jednak, że cały Node.js jest ograniczony do jednego wątku - korzysta on również z mechanizmów systemowych i puli wątków, m.in. poprzez bibliotekę **libuv**.

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

## 9. Dlaczego nie należy blokować Event Loop?

Jeżeli wykonamy bardzo ciężką operację synchroniczną, główny wątek zostaje zajęty i przez ten czas Node.js nie może obsługiwać żadnych innych zadań - w tym nowych żądań HTTP.

Dotyczy to zarówno nieskończonych pętli, jak i zwykłych, ale bardzo czasochłonnych obliczeń wykonywanych synchronicznie (przykłady w sekcji z kodem, przykład 7).

W aplikacjach serwerowych trzeba więc uważać na:

```text
bardzo ciężkie obliczenia
duże operacje synchroniczne
nieskończone pętle
blokujące API
```

---

## 10. Instalacja Node.js i sprawdzanie wersji

Po zainstalowaniu Node.js mamy dostęp do dwóch podstawowych poleceń w terminalu: `node` oraz `npm`.

Wersję zainstalowanego Node.js sprawdzamy poleceniem `node --version` (lub krócej `node -v`). Analogicznie wersję npm sprawdza się poleceniem `npm -v`. Dokładny zapis tych poleceń znajduje się w sekcji z kodem, przykład 1.

Warto sprawdzać wersję Node.js przy starcie każdego nowego projektu - niektóre biblioteki wymagają konkretnej, minimalnej wersji.

---

## 11. Czym jest npm?

**npm** oznacza **Node Package Manager**, czyli menedżer pakietów dla Node.js.

Jest to narzędzie służące m.in. do:

* instalowania bibliotek,
* zarządzania zależnościami,
* tworzenia projektu,
* uruchamiania skryptów,
* publikowania pakietów.

**Zależność** (ang. *dependency*) to biblioteka, z której korzysta nasz projekt i którą trzeba zainstalować, zanim kod zacznie działać. npm pobiera taką bibliotekę z internetu i zapisuje ją jako część projektu.

---

## 12. Inicjalizacja projektu

Zanim zaczniemy pisać kod, tworzymy katalog projektu i inicjalizujemy go poleceniem npm. Podczas inicjalizacji npm zadaje kilka pytań dotyczących projektu (nazwa, wersja, opis) albo - jeśli użyjemy flagi automatycznie akceptującej wartości domyślne - pomija te pytania i od razu tworzy plik konfiguracyjny.

Efektem inicjalizacji jest zawsze ten sam plik:

```text
moja-aplikacja/
└── package.json
```

Dokładne polecenia do wykonania tego kroku znajdziesz w sekcji z kodem, przykład 8.

---

## 13. Plik package.json

`package.json` jest jednym z najważniejszych plików projektu Node.js. Przechowuje informacje o projekcie, m.in. jego nazwę, wersję, opis, punkt wejścia, listę skryptów oraz listę zależności.

Można powiedzieć, że jest to "dowód osobisty" projektu - każdy, kto otworzy repozytorium, na podstawie tego jednego pliku wie, czym jest projekt, jak go uruchomić i jakich bibliotek potrzebuje.

Pełny przykładowy plik znajdziesz w sekcji z kodem, przykład 9.

---

## 14. Najważniejsze pola package.json

* `name` - nazwa projektu.
* `version` - wersja projektu, zwykle zapisywana w konwencji **Semantic Versioning** jako trzy liczby oddzielone kropkami: major, minor, patch (np. `1.0.0`).
* `description` - krótki opis projektu.
* `main` - wskazuje główny plik aplikacji.
* `scripts` - zbiór własnych poleceń, które można uruchomić przez npm (więcej w sekcji 18).
* `dependencies` - lista bibliotek wymaganych do działania aplikacji.
* `devDependencies` - lista bibliotek potrzebnych tylko podczas developmentu (więcej w sekcji 20).

---

## 15. Instalowanie bibliotek i katalog node_modules

Instalację biblioteki wykonujemy poleceniem npm, podając jej nazwę (przykład w sekcji z kodem, przykład 10). Po instalacji npm dopisuje bibliotekę do pola `dependencies` w `package.json` oraz tworzy (albo aktualizuje) katalog:

```text
node_modules/
```

W nim npm przechowuje zainstalowane pakiety oraz wszystkie ich zależności. Ten katalog potrafi być bardzo duży, dlatego nigdy nie dodaje się go do repozytorium Git - zamiast tego dodaje się go do pliku `.gitignore`.

Struktura projektu po instalacji jednej biblioteki wygląda zwykle tak:

```text
moja-aplikacja/
│
├── node_modules/
├── package.json
├── package-lock.json
└── server.js
```

---

## 16. package-lock.json

Podczas instalacji zależności npm tworzy również plik `package-lock.json`. Jego zadaniem jest zapisanie dokładnego drzewa zależności projektu - nie tylko bibliotek, które sami zainstalowaliśmy, ale też wszystkich bibliotek, od których one zależą, wraz z ich dokładnymi wersjami.

Ma to znaczenie np. wtedy, gdy projekt zostanie sklonowany na innym komputerze:

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

`package-lock.json` pomaga zapewnić powtarzalność instalacji - dzięki niemu wszyscy w zespole (oraz środowisko produkcyjne) pracują na dokładnie tych samych wersjach bibliotek.

---

## 17. localhost i port

`localhost` oznacza lokalny komputer, na którym uruchomiony jest serwer. Adres w postaci `http://localhost:3000` rozbija się na trzy części:

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

**Port** pozwala uruchamiać wiele niezależnych usług na tym samym komputerze jednocześnie - każda usługa nasłuchuje na innym numerze:

```text
localhost:3000  → aplikacja Node.js
localhost:4200  → Angular
localhost:5173  → Vite
localhost:8080  → inna aplikacja
```

---

## 18. Skrypty npm

Zamiast za każdym razem ręcznie wpisywać polecenie uruchamiające aplikację, można zapisać je jako **skrypt** w polu `scripts` w `package.json` i nadać mu krótką nazwę, np. `start` albo `dev`.

Skrypt o nazwie `start` można uruchomić skróconym poleceniem `npm start`. Każdy inny skrypt uruchamia się poleceniem `npm run <nazwa>`, np. `npm run dev`. Pełny przykład znajdziesz w sekcji z kodem, przykład 12.

Dzięki temu cały zespół uruchamia projekt w ten sam sposób, niezależnie od tego, jak dokładnie wygląda polecenie w środku.

---

## 19. dependencies a devDependencies

W `package.json` zależności dzielą się na dwie grupy.

**dependencies** to pakiety potrzebne do działania aplikacji w środowisku produkcyjnym, np. `express`, `mysql2`, `jsonwebtoken`, `bcrypt`. Bez nich aplikacja nie zadziała.

**devDependencies** to pakiety potrzebne głównie podczas tworzenia aplikacji, np. `nodemon`, `eslint`, biblioteki do testów. Nie są one potrzebne, żeby aplikacja działała na produkcji - pomagają tylko w codziennej pracy programisty.

Instalacja zwykłej zależności i zależności developerskiej różni się jedną dodatkową flagą - dokładna składnia znajduje się w sekcji z kodem, przykład 10.

---

## 20. Co dzieje się po npm install?

Gdy w katalogu projektu wykonamy polecenie `npm install` bez podawania nazwy pakietu, npm wykonuje kilka kroków po kolei:

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

Dlatego nie musimy przesyłać całego katalogu `node_modules` razem z projektem - wystarczy przesłać `package.json`, `package-lock.json` i kod aplikacji, a `npm install` odtworzy resztę na dowolnym komputerze.

---

## 21. node jako interpreter (tryb interaktywny)

Polecenie `node` można uruchomić również bez podawania nazwy pliku. Otwiera się wtedy interaktywne środowisko Node.js (tzw. REPL - *Read-Eval-Print Loop*), w którym można na bieżąco wpisywać i sprawdzać fragmenty JavaScript, bez potrzeby tworzenia pliku.

Jest to wygodne narzędzie do szybkiego sprawdzenia, jak zachowuje się dany fragment kodu. Wyjście z tego trybu następuje po wpisaniu `.exit` albo dwukrotnym naciśnięciu `Ctrl + C`. Przykład sesji znajduje się w sekcji z kodem, przykład 13.

---

## 22. process

Node.js udostępnia globalny obiekt `process`, który zawiera informacje o aktualnie uruchomionym procesie - m.in. wersję Node.js, argumenty przekazane przy uruchomieniu programu czy zmienne środowiskowe.

Jest to jeden z obiektów, z którymi uczeń najczęściej zetknie się przy pisaniu prostych skryptów i konfigurowaniu aplikacji serwerowych. Przykład użycia w sekcji z kodem, przykład 14.

---

## 23. Zmienne środowiskowe

**Zmienna środowiskowa** to wartość ustawiona poza kodem aplikacji - zwykle w systemie operacyjnym albo w pliku konfiguracyjnym - do której program ma dostęp przez `process.env`.

Zmienne środowiskowe są wygodnym sposobem konfigurowania aplikacji bez zaszywania wartości (np. numeru portu czy hasła do bazy danych) bezpośrednio w kodzie:

```text
jeżeli zmienna PORT istnieje
        ↓
użyj PORT
        ↓
w przeciwnym przypadku
        ↓
użyj wartości domyślnej, np. 3000
```

Jest to bardzo częsty wzorzec konfiguracji aplikacji backendowych - przykład kodu w sekcji z kodem, przykład 15.

---

## 24. Node.js nie jest frameworkiem

To bardzo częsta rzecz do pomylenia:

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

Wszystkie te elementy współpracują ze sobą, ale są odpowiedzialne za zupełnie inne rzeczy. Typowy backend w tym kursie będzie zbudowany na warstwach:

```text
JavaScript
   +
Node.js
   +
Express
   +
MySQL
```

Express nie jest jeszcze omawiany szczegółowo w tym pliku - to osobny temat, który pozwoli wygodniej tworzyć serwery HTTP niż robienie tego ręcznie modułem `http`.

---

## 25. Jak wygląda typowy przepływ pracy?

Przy tworzeniu backendu w Node.js proces zwykle wygląda tak:

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

Cały ten proces w formie gotowych poleceń do wklejenia w terminal znajduje się w sekcji z kodem, przykład 16.

---

## 26. Co trzeba umieć na INF.04 z tego tematu?

Po przerobieniu tego zagadnienia powinieneś swobodnie rozumieć:

* czym jest Node.js,
* czym różni się Node.js od JavaScriptu,
* czym różni się Node.js od przeglądarki,
* czym jest backend,
* do czego wykorzystuje się Node.js,
* czym jest V8,
* czym jest Event Loop,
* czym jest operacja synchroniczna, a czym asynchroniczna,
* dlaczego nie należy blokować Event Loop,
* czym jest npm,
* jak sprawdzić wersję Node.js,
* jak utworzyć projekt przez `npm init`,
* czym jest `package.json`,
* do czego służy `package-lock.json`,
* czym jest `node_modules`,
* czym są `dependencies` i `devDependencies`,
* jak instalować pakiety,
* jak uruchamiać skrypty npm,
* jak uruchomić plik `.js` przez `node`,
* czym jest `localhost` i port,
* jak działa prosty serwer HTTP,
* do czego służy `process`,
* czym są zmienne środowiskowe.

### Minimum, które powinno wejść w pamięć

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

Najprostszy model do zapamiętania:

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

---

## Kod - przykłady

Poniżej wszystkie przykłady kodu z tego tematu, w kolejności odpowiadającej opisanej wyżej teorii. Każdy z nich można samodzielnie przepisać i uruchomić.

### Przykład 1: sprawdzenie wersji Node.js i npm

```bash
node --version
npm -v
```

Przykładowy wynik dla Node.js:

```text
v22.18.0
```

### Przykład 2: pierwszy plik JavaScript uruchomiony przez Node.js

`server.js`:

```javascript
console.log("Witaj w Node.js!");
```

Uruchomienie:

```bash
node server.js
```

Wynik w terminalu:

```text
Witaj w Node.js!
```

Node.js wykonał JavaScript bez potrzeby używania przeglądarki.

### Przykład 3: wbudowany moduł fs - zapis pliku

```javascript
const fs = require("fs");

fs.writeFileSync("test.txt", "Hello Node.js!");
```

Kod utworzy w katalogu projektu plik `test.txt` z podaną treścią.

### Przykład 4: Event Loop w praktyce

```javascript
console.log("1");

setTimeout(() => {
    console.log("2");
}, 1000);

console.log("3");
```

Wynik w konsoli:

```text
1
3
2
```

Mimo że `setTimeout` znajduje się przed `console.log("3")` w kodzie, jego treść wykona się dopiero po około sekundzie - Node.js nie czeka bezczynnie na jego zakończenie.

### Przykład 5: kod synchroniczny

```javascript
console.log("A");
console.log("B");
console.log("C");
```

Wynik zawsze w tej samej kolejności:

```text
A
B
C
```

### Przykład 6: kod asynchroniczny - odczyt pliku

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

W terminalu możemy otrzymać:

```text
Koniec
zawartość pliku
```

Node.js rozpoczął odczytywanie pliku, ale nie czekał na jego zakończenie - wykonał najpierw dalszy kod, a zawartość pliku wypisał, gdy odczyt się zakończył.

### Przykład 7: blokowanie Event Loop (czego unikać)

```javascript
while (true) {
}
```

Program utknie w nieskończonej pętli i nie będzie w stanie obsłużyć żadnych kolejnych żądań. Podobny efekt daje bardzo ciężkie, w pełni synchroniczne obliczenie:

```javascript
function veryHeavyCalculation() {
    // bardzo dużo obliczeń
}

veryHeavyCalculation();
```

Jeżeli takie obliczenia trwają kilka sekund, przez ten czas Event Loop nie może wykonywać żadnych innych zadań JavaScript.

### Przykład 8: inicjalizacja projektu

```bash
mkdir moja-aplikacja
cd moja-aplikacja
npm init
```

npm zada kilka pytań dotyczących projektu. Można też pominąć te pytania i przyjąć wartości domyślne:

```bash
npm init -y
```

### Przykład 9: package.json od podstaw

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

### Przykład 10: instalacja biblioteki i node_modules

```bash
npm install express
```

Po instalacji `package.json` zawiera nową zależność:

```json
"dependencies": {
    "express": "^5.1.0"
}
```

Instalacja zależności developerskiej różni się dodatkową flagą:

```bash
npm install --save-dev nodemon
```

Katalog `node_modules` wykluczamy z repozytorium przez plik `.gitignore`:

```gitignore
node_modules/
```

### Przykład 11: prosty serwer HTTP

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

`req` (od *request*) to obiekt opisujący żądanie, które przyszło od klienta (np. przeglądarki), a `res` (od *response*) to obiekt, przez który wysyłamy odpowiedź z powrotem. Szczegóły `http.createServer` i obu tych obiektów poznajesz dokładnie w kolejnej lekcji poświęconej serwerowi HTTP - tutaj wystarczy zapamiętać ogólny kształt: funkcja wywoływana dla każdego żądania, wewnątrz której ustawiamy odpowiedź.

Uruchomienie:

```bash
node server.js
```

Następnie w przeglądarce otwieramy:

```text
http://localhost:3000
```

### Przykład 12: skrypty npm

W `package.json`:

```json
{
    "scripts": {
        "start": "node server.js",
        "dev": "node server.js"
    }
}
```

Uruchomienie skryptu `start`:

```bash
npm start
```

Uruchomienie dowolnego innego skryptu:

```bash
npm run dev
```

### Przykład 13: node jako interpreter (REPL)

```bash
node
```

W otwartej konsoli:

```text
> 2 + 2
4
> console.log("Hello")
Hello
> .exit
```

### Przykład 14: process i argumenty programu

```javascript
console.log(process.version);
console.log(process.argv);
```

Jeżeli uruchomimy program z dodatkowym argumentem:

```bash
node app.js hello
```

argument `hello` znajdzie się w tablicy `process.argv` - dokładniej pod indeksem `2`, bo pierwsze dwa elementy tej tablicy to zawsze ścieżka do programu `node` i ścieżka do uruchamianego pliku.

### Przykład 15: zmienne środowiskowe

```javascript
const port = process.env.PORT || 3000;

console.log(`Serwer wystartuje na porcie ${port}`);
```

Jeżeli w systemie ustawiona jest zmienna `PORT`, aplikacja użyje jej wartości. W przeciwnym razie użyje domyślnego portu `3000`.

### Przykład 16: cały projekt od zera

```bash
mkdir backend
cd backend
npm init -y
npm install express
```

Tworzymy plik `server.js`:

```javascript
console.log("Backend działa");
```

Uruchamiamy:

```bash
node server.js
```

Projekt po tych krokach ma strukturę:

```text
backend/
│
├── node_modules/
├── package-lock.json
├── package.json
└── server.js
```

Kompletny `package.json` po dodaniu skryptu `start`:

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

Uruchomienie przez skrypt:

```bash
npm start
```

### Ściągawka najważniejszych poleceń

```bash
node -v                          # wersja Node.js
npm -v                           # wersja npm
node server.js                   # uruchomienie pliku
npm init                         # utworzenie projektu (z pytaniami)
npm init -y                      # utworzenie projektu (wartości domyślne)
npm install express              # instalacja zależności
npm install --save-dev nodemon   # instalacja zależności developerskiej
npm install                      # instalacja wszystkich zależności z package.json
npm run <nazwa>                  # uruchomienie dowolnego skryptu
npm start                        # uruchomienie skryptu "start"
```
