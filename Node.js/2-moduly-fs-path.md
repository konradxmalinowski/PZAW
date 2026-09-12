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

## 5. Moduł path - ścieżki do plików i katalogów

Moduł `path` służy do budowania i przetwarzania ścieżek do plików w sposób niezależny od systemu operacyjnego. Windows używa zwykle `\`, a Linux i macOS używają `/`. Jeśli sklejasz ścieżki ręcznie, kod może działać u Ciebie, ale popsuć się na innym komputerze.

W nowszych przykładach często zobaczysz zapis z prefiksem `node:`:

```javascript
const path = require("node:path");
```

`require("path")` też działa. Prefiks `node:` tylko jasno pokazuje, że chodzi o wbudowany moduł Node.js, a nie paczkę z `node_modules`.

Najczęstszy przypadek to zbudowanie ścieżki do pliku leżącego obok aktualnego skryptu:

```javascript
const path = require("node:path");

const filePath = path.join(__dirname, "dane", "plik.txt");

console.log(filePath);
```

`__dirname` to ścieżka do katalogu, w którym znajduje się bieżący plik `.js`. Jeśli uruchomisz program z innego miejsca w terminalu, `__dirname` nadal wskazuje katalog skryptu, a nie katalog terminala.

Warto odróżniać dwie rzeczy:

```javascript
console.log(__dirname);      // katalog, w którym leży ten plik .js
console.log(process.cwd());  // katalog, z którego uruchomiono node
```

W prostych szkolnych skryptach często wychodzi na to samo, ale w prawdziwych projektach nie zawsze. Do ścieżek względem pliku używaj zwykle `__dirname`, a do ścieżek względem miejsca uruchomienia programu - `process.cwd()`.

### Najważniejsze metody path

```javascript
const path = require("node:path");

const example = "/home/uczen/projekt/dane/raport.txt";

console.log(path.basename(example));              // "raport.txt"
console.log(path.basename(example, ".txt"));      // "raport"
console.log(path.extname(example));               // ".txt"
console.log(path.dirname(example));               // "/home/uczen/projekt/dane"
console.log(path.parse(example));
```

`path.parse()` rozbija ścieżkę na części:

```text
{
  root: "/",
  dir: "/home/uczen/projekt/dane",
  base: "raport.txt",
  ext: ".txt",
  name: "raport"
}
```

To przydaje się, gdy chcesz np. zmienić nazwę pliku, zostawiając rozszerzenie:

```javascript
const path = require("node:path");

const file = "zdjecie.png";
const parsed = path.parse(file);
const newName = `${parsed.name}-miniatura${parsed.ext}`;

console.log(newName); // "zdjecie-miniatura.png"
```

Inne przydatne metody:

```javascript
path.join("data", "users", "1.json");        // "data/users/1.json" lub "data\\users\\1.json"
path.resolve("data", "users");              // pełna ścieżka bezwzględna
path.normalize("data//users/../logs");      // porządkuje ścieżkę
path.relative("/app/data", "/app/logs/a");  // "../logs/a"
path.isAbsolute("/app/data");               // true na Linux/macOS
path.format({ dir: "/app", name: "log", ext: ".txt" }); // "/app/log.txt"
```

`path.join()` łączy fragmenty ścieżki. `path.resolve()` też łączy, ale zwraca ścieżkę bezwzględną i bierze pod uwagę aktualny katalog pracy. `path.normalize()` usuwa zbędne fragmenty typu `//`, `.` i `..`. Żadna z tych metod nie sprawdza, czy plik naprawdę istnieje - one tylko budują albo analizują tekst ścieżki.

W ES Modules nie ma gotowego `__dirname`. Można go odtworzyć tak:

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);
```

Na tym etapie możesz głównie kojarzyć ten zapis. W dalszych przykładach tej lekcji używamy CommonJS (`require`), żeby nie mieszać dwóch systemów modułów naraz.

---

## 6. Moduł fs - praca z plikami

Moduł `fs` (*file system*) pozwala czytać, zapisywać, dopisywać, kopiować, przenosić, usuwać i sprawdzać pliki oraz katalogi.

Są trzy style korzystania z `fs`:

| Styl | Przykład | Kiedy używać |
|---|---|---|
| synchroniczny | `fs.readFileSync()` | małe skrypty, proste ćwiczenia, kod startowy |
| callback | `fs.readFile(..., callback)` | starszy kod Node.js, warto umieć przeczytać |
| Promise | `fs/promises` + `async/await` | najczytelniejszy styl w nowym kodzie backendowym |

W dokumentacji Node.js prawie każda operacja ma te trzy wersje:

```text
readFile      - asynchronicznie z callbackiem
readFileSync  - synchronicznie
fs/promises   - asynchronicznie z Promise
```

### Odczyt i zapis synchroniczny

```javascript
const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(__dirname, "dane.txt");

