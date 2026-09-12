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

Najczęstszy przypadek to zbudowanie ścieżki do pliku leżącego obok aktualnego skryptu:

```javascript
const path = require("path");

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
const path = require("path");

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
const path = require("path");

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

W tej lekcji używamy trzech stylów pracy z `fs`:

| Styl | Przykład | Jak działa |
|---|---|---|
| synchroniczny | `fs.readFileSync()` | program czeka, aż operacja się zakończy |
| callbackowy | `fs.readFile(..., callback)` | program zleca operację, a wynik dostaje później w funkcji callback |
| przez Promise | `fs.promises.readFile()` | program zleca operację i czeka na wynik przez `await`, bez blokowania Event Loop |

Nie mieszamy tych stylów w jednym przykładzie. Jeśli używasz wersji synchronicznej, nazwy metod kończą się zwykle na `Sync`. Jeśli używasz callbacków, przekazujesz funkcję jako ostatni argument. Jeśli używasz Promise, bierzesz metody z `fs.promises` i korzystasz z `async`/`await`.

### Zapis i odczyt synchroniczny

Zanim przejdziemy do kodu - w przykładzie poniżej pojawia się blok `try { ... } catch (error) { ... }`. Kod w środku `try` wykonuje się normalnie, ale jeśli w trakcie coś pójdzie nie tak (np. plik nie istnieje albo brakuje uprawnień), operacja rzuca błąd - program nie kończy się awarią, tylko od razu przeskakuje do bloku `catch`, gdzie `error` opisuje, co się nie udało. Bez `try/catch` taki błąd zatrzymałby cały program.

```javascript
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "app.txt");

try {
    fs.writeFileSync(filePath, "Pierwsza linia\n", "utf8");
    fs.appendFileSync(filePath, "Druga linia\n", "utf8");

    const content = fs.readFileSync(filePath, "utf8");
    console.log(content);
} catch (error) {
    console.error("Błąd:", error.message);
}
```

`writeFileSync` zapisuje plik od zera. Jeśli plik już istnieje, jego poprzednia zawartość zostanie nadpisana. `appendFileSync` dopisuje tekst na końcu pliku. `readFileSync` odczytuje plik i zwraca jego zawartość.

Argument `"utf8"` oznacza, że pracujemy z tekstem. Bez niego Node.js zwróci `Buffer`, czyli surowe bajty.

Wersja synchroniczna jest prosta i dobra do pierwszych ćwiczeń, ale blokuje Event Loop. To znaczy, że na czas odczytu lub zapisu Node.js nie wykonuje dalszego kodu JavaScript.

### Zapis i odczyt asynchroniczny z callbackiem

```javascript
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "app.txt");

fs.writeFile(filePath, "Pierwsza linia\n", "utf8", (error) => {
    if (error) {
        console.error("Błąd zapisu:", error.message);
        return;
    }

    fs.appendFile(filePath, "Druga linia\n", "utf8", (error) => {
        if (error) {
            console.error("Błąd dopisywania:", error.message);
            return;
        }

        fs.readFile(filePath, "utf8", (error, content) => {
            if (error) {
                console.error("Błąd odczytu:", error.message);
                return;
            }

            console.log(content);
        });
    });
});

console.log("Ten tekst pojawi się przed wynikiem odczytu");
```

W wersji callbackowej ostatnim argumentem metody jest funkcja, która uruchomi się dopiero po zakończeniu operacji. Pierwszy argument callbacka to zwykle `error`. Jeśli `error` istnieje, operacja się nie udała, więc trzeba obsłużyć błąd i przerwać dalsze kroki.

W tym przykładzie operacje są zagnieżdżone, bo kolejność ma znaczenie: najpierw zapis, potem dopisanie, potem odczyt. Gdyby te trzy funkcje wywołać jedna pod drugą bez zagnieżdżania, Node.js rozpocząłby je prawie jednocześnie i kolejność wyniku nie byłaby gwarantowana.

### Zapis i odczyt przez Promise (fs.promises)

Trzeci styl opiera się na `Promise`. **`Promise`** to obiekt, który reprezentuje wynik operacji asynchronicznej, zanim jeszcze ten wynik jest gotowy - można go traktować jak "obietnicę", że za chwilę dostaniemy albo poprawny wynik, albo błąd. Słowo `async` przed `function` oznacza, że wewnątrz tej funkcji można używać `await`. `await` "czeka" na zakończenie `Promise` i podstawia bezpośrednio jego wynik do zmiennej - dzięki temu kod wygląda niemal tak samo jak wersja synchroniczna, ale w tle nadal nie blokuje Event Loop.

```javascript
const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "app.txt");

