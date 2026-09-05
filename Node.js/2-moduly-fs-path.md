# Moduły w Node.js i praca z systemem plików

Krótko: jak dzielić kod na osobne pliki (moduły) oraz jak w Node.js czytać i zapisywać pliki na dysku.

## 1. Czym są moduły?

**Moduł** to po prostu jeden plik z kodem, który można wykorzystać w innym pliku. Zamiast trzymać cały program w jednym ogromnym pliku, dzielimy go na mniejsze części - np. osobny plik do obsługi bazy danych, osobny do funkcji pomocniczych, osobny do tras HTTP.

Node.js obsługuje dwa systemy modułów:

* **CommonJS** - `require()` i `module.exports`. To domyślny system w Node.js od samego początku i wciąż najczęściej spotykany w starszych i mniejszych projektach.
* **ES Modules** (ESM) - `import` i `export`. To standard samego języka JavaScript, znany z frontendu (React, Vite). W Node.js trzeba go świadomie włączyć.

Oba na egzaminie i w pracy się zdarzają, dlatego warto rozpoznawać obie składnie, nawet jeśli w praktyce projekt korzysta zwykle tylko z jednej.

---

## 2. CommonJS - require i module.exports

To domyślny system modułów w Node.js. Każdy plik `.js` jest traktowany jako osobny moduł.

Plik `math.js`:

```javascript
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

module.exports = { add, subtract };
```

`module.exports` to obiekt, który dany plik "wystawia na zewnątrz". Tutaj eksportujemy dwie funkcje w jednym obiekcie.

Plik `app.js`, w tym samym katalogu:

```javascript
const math = require("./math");

console.log(math.add(2, 3));
console.log(math.subtract(5, 2));
```

Wynik:

```text
5
3
```

`require("./math")` wczytuje moduł z pliku `math.js` znajdującego się w tym samym katalogu. Ważne jest `./` na początku - bez niego Node.js szukałby paczki o nazwie `math` w `node_modules`, a nie lokalnego pliku.

Można też eksportować od razu pojedynczą wartość, bez opakowywania jej w obiekt:

```javascript
module.exports = function add(a, b) {
    return a + b;
};
```

```javascript
const add = require("./math");

console.log(add(2, 3));
```

---

## 3. ES Modules - import i export

ES Modules to nowszy, standardowy system modułów samego JavaScriptu. W przeglądarce i w narzędziach takich jak Vite jest domyślny. W Node.js trzeba go włączyć jedną z dwóch metod:

* nadać plikowi rozszerzenie `.mjs`, albo
* dodać w `package.json` pole `"type": "module"` - wtedy wszystkie pliki `.js` w projekcie są traktowane jako ES Modules.

```json
{
    "name": "moj-projekt",
    "type": "module"
}
```

Plik `math.js` (przy `"type": "module"` w package.json):

```javascript
export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}
```

Plik `app.js`:

```javascript
import { add, subtract } from "./math.js";

console.log(add(2, 3));
console.log(subtract(5, 2));
```

W ES Modules rozszerzenie `.js` w imporcie jest wymagane - w przeciwieństwie do `require()`, gdzie można je pominąć.

Można też eksportować jedną, główną wartość jako **eksport domyślny**:

```javascript
export default function add(a, b) {
    return a + b;
}
```

```javascript
import add from "./math.js";

console.log(add(2, 3));
```

Przy eksporcie domyślnym nazwa po stronie importu może być dowolna - nie musi zgadzać się z nazwą funkcji w pliku źródłowym.

---

## 4. CommonJS a ES Modules - porównanie

| CommonJS | ES Modules |
|---|---|
| `require("./plik")` | `import ... from "./plik.js"` |
| `module.exports = ...` | `export ...` / `export default ...` |
| domyślny w Node.js, rozszerzenie `.js` | wymaga `"type": "module"` albo `.mjs` |
| rozszerzenie pliku w imporcie opcjonalne | rozszerzenie pliku w imporcie wymagane |
| dostępne zmienne `__dirname`, `__filename` | brak `__dirname`/`__filename` (trzeba je wyliczyć z `import.meta.url`) |

W praktyce projekt korzysta z jednego z tych systemów konsekwentnie - nie miesza się `require` i `import` w tym samym pliku. Jeśli w zadaniu egzaminacyjnym widzisz `require`, to CommonJS. Jeśli widzisz `import`/`export`, to ES Modules.

---

## 5. Moduł path