fs.writeFileSync(filePath, "Witaj w pliku!", "utf8");

const content = fs.readFileSync(filePath, "utf8");

console.log(content);
```

`writeFileSync` zapisuje plik. Jeśli plik już istnieje, jego poprzednia zawartość zostanie nadpisana. `readFileSync` odczytuje plik i zwraca jego zawartość. Argument `"utf8"` oznacza, że pracujemy z tekstem. Bez niego Node.js zwróci `Buffer`, czyli surowe bajty.

Wersja synchroniczna jest prosta, ale blokuje Event Loop. To znaczy, że na czas odczytu lub zapisu Node.js nie obsługuje innego kodu JavaScript. W małym skrypcie to zwykle nie problem. W serwerze HTTP obsługującym wielu użytkowników lepiej używać wersji asynchronicznej.

### Odczyt asynchroniczny z callbackiem

```javascript
const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(__dirname, "dane.txt");

fs.readFile(filePath, "utf8", (err, content) => {
    if (err) {
        console.error("Błąd odczytu:", err.message);
        return;
    }

    console.log("Zawartość:", content);
});

console.log("Ten tekst pojawi się przed wynikiem odczytu");
```

Callback dostaje zwykle dwa argumenty: `err` i wynik operacji. Jeśli `err` nie jest puste, coś poszło nie tak, np. plik nie istnieje albo program nie ma uprawnień do odczytu.

### Odczyt i zapis przez Promise

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
    const filePath = path.join(__dirname, "dane.txt");

    try {
        await fs.writeFile(filePath, "Pierwsza linia\n", "utf8");
        await fs.appendFile(filePath, "Druga linia\n", "utf8");

        const content = await fs.readFile(filePath, "utf8");
        console.log(content);
    } catch (err) {
        console.error("Operacja na pliku nie powiodła się:", err.message);
    }
}

main();
```

`fs/promises` jest wygodne, bo można pisać kod od góry do dołu za pomocą `await`, a błędy obsługiwać jednym blokiem `try/catch`.

### Przydatne metody do plików

| Metoda synchroniczna | Metoda Promise | Co robi |
|---|---|---|
| `readFileSync` | `readFile` | odczytuje plik |
| `writeFileSync` | `writeFile` | zapisuje plik od zera, nadpisuje starą zawartość |
| `appendFileSync` | `appendFile` | dopisuje dane na końcu pliku |
| `copyFileSync` | `copyFile` | kopiuje jeden plik do drugiego |
| `renameSync` | `rename` | zmienia nazwę albo przenosi plik |
| `unlinkSync` | `unlink` | usuwa plik |
| `existsSync` | `access` | sprawdza, czy ścieżka istnieje lub jest dostępna |
| `statSync` | `stat` | zwraca informacje o pliku lub katalogu |

Przykład kilku operacji w jednym skrypcie:

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
    const notesPath = path.join(__dirname, "notes.txt");
    const backupPath = path.join(__dirname, "notes-backup.txt");
    const movedPath = path.join(__dirname, "archiwum-notes.txt");

    await fs.writeFile(notesPath, "Start notatek\n", "utf8");
    await fs.appendFile(notesPath, "Dopisany wpis\n", "utf8");
    await fs.copyFile(notesPath, backupPath);
    await fs.rename(backupPath, movedPath);

    const stats = await fs.stat(notesPath);
    console.log("Rozmiar pliku:", stats.size, "bajtów");
    console.log("Czy to plik?", stats.isFile());

    await fs.unlink(movedPath);
}

main().catch((err) => {
    console.error("Błąd:", err.message);
});
```

`rename` ma dwie typowe role: zmiana nazwy w tym samym katalogu albo przeniesienie pliku do innego katalogu. `unlink` usuwa plik, ale nie usuwa katalogu. Do katalogów służą inne metody.

Sprawdzanie, czy plik istnieje, można zrobić prosto przez `existsSync`:

```javascript
const fs = require("node:fs");