async function main() {
    try {
        await fs.writeFile(filePath, "Pierwsza linia\n", "utf8");
        await fs.appendFile(filePath, "Druga linia\n", "utf8");

        const content = await fs.readFile(filePath, "utf8");
        console.log(content);
    } catch (error) {
        console.error("Błąd:", error.message);
    }
}

main();
```

`require("fs").promises` daje dostęp do wersji metod `fs`, które zamiast callbacka zwracają `Promise`. Dzięki temu można używać `async`/`await`, a błędy obsługiwać jednym blokiem `try/catch` - podobnie jak w wersji synchronicznej, ale bez blokowania Event Loop. Kolejność operacji nadal jest gwarantowana, bo każde `await` czeka na zakończenie poprzedniej operacji, zanim przejdzie do następnej linii.

`fs.promises.writeFile` to inna funkcja niż zwykłe, callbackowe `fs.writeFile`. Nie można użyć `await` na wersji callbackowej - ona nie zwraca żadnej wartości, więc `await` nic by tam nie dał.

### Przydatne metody do plików

| Synchronicznie | Callbackowo | Przez Promise | Co robi |
|---|---|---|---|
| `readFileSync` | `readFile` | `fs.promises.readFile` | odczytuje plik |
| `writeFileSync` | `writeFile` | `fs.promises.writeFile` | zapisuje plik od zera, nadpisuje starą zawartość |
| `appendFileSync` | `appendFile` | `fs.promises.appendFile` | dopisuje dane na końcu pliku |
| `copyFileSync` | `copyFile` | `fs.promises.copyFile` | kopiuje jeden plik do drugiego |
| `renameSync` | `rename` | `fs.promises.rename` | zmienia nazwę albo przenosi plik |
| `unlinkSync` | `unlink` | `fs.promises.unlink` | usuwa plik |
| `existsSync` | `access` | `fs.promises.access` | sprawdza, czy ścieżka istnieje lub jest dostępna |
| `statSync` | `stat` | `fs.promises.stat` | zwraca informacje o pliku lub katalogu |

Przykład kilku operacji synchronicznych w jednym skrypcie:

```javascript
const fs = require("fs");
const path = require("path");

const notesPath = path.join(__dirname, "notes.txt");
const backupPath = path.join(__dirname, "notes-backup.txt");
const movedPath = path.join(__dirname, "archiwum-notes.txt");

try {
    fs.writeFileSync(notesPath, "Start notatek\n", "utf8");
    fs.appendFileSync(notesPath, "Dopisany wpis\n", "utf8");
    fs.copyFileSync(notesPath, backupPath);
    fs.renameSync(backupPath, movedPath);

    const stats = fs.statSync(notesPath);
    console.log("Rozmiar pliku:", stats.size, "bajtów");
    console.log("Czy to plik?", stats.isFile());

    fs.unlinkSync(movedPath);
} catch (error) {
    console.error("Błąd:", error.message);
}
```

`rename` ma dwie typowe role: zmiana nazwy w tym samym katalogu albo przeniesienie pliku do innego katalogu. `unlink` usuwa plik, ale nie usuwa katalogu.

Sprawdzanie, czy plik istnieje, można zrobić przez `existsSync`:

```javascript
const fs = require("fs");

if (fs.existsSync("config.json")) {
    console.log("Plik istnieje");
}
```

Callbackowy odpowiednik sprawdzenia dostępu to `access`:

```javascript
const fs = require("fs");

fs.access("config.json", (error) => {
    if (error) {
        console.log("Plik nie istnieje albo nie jest dostępny");
        return;
    }

    console.log("Plik jest dostępny");
});
```

---

## 7. Pliki JSON - częsty przypadek w ćwiczeniach

**JSON** (*JavaScript Object Notation*) to format zapisu danych jako zwykły tekst, wyglądający podobnie do obiektu i tablicy w JavaScript, np. `{"name": "Ala", "age": 10}`. Plik zapisany na dysku to zawsze tylko tekst - JSON to jeden z najpopularniejszych sposobów zapisania w tym tekście czegoś bardziej złożonego niż pojedyncze zdanie, np. listy użytkowników.

W prostych zadaniach dane często trzyma się w pliku `.json`. Schemat pracy wygląda tak:

1. Odczytaj plik jako tekst.
2. Zamień tekst na tablicę lub obiekt przez `JSON.parse` (funkcja wbudowana w JavaScript, nie w Node.js - działa też w przeglądarce).
3. Zmień dane w JavaScripcie.
4. Zamień dane z powrotem na tekst przez `JSON.stringify`.
5. Zapisz plik.

```javascript
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "users.json");

function loadUsers() {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
}