Moduł `path` służy do budowania i przetwarzania ścieżek do plików w sposób niezależny od systemu operacyjnego (Windows używa `\`, Linux i macOS używają `/`).

```javascript
const path = require("path");

const fullPath = path.join(__dirname, "dane", "plik.txt");

console.log(fullPath);
```

`path.join()` łączy podane fragmenty w jedną ścieżkę, dbając o poprawne separatory. `__dirname` to zmienna dostępna w CommonJS, zawierająca ścieżkę do katalogu, w którym znajduje się bieżący plik.

Inne przydatne funkcje:

```javascript
path.basename("/dane/plik.txt");   // "plik.txt"
path.extname("/dane/plik.txt");    // ".txt"
path.dirname("/dane/plik.txt");    // "/dane"
```

`path.join()` nie sprawdza, czy plik faktycznie istnieje - tylko sklada tekst ścieżki. Dlatego prawie zawsze warto go używać zamiast ręcznego sklejania ścieżek znakiem `/`, bo ręczne sklejanie łatwo popsuć na innym systemie operacyjnym.

---

## 6. Moduł fs - odczyt i zapis plików

Moduł `fs` (*file system*) pozwala czytać i zapisywać pliki na dysku. Ma dwie rodziny funkcji: **synchroniczne** i **asynchroniczne**.

### Wersja synchroniczna

```javascript
const fs = require("fs");

fs.writeFileSync("dane.txt", "Witaj w pliku!");

const content = fs.readFileSync("dane.txt", "utf8");

console.log(content);
```

`writeFileSync` zapisuje plik i blokuje wykonywanie kodu, dopóki zapis się nie zakończy. `readFileSync` odczytuje plik synchronicznie i zwraca jego zawartość. Drugi argument `"utf8"` mówi Node.js, żeby zwrócić zwykły tekst - bez niego dostalibyśmy surowe dane binarne w postaci `Buffer` (patrz sekcja 9).

Wersja synchroniczna jest prosta w użyciu, ale blokuje Event Loop na czas trwania operacji (patrz `1-podstawy.md`, sekcja o Event Loop). Dla dużych plików albo aplikacji obsługującej wielu użytkowników jednocześnie jest to problem - dlatego w prawdziwym backendzie częściej korzysta się z wersji asynchronicznej.

### Wersja asynchroniczna (callback)

```javascript
const fs = require("fs");

fs.readFile("dane.txt", "utf8", (err, content) => {
    if (err) {
        console.error("Błąd odczytu:", err);
        return;
    }

    console.log(content);
});

console.log("Ten kod wykona się przed odczytem pliku");
```

Funkcja `readFile` nie blokuje wykonywania programu - kolejna linia (`console.log("Ten kod...")`) wykona się od razu, a zawartość pliku pojawi się dopiero, gdy odczyt się zakończy.

### Wersja z Promise i async/await

Node.js udostępnia też wersję modułu `fs` opartą na Promise, w podmodule `fs/promises`:

```javascript
const fs = require("fs/promises");

async function readData() {
    try {
        const content = await fs.readFile("dane.txt", "utf8");
        console.log(content);
    } catch (err) {
        console.error("Błąd odczytu:", err);
    }
}

readData();
```

To ta sama operacja co wersja z callbackiem, ale zapisana za pomocą `async/await`, co często jest czytelniejsze przy kilku operacjach na plikach wykonywanych jedna po drugiej.

---

## 7. Praca z katalogami

`fs` pozwala też tworzyć katalogi i sprawdzać ich zawartość.

```javascript
const fs = require("fs");

if (!fs.existsSync("dane")) {
    fs.mkdirSync("dane");
}

fs.writeFileSync("dane/plik.txt", "Zawartość pliku");

const files = fs.readdirSync("dane");

console.log(files);
```

`existsSync` sprawdza, czy dany plik lub katalog istnieje. `mkdirSync` tworzy katalog - jeśli już istnieje, rzuci błędem, dlatego warto to najpierw sprawdzić albo użyć opcji `{ recursive: true }`. `readdirSync` zwraca tablicę nazw plików i katalogów znajdujących się w podanej ścieżce.

---

## 8. Strumienie (streams) - wprowadzenie

Odczyt całego pliku funkcją `readFile` ma jedną wadę - Node.js musi wczytać cały plik do pamięci naraz, zanim cokolwiek zrobimy z jego zawartością. Dla dużych plików (np. kilka gigabajtów) to nieefektywne albo wręcz niemożliwe.

**Strumień** (*stream*) pozwala przetwarzać dane kawałkami, w miarę jak są dostępne, zamiast czekać na cały plik naraz.

```javascript
const fs = require("fs");

const readStream = fs.createReadStream("duzy-plik.txt", "utf8");
const writeStream = fs.createWriteStream("kopia.txt");

readStream.pipe(writeStream);

readStream.on("end", () => {
    console.log("Kopiowanie zakończone");
});
```

`createReadStream` otwiera plik do odczytu strumieniowego, a `createWriteStream` - do zapisu. Metoda `pipe()` przekazuje dane odczytywane ze strumienia wejściowego bezpośrednio do strumienia wyjściowego, kawałek po kawałku, bez ładowania całego pliku do pamięci. Zdarzenie `"end"` informuje, że strumień wejściowy skończył dostarczać dane.

To ten sam mechanizm, którego Node.js używa wewnętrznie przy obsłudze żądań HTTP - `req` i `res` w serwerze HTTP też są strumieniami (więcej w kolejnym pliku o module `http`).

---

## 9. Bufory (Buffer) - wprowadzenie

**Buffer** to sposób przechowywania w Node.js surowych danych binarnych - czyli sekwencji bajtów, a nie tekstu. Pliki na dysku, dane sieciowe czy obrazy to na najniższym poziomie właśnie ciągi bajtów.

```javascript
const buf = Buffer.from("Hello");

console.log(buf);
console.log(buf.toString());
console.log(buf.length);
```

Wynik:

```text
<Buffer 48 65 6c 6c 6f>
buf.toString() -> Hello
buf.length -> 5
```

`Buffer.from("Hello")` zamienia tekst na jego reprezentację bajtową. `console.log(buf)` pokazuje te bajty zapisane szesnastkowo. Metoda `toString()` zamienia je z powrotem na czytelny tekst (domyślnie zakładając kodowanie UTF-8). `buf.length` zwraca liczbę bajtów, nie znaków - dla zwykłych liter po angielsku to to samo, ale dla polskich znaków (np. "ł", "ż") jeden znak może zajmować więcej niż jeden bajt.

W praktyce na poziomie ucznia technikum wystarczy wiedzieć, że `fs.readFileSync(plik)` bez podanego kodowania zwraca właśnie `Buffer`, a nie gotowy tekst - i że trzeba albo podać kodowanie (`"utf8"`), albo ręcznie wywołać `.toString()`.

---

## 10. Najczęstsze błędy

**Brak `./` przy imporcie lokalnego pliku.**

```javascript
const math = require("math");
```

Node.js będzie szukał paczki `math` w `node_modules`, a nie lokalnego pliku `math.js`. Poprawnie: `require("./math")`.

**Pominięte rozszerzenie pliku w ES Modules.**

```javascript
import { add } from "./math";
```

W ES Modules to rzuci błędem - rozszerzenie `.js` jest wymagane: `import { add } from "./math.js"`.

**Mieszanie `require` i `import` w jednym pliku.** Projekt musi konsekwentnie korzystać z jednego systemu modułów, zgodnie z ustawieniem `"type"` w `package.json`.

**Zapomniane `utf8` przy odczycie pliku tekstowego.**

```javascript
const content = fs.readFileSync("dane.txt");
console.log(content); // Buffer, nie tekst
```

Bez drugiego argumentu `readFileSync` zwraca `Buffer`. Żeby dostać czytelny tekst, trzeba dopisać `"utf8"`.

**Używanie wersji synchronicznej `fs` w kodzie obsługującym wielu użytkowników jednocześnie** (np. w serwerze HTTP) - blokuje to Event Loop dla wszystkich innych żądań na czas trwania operacji na pliku.

---

## Co trzeba zapamiętać

```text
CommonJS
→ require() / module.exports, domyślny w Node.js

ES Modules
→ import / export, wymaga "type": "module" albo .mjs

path.join()
→ bezpieczne łączenie fragmentów ścieżki

fs.readFileSync / fs.writeFileSync
→ operacje synchroniczne, proste, ale blokują Event Loop

fs.readFile (callback) / fs/promises
→ operacje asynchroniczne, nie blokują Event Loop

Stream
→ przetwarzanie danych kawałkami, bez ładowania całości do pamięci

Buffer
→ surowe dane binarne (bajty), np. wynik odczytu pliku bez podanego kodowania
```

## Ćwiczenia

1. Stwórz plik `helpers.js` eksportujący (przez `module.exports`) dwie funkcje: `toUpperCase(text)` i `countWords(text)`. W osobnym pliku zaimportuj je przez `require` i przetestuj na dowolnym zdaniu.
2. Napisz skrypt, który synchronicznie zapisuje do pliku `log.txt` bieżącą datę i godzinę (`new Date().toString()`), a następnie odczytuje ten plik i wypisuje jego zawartość w konsoli.
3. Przepisz poprzedni skrypt tak, żeby korzystał z `fs/promises` i `async/await` zamiast wersji synchronicznej.
4. Skopiuj dowolny plik tekstowy do nowej lokalizacji za pomocą `fs.createReadStream` i `fs.createWriteStream` z metodą `pipe()`.