if (fs.existsSync("config.json")) {
    console.log("Plik istnieje");
}
```

W kodzie asynchronicznym częściej spotkasz `access`:

```javascript
const fs = require("node:fs/promises");

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}
```

`access` nie zwraca `true` albo `false`. Jeśli ścieżka jest dostępna, kończy się sukcesem. Jeśli nie jest dostępna, rzuca błąd, dlatego opakowujemy ją w `try/catch`.

---

## 7. Pliki JSON - częsty przypadek w ćwiczeniach

W prostych zadaniach dane często trzyma się w pliku `.json`. Schemat pracy wygląda tak:

1. Odczytaj plik jako tekst.
2. Zamień tekst na tablicę lub obiekt przez `JSON.parse`.
3. Zmień dane w JavaScripcie.
4. Zamień dane z powrotem na tekst przez `JSON.stringify`.
5. Zapisz plik.

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

const filePath = path.join(__dirname, "users.json");

async function loadUsers() {
    try {
        const content = await fs.readFile(filePath, "utf8");
        return JSON.parse(content);
    } catch (err) {
        if (err.code === "ENOENT") {
            return [];
        }

        throw err;
    }
}

async function saveUsers(users) {
    const json = JSON.stringify(users, null, 2);
    await fs.writeFile(filePath, json, "utf8");
}

async function main() {
    const users = await loadUsers();

    users.push({
        id: Date.now(),
        name: "Ala"
    });

    await saveUsers(users);
    console.log("Zapisano użytkowników:", users.length);
}

main().catch((err) => {
    console.error("Błąd:", err.message);
});
```

`err.code === "ENOENT"` oznacza, że plik lub katalog nie istnieje. W tym przykładzie brak pliku `users.json` traktujemy jako pustą listę użytkowników. Inne błędy przepuszczamy dalej przez `throw err`, bo mogą oznaczać realny problem, np. uszkodzony JSON albo brak uprawnień.

`JSON.stringify(users, null, 2)` zapisuje JSON z wcięciami, dzięki czemu plik jest czytelny dla człowieka.

---

## 8. Praca z katalogami

`fs` pozwala tworzyć, czytać i usuwać katalogi. W praktyce bardzo często łączy się go z `path`, żeby nie sklejać ścieżek ręcznie.

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
    const dataDir = path.join(__dirname, "data");
    const filePath = path.join(dataDir, "config.json");

    await fs.mkdir(dataDir, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify({
        createdAt: new Date().toISOString()
    }, null, 2), "utf8");

    const entries = await fs.readdir(dataDir);
    console.log(entries);
}

main().catch((err) => {
    console.error("Błąd:", err.message);
});
```

`mkdir(path)` tworzy katalog. Jeśli katalog już istnieje, bez dodatkowych opcji pojawi się błąd. Opcja `{ recursive: true }` oznacza: "utwórz brakujące katalogi po drodze i nie traktuj istniejącego katalogu jako problemu".

```javascript
await fs.mkdir(path.join(__dirname, "data", "logs", "2026"), {
    recursive: true
});
```

`readdir` domyślnie zwraca same nazwy:

```javascript
const names = await fs.readdir("data");
console.log(names); // ["config.json", "logs"]
```

Jeśli chcesz wiedzieć, co jest plikiem, a co katalogiem, użyj opcji `{ withFileTypes: true }`:

```javascript
const fs = require("node:fs/promises");

async function main() {
    const entries = await fs.readdir("data", {
        withFileTypes: true
    });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            console.log("[DIR] ", entry.name);
        } else if (entry.isFile()) {
            console.log("[FILE]", entry.name);
        } else {
            console.log("[INNE]", entry.name);
        }
    }
}

main();
```

`Dirent` to obiekt opisujący jeden wpis w katalogu. Ma metody takie jak `isFile()`, `isDirectory()` i `isSymbolicLink()`.

Do dokładniejszych informacji służy `stat`:

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
    const filePath = path.join(__dirname, "data", "config.json");
    const stats = await fs.stat(filePath);

    console.log("Plik:", stats.isFile());
    console.log("Katalog:", stats.isDirectory());
    console.log("Rozmiar:", stats.size, "bajtów");
    console.log("Ostatnia modyfikacja:", stats.mtime);
}

main();
```

Usuwanie:

```javascript
await fs.unlink("data/config.json");                 // usuwa plik
await fs.rmdir("pusty-katalog");                     // usuwa pusty katalog
await fs.rm("data", { recursive: true, force: true }); // usuwa katalog z zawartością
```

`rmdir` nadaje się tylko do pustych katalogów. Do usuwania katalogu razem z zawartością używa się `rm` z `{ recursive: true }`. Opcja `force: true` sprawia, że brak ścieżki nie kończy programu błędem.

### Prosty podgląd katalogu

Ten przykład wypisuje zawartość katalogu razem z informacją, czy wpis jest plikiem, czy katalogiem:

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

async function listDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            console.log("Katalog:", fullPath);
        } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            console.log("Plik:", fullPath, "-", stats.size, "bajtów");
        }
    }
}