function saveUsers(users) {
    const json = JSON.stringify(users, null, 2);
    fs.writeFileSync(filePath, json, "utf8");
}

try {
    const users = loadUsers();

    users.push({
        id: Date.now(),
        name: "Ala"
    });

    saveUsers(users);
    console.log("Zapisano użytkowników:", users.length);
} catch (error) {
    console.error("Błąd:", error.message);
}
```

`JSON.stringify(users, null, 2)` zapisuje JSON z wcięciami, dzięki czemu plik jest czytelny dla człowieka. Jeśli plik JSON jest uszkodzony, `JSON.parse` rzuci błąd, dlatego cały przykład jest opakowany w `try/catch`.

---

## 8. Praca z katalogami

`fs` pozwala tworzyć, czytać i usuwać katalogi. W praktyce bardzo często łączy się go z `path`, żeby nie sklejać ścieżek ręcznie.

```javascript
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const filePath = path.join(dataDir, "config.json");

try {
    fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(filePath, JSON.stringify({
        createdAt: new Date().toISOString()
    }, null, 2), "utf8");

    const entries = fs.readdirSync(dataDir);
    console.log(entries);
} catch (error) {
    console.error("Błąd:", error.message);
}
```

`mkdirSync(path)` tworzy katalog. Jeśli katalog już istnieje, bez dodatkowych opcji pojawi się błąd. Opcja `{ recursive: true }` oznacza: "utwórz brakujące katalogi po drodze i nie traktuj istniejącego katalogu jako problemu".

```javascript
fs.mkdirSync(path.join(__dirname, "data", "logs", "2026"), {
    recursive: true
});
```

`readdirSync` domyślnie zwraca same nazwy:

```javascript
const names = fs.readdirSync("data");
console.log(names); // ["config.json", "logs"]
```

Jeśli chcesz wiedzieć, co jest plikiem, a co katalogiem, użyj opcji `{ withFileTypes: true }`:

```javascript
const fs = require("fs");

const entries = fs.readdirSync("data", {
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
```

`Dirent` to obiekt opisujący jeden wpis w katalogu. Ma metody takie jak `isFile()`, `isDirectory()` i `isSymbolicLink()`.

Do dokładniejszych informacji służy `statSync`:

```javascript
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "data", "config.json");
const stats = fs.statSync(filePath);

console.log("Plik:", stats.isFile());
console.log("Katalog:", stats.isDirectory());
console.log("Rozmiar:", stats.size, "bajtów");
console.log("Ostatnia modyfikacja:", stats.mtime);
```

Callbackowo `readdir` wygląda tak:

```javascript
const fs = require("fs");

fs.readdir("data", { withFileTypes: true }, (error, entries) => {
    if (error) {
        console.error("Błąd odczytu katalogu:", error.message);
        return;
    }

    for (const entry of entries) {
        console.log(entry.isDirectory() ? "[DIR]" : "[FILE]", entry.name);
    }
});
```

Usuwanie:

```javascript
fs.unlinkSync("data/config.json");                    // usuwa plik
fs.rmdirSync("pusty-katalog");                        // usuwa pusty katalog
fs.rmSync("data", { recursive: true, force: true });   // usuwa katalog z zawartością
```

`rmdirSync` nadaje się tylko do pustych katalogów. Do usuwania katalogu razem z zawartością używa się `rmSync` z `{ recursive: true }`. Opcja `force: true` sprawia, że brak ścieżki nie kończy programu błędem.

---

## 9. Mały przykład praktyczny - notatki w pliku

Poniższy skrypt tworzy katalog `data`, dopisuje notatkę do pliku `notes.txt`, a potem wypisuje cały plik. Treść notatki pobiera z argumentów programu.

Uruchomienie:

```bash
node notes.js "Powtórzyć moduł fs"
```

Plik `notes.js`:

```javascript
const fs = require("fs");
const path = require("path");

const note = process.argv.slice(2).join(" ");

if (!note) {
    console.log("Użycie: node notes.js \"Treść notatki\"");
    process.exit(0);
}

const dataDir = path.join(__dirname, "data");
const notesPath = path.join(dataDir, "notes.txt");
const line = `${new Date().toISOString()} - ${note}\n`;

try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(notesPath, line, "utf8");

    const content = fs.readFileSync(notesPath, "utf8");
    console.log(content);
} catch (error) {
    console.error("Błąd:", error.message);
}
```

`process.argv` to tablica argumentów, z którymi uruchomiono program w terminalu. Pierwsze dwa elementy to zawsze ścieżka do `node` i ścieżka do uruchamianego pliku, dlatego własne argumenty (tu: treść notatki) zaczynają się dopiero od trzeciego elementu - stąd `slice(2)`. `process.exit(0)` od razu kończy program; `0` oznacza "zakończono bez błędu".

W tym przykładzie widać typowy zestaw: `path.join` do ścieżek, `mkdirSync` do przygotowania katalogu, `appendFileSync` do dopisywania oraz `readFileSync` do odczytu wyniku.

---

## 10. Obserwowanie zmian w plikach i katalogach

Node.js potrafi też obserwować zmiany przez `fs.watch`. Przydaje się to np. w narzędziach developerskich, które reagują na zmianę pliku.

```javascript
const fs = require("fs");

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

fs.watch("data", (eventType, filename) => {
    console.log("Zdarzenie:", eventType);
    console.log("Plik:", filename);
});

console.log("Obserwuję katalog data. Naciśnij Ctrl+C, żeby zakończyć.");
```

`fs.watch` używa callbacka, który uruchamia się po zmianie w obserwowanym katalogu. Ta metoda zależy od systemu operacyjnego, więc na tym etapie wystarczy wiedzieć, że istnieje i że program działa cały czas, dopóki obserwator jest aktywny.

---

## 11. Strumienie (streams) - wprowadzenie

Odczyt całego pliku funkcją `readFile` ma jedną wadę - Node.js musi wczytać cały plik do pamięci naraz, zanim cokolwiek zrobimy z jego zawartością. Dla dużych plików to nieefektywne albo niemożliwe.

**Strumień** (*stream*) pozwala przetwarzać dane kawałkami, w miarę jak są dostępne, zamiast czekać na cały plik naraz.

```javascript
const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "duzy-plik.txt");
const targetPath = path.join(__dirname, "kopia.txt");

const readStream = fs.createReadStream(sourcePath, "utf8");
const writeStream = fs.createWriteStream(targetPath);

readStream.pipe(writeStream);

readStream.on("error", (error) => {
    console.error("Błąd odczytu:", error.message);
});

writeStream.on("error", (error) => {
    console.error("Błąd zapisu:", error.message);
});

writeStream.on("finish", () => {
    console.log("Kopiowanie zakończone");
});
```

`createReadStream` otwiera plik do odczytu strumieniowego, a `createWriteStream` do zapisu. Metoda `pipe()` przekazuje dane ze strumienia odczytu do strumienia zapisu kawałek po kawałku. Zdarzenie `"finish"` na strumieniu zapisu oznacza, że dane zostały zapisane.

Do zwykłego kopiowania małego pliku łatwiej użyć `copyFileSync` albo `copyFile`. Strumienie są szczególnie ważne przy dużych plikach, uploadzie, pobieraniu danych z sieci i obsłudze żądań HTTP. `req` i `res` w serwerze HTTP też są strumieniami.

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

**Mieszanie stylów `fs`.**

```javascript
const fs = require("fs");

fs.writeFile("app.txt", "Tekst", "utf8");
```

To jest zły zapis, bo `fs.writeFile` w stylu callbackowym wymaga funkcji callback jako ostatniego argumentu. Jeśli temat ćwiczenia jest synchroniczny, użyj `writeFileSync`. Jeśli temat ćwiczenia jest callbackowy, przekaż callback jako ostatni argument. Jeśli temat ćwiczenia jest oparty na Promise, bierz metody z `fs.promises` i użyj `await`.

**Brak obsługi błędów w callbacku.** Przy metodach callbackowych zawsze sprawdzaj pierwszy argument callbacka, np. `error`.

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

fs.readFile / fs.writeFile / fs.appendFile
→ operacje asynchroniczne przez callback

fs.promises.readFile / fs.promises.writeFile
→ operacje asynchroniczne przez Promise, używane z async/await

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
3. Przepisz poprzedni skrypt tak, żeby korzystał z callbacków (`fs.writeFile` i `fs.readFile`) zamiast wersji synchronicznej.
4. Napisz skrypt, który tworzy katalog `data`, zapisuje plik `config.json`, odczytuje go, parsuje przez `JSON.parse`, dopisuje nowe pole i zapisuje ponownie przez `JSON.stringify`.
5. Napisz skrypt, który wypisuje zawartość katalogu `data` z oznaczeniem `[FILE]` albo `[DIR]`.
6. Skopiuj dowolny plik tekstowy do nowej lokalizacji przez `fs.copyFileSync`, a potem zmień nazwę kopii przez `fs.renameSync`.
7. Skopiuj dowolny większy plik tekstowy za pomocą `fs.createReadStream`, `fs.createWriteStream` i metody `pipe()`.
8. Przepisz skrypt z zadania 2 tak, żeby korzystał z `fs.promises` i `async`/`await` zamiast wersji synchronicznej.