listDirectory(path.join(__dirname, "data")).catch((err) => {
    console.error("Błąd:", err.message);
});
```

---

## 9. Mały przykład praktyczny - notatki w pliku

Poniższy skrypt tworzy katalog `data`, dopisuje notatkę do pliku `notes.txt`, a potem wypisuje cały plik. Treść notatki pobiera z argumentów programu.

Uruchomienie:

```bash
node notes.js "Powtórzyć moduł fs"
```

Plik `notes.js`:

```javascript
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
    const note = process.argv.slice(2).join(" ");

    if (!note) {
        console.log("Użycie: node notes.js \"Treść notatki\"");
        return;
    }

    const dataDir = path.join(__dirname, "data");
    const notesPath = path.join(dataDir, "notes.txt");
    const line = `${new Date().toISOString()} - ${note}\n`;

    await fs.mkdir(dataDir, { recursive: true });
    await fs.appendFile(notesPath, line, "utf8");

    const content = await fs.readFile(notesPath, "utf8");
    console.log(content);
}

main().catch((err) => {
    console.error("Błąd:", err.message);
});
```

W tym przykładzie widać typowy zestaw: `path.join` do ścieżek, `mkdir` do przygotowania katalogu, `appendFile` do dopisywania oraz `readFile` do odczytu wyniku.

---

## 10. Obserwowanie zmian w plikach i katalogach

Node.js potrafi też obserwować zmiany przez `fs.watch`. Przydaje się to np. w narzędziach developerskich, które reagują na zmianę pliku.

```javascript
const fs = require("node:fs");

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

fs.watch("data", (eventType, filename) => {
    console.log("Zdarzenie:", eventType);
    console.log("Plik:", filename);
});

console.log("Obserwuję katalog data. Naciśnij Ctrl+C, żeby zakończyć.");
```

`fs.watch` jest zależne od systemu operacyjnego, więc nie należy budować na nim bardzo delikatnej logiki bez dodatkowych zabezpieczeń. Na poziomie tej lekcji wystarczy wiedzieć, że taka metoda istnieje i że program będzie działał cały czas, dopóki obserwator jest aktywny.

---

## 11. Strumienie (streams) - wprowadzenie

Odczyt całego pliku funkcją `readFile` ma jedną wadę - Node.js musi wczytać cały plik do pamięci naraz, zanim cokolwiek zrobimy z jego zawartością. Dla dużych plików to nieefektywne albo niemożliwe.

**Strumień** (*stream*) pozwala przetwarzać dane kawałkami, w miarę jak są dostępne, zamiast czekać na cały plik naraz.

```javascript
const fs = require("node:fs");
const path = require("node:path");

const sourcePath = path.join(__dirname, "duzy-plik.txt");
const targetPath = path.join(__dirname, "kopia.txt");

const readStream = fs.createReadStream(sourcePath, "utf8");
const writeStream = fs.createWriteStream(targetPath);

readStream.pipe(writeStream);

readStream.on("error", (err) => {
    console.error("Błąd odczytu:", err.message);
});

writeStream.on("error", (err) => {
    console.error("Błąd zapisu:", err.message);
});

writeStream.on("finish", () => {
    console.log("Kopiowanie zakończone");
});
```

`createReadStream` otwiera plik do odczytu strumieniowego, a `createWriteStream` do zapisu. Metoda `pipe()` przekazuje dane ze strumienia odczytu do strumienia zapisu kawałek po kawałku. Zdarzenie `"finish"` na strumieniu zapisu oznacza, że dane zostały zapisane.

Do zwykłego kopiowania małego pliku łatwiej użyć `copyFile`. Strumienie są szczególnie ważne przy dużych plikach, uploadzie, pobieraniu danych z sieci i obsłudze żądań HTTP. `req` i `res` w serwerze HTTP też są strumieniami.

---

## 12. Bufory (Buffer) - wprowadzenie

**Buffer** to sposób przechowywania w Node.js surowych danych binarnych - czyli sekwencji bajtów, a nie tekstu. Pliki na dysku, dane sieciowe czy obrazy to na najniższym poziomie właśnie ciągi bajtów.

```javascript
const buf = Buffer.from("Hello");

console.log(buf);
console.log(buf.toString("utf8"));
console.log(buf.length);
```

Wynik:

```text
<Buffer 48 65 6c 6c 6f>
Hello
5
```

`Buffer.from("Hello")` zamienia tekst na bajty. `console.log(buf)` pokazuje te bajty szesnastkowo. `toString("utf8")` zamienia je z powrotem na czytelny tekst. `buf.length` zwraca liczbę bajtów, nie znaków. Dla zwykłych angielskich liter to często to samo, ale dla polskich znaków jeden znak może zajmować więcej niż jeden bajt.

```javascript
const text = "Zażółć";
const buf = Buffer.from(text, "utf8");

console.log(text.length); // liczba znaków JS
console.log(buf.length);  // liczba bajtów
```

W praktyce zapamiętaj: `fs.readFileSync("plik.txt")` bez kodowania zwraca `Buffer`, a `fs.readFileSync("plik.txt", "utf8")` zwraca tekst.

---

## 13. Najczęstsze błędy

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

**Mieszanie `require` i `import` w jednym pliku.** Projekt powinien konsekwentnie korzystać z jednego systemu modułów, zgodnie z ustawieniem `"type"` w `package.json`.

**Zapomniane `utf8` przy odczycie pliku tekstowego.**

```javascript
const content = fs.readFileSync("dane.txt");
console.log(content); // Buffer, nie tekst
```

Bez drugiego argumentu `readFileSync` zwraca `Buffer`. Żeby dostać czytelny tekst, trzeba dopisać `"utf8"`.

**Używanie wersji synchronicznej `fs` w kodzie obsługującym wielu użytkowników jednocześnie** (np. w serwerze HTTP) - blokuje to Event Loop dla wszystkich innych żądań na czas trwania operacji na pliku.

**Ręczne sklejanie ścieżek.**

```javascript
const filePath = __dirname + "/data/" + fileName;
```

Lepiej:

```javascript
const filePath = path.join(__dirname, "data", fileName);
```

**Mylenie pliku z katalogiem.** `unlink` usuwa pliki, a `rmdir`/`rm` usuwa katalogi. Jeśli nie wiesz, czym jest dana ścieżka, sprawdź ją przez `stat()` albo `readdir(..., { withFileTypes: true })`.

**Zakładanie, że `writeFile` dopisuje dane.** `writeFile` nadpisuje plik. Do dopisywania na końcu służy `appendFile`.

**Brak obsługi błędów asynchronicznych.** Przy `fs/promises` używaj `try/catch` albo `.catch(...)`, bo brak pliku, błędny JSON albo brak uprawnień zakończy program błędem.

---

## Co trzeba zapamiętać

```text
CommonJS
→ require() / module.exports, domyślny w Node.js

ES Modules
→ import / export, wymaga "type": "module" albo .mjs

path.join()
→ bezpieczne łączenie fragmentów ścieżki

path.resolve() / path.parse()
→ ścieżka bezwzględna / rozbicie ścieżki na części

fs.readFileSync / fs.writeFileSync
→ operacje synchroniczne, proste, ale blokują Event Loop

fs.readFile (callback) / fs/promises
→ operacje asynchroniczne, nie blokują Event Loop

fs.appendFile / fs.copyFile / fs.rename / fs.unlink
→ dopisywanie, kopiowanie, przenoszenie i usuwanie plików

fs.mkdir / fs.readdir / fs.stat / fs.rm
→ tworzenie, czytanie, sprawdzanie i usuwanie katalogów

Stream
→ przetwarzanie danych kawałkami, bez ładowania całości do pamięci

Buffer
→ surowe dane binarne (bajty), np. wynik odczytu pliku bez podanego kodowania
```

## Ćwiczenia

1. Stwórz plik `helpers.js` eksportujący (przez `module.exports`) dwie funkcje: `toUpperCase(text)` i `countWords(text)`. W osobnym pliku zaimportuj je przez `require` i przetestuj na dowolnym zdaniu.
2. Napisz skrypt, który synchronicznie zapisuje do pliku `log.txt` bieżącą datę i godzinę (`new Date().toString()`), a następnie odczytuje ten plik i wypisuje jego zawartość w konsoli.
3. Przepisz poprzedni skrypt tak, żeby korzystał z `fs/promises` i `async/await` zamiast wersji synchronicznej.
4. Napisz skrypt, który tworzy katalog `data`, zapisuje plik `config.json`, odczytuje go, parsuje przez `JSON.parse`, dopisuje nowe pole i zapisuje ponownie przez `JSON.stringify`.
5. Napisz skrypt, który wypisuje zawartość katalogu `data` z oznaczeniem `[FILE]` albo `[DIR]`.
6. Skopiuj dowolny plik tekstowy do nowej lokalizacji przez `fs.copyFile`, a potem zmień nazwę kopii przez `fs.rename`.
7. Skopiuj dowolny większy plik tekstowy za pomocą `fs.createReadStream`, `fs.createWriteStream` i metody `pipe()`.
