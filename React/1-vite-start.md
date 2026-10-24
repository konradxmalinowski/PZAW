# Start z React i Vite - projekt SPA od zera

React to biblioteka JavaScript do budowania interfejsów użytkownika. Zamiast pisać całą stronę jako jeden plik HTML, dzielisz ją na mniejsze, niezależne kawałki - **komponenty** - i z nich składasz aplikację. W tym pliku uczysz się, jak taki projekt postawić od zera za pomocą Vite oraz jak wygląda pierwszy komponent.

Zakładam, że znasz już JavaScript oraz podstawy npm z serii Node.js (instalację pakietów, uruchamianie skryptów) - tego tu nie tłumaczę od nowa.

## 1. Czym jest React i czym jest SPA

Klasyczna strona internetowa działa tak: klikasz link, przeglądarka wysyła żądanie do serwera, serwer zwraca nowy, cały plik HTML, przeglądarka przeładowuje całą stronę. Tak działały strony internetowe przez lata i tak nadal działa np. aplikacja z pliku `6-ejs-ssr.md` w serii Node.js.

**SPA** (Single Page Application, aplikacja jednostronicowa) działa inaczej. Przeglądarka wczytuje jeden plik HTML tylko raz, a całą resztą - zmianą widoku, pobieraniem danych, aktualizacją treści - zajmuje się JavaScript, bez przeładowywania strony. Użytkownik ma wrażenie, że porusza się między "stronami", ale w rzeczywistości cały czas jest na tej samej stronie, a JavaScript podmienia jej zawartość.

React to jedna z najpopularniejszych bibliotek do budowania takich aplikacji. Jego podstawowa idea: interfejs dzielisz na komponenty (np. `Navbar`, `ProductCard`, `LoginForm`), każdy komponent odpowiada za swój fragment widoku, a React dba o to, żeby przy zmianie danych odpowiednio zaktualizować to, co użytkownik widzi na ekranie.

React to **biblioteka**, nie framework - sam w sobie zajmuje się tylko widokiem (tym, co widać na ekranie). Routing, zarządzanie stanem globalnym czy komunikacja z API to osobne narzędzia, które dokłada się do projektu w miarę potrzeb - poznasz je w kolejnych plikach tej serii.

## 2. Czym jest Vite

Żeby uruchomić projekt React, potrzebujesz narzędzia, które weźmie Twój kod (JSX, nowoczesny JavaScript) i przygotuje go tak, żeby zadziałał w przeglądarce, a w trakcie pracy odświeżał podgląd przy każdej zmianie w kodzie.

**Vite** (czyt. "wit", od francuskiego "szybko") to obecnie standardowe narzędzie do tego celu. Uruchamia lokalny serwer deweloperski z bardzo szybkim odświeżaniem zmian i buduje finalną, zoptymalizowaną wersję aplikacji pod wdrożenie na serwer.

Nowy projekt tworzysz jednym poleceniem:

```bash
npm create vite@latest moja-aplikacja
```

Kreator zapyta o szablon - wybierasz **React**, a potem wariant językowy - **JavaScript** (albo TypeScript, jeśli już go znasz; w tej serii korzystamy z JavaScriptu).

Po utworzeniu projektu wchodzisz do katalogu, instalujesz zależności i uruchamiasz serwer deweloperski:

```bash
cd moja-aplikacja
npm install
npm run dev
```

Terminal wypisze adres, pod którym działa aplikacja - zwykle:

```text
http://localhost:5173
```

Każda zmiana zapisana w kodzie od razu pojawia się w przeglądarce, bez ręcznego odświeżania strony.

## 3. Struktura projektu

Świeżo utworzony projekt Vite + React wygląda mniej więcej tak:

```text
moja-aplikacja/
│
├── node_modules/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

Najważniejsze pliki:

**`index.html`** - jedyny plik HTML w całym projekcie. W przeciwieństwie do klasycznej strony nie ma w nim żadnej treści widocznej dla użytkownika - jest w nim tylko jeden pusty element, do którego React "wstrzykuje" całą aplikację:

```html
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
```

Wszystko, co użytkownik ostatecznie zobaczy, powstaje w JavaScripcie i trafia właśnie do tego `<div id="root">`.

**`src/main.jsx`** - punkt wejścia aplikacji. To tu React "podpina się" pod element `#root` z `index.html` i uruchamia komponent `App`:

```javascript
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
```

Ten plik zwykle nie jest ruszany na co dzień - konfiguruje się go raz, na starcie projektu.

**`src/App.jsx`** - główny komponent aplikacji. To od niego zaczyna się cała reszta interfejsu - w miarę rozwoju projektu `App` będzie renderował kolejne, coraz mniejsze komponenty.

**`vite.config.js`** - plik konfiguracyjny Vite (np. wtyczka obsługująca React). Na start nie trzeba go ruszać.

**`package.json`** - dokładnie to samo co w projektach Node.js: nazwa projektu, zależności, skrypty. Warto zwrócić uwagę na skrypty dodane przez Vite:

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
}
```

`npm run dev` uruchamia serwer deweloperski, `npm run build` tworzy finalną wersję produkcyjną aplikacji.

## 4. Czym jest JSX

Otwórz `src/App.jsx` i zobaczysz coś, co wygląda jak mieszanka HTML-a i JavaScriptu:

```javascript
function App() {
    return (
        <div>
            <h1>Witaj w React!</h1>
        </div>
    );
}

export default App;
```

To jest **JSX** - rozszerzenie składni JavaScriptu, które pozwala pisać znaczniki podobne do HTML bezpośrednio w kodzie JS. Przeglądarka nie rozumie JSX-a wprost - Vite w trakcie budowania tłumaczy go na zwykłe wywołania funkcji JavaScript. Jako programista piszesz jednak kod, który wygląda niemal jak HTML, co znacznie ułatwia opisywanie interfejsu.

JSX nie jest identyczny z HTML-em. Kilka różnic, na które trzeba uważać:

**Jeden element główny.** Komponent musi zwracać dokładnie jeden element na najwyższym poziomie. To nie zadziała:

```javascript
return (
    <h1>Tytuł</h1>
    <p>Opis</p>
);
```

Trzeba opakować całość w jeden element - najczęściej `<div>`:

```javascript
return (
    <div>
        <h1>Tytuł</h1>
        <p>Opis</p>
    </div>
);
```

Jeśli nie chcesz dodawać zbędnego `<div>` do struktury strony, możesz użyć **Fragmentu** - pustego opakowania, które nie trafia do finalnego HTML-a:

```javascript
return (
    <>
        <h1>Tytuł</h1>
        <p>Opis</p>
    </>
);
```

**`className` zamiast `class`.** Słowo `class` jest zarezerwowane w JavaScripcie (klasy), więc do nadawania klas CSS służy atrybut `className`:

```javascript
<div className="card">...</div>
```

**Atrybuty w camelCase.** Atrybuty HTML zapisane w JSX przechodzą na camelCase, np. `onclick` staje się `onClick`, `tabindex` staje się `tabIndex`.

**Wstawianie kodu JavaScript przez `{}`.** Wewnątrz JSX możesz w dowolnym miejscu wstawić wyrażenie JavaScript, otaczając je klamrami:

```javascript
function App() {
    const name = "Konrad";

    return (
        <div>
            <h1>Witaj, {name}!</h1>
            <p>Suma: {2 + 2}</p>
        </div>
    );
}
```

W miejscu `{name}` React wstawi aktualną wartość zmiennej `name`, a w `{2 + 2}` - wynik działania, czyli `4`. W klamrach może się znaleźć dowolne wyrażenie JavaScript (zmienna, działanie, wywołanie funkcji) - nie mogą tam natomiast stać instrukcje, takie jak `if` czy pętla `for` (do warunków i list wrócimy w kolejnych plikach serii).

**Samozamykające się znaczniki.** Elementy bez treści muszą być zamknięte, nawet jeśli w HTML bywają zapisywane bez tego:

```javascript
<img src="zdjecie.jpg" />
<br />
<input type="text" />
```

## 5. Pierwszy komponent funkcyjny

Komponent w React to zwykła funkcja JavaScript, która zwraca JSX. Nazwa komponentu zawsze zaczyna się wielką literą - to nie jest tylko konwencja, to wymóg: React rozróżnia komponenty od zwykłych znaczników HTML właśnie po wielkości pierwszej litery.

```javascript
function App() {
    const userName = "Ania";
    const isLoggedIn = true;

    return (
        <div className="app">
            <h1>Panel użytkownika</h1>
            <p>Zalogowany jako: {userName}</p>
            <p>Status: {isLoggedIn ? "aktywny" : "nieaktywny"}</p>
        </div>
    );
}

export default App;
```

Co się tu dzieje:

* `userName` i `isLoggedIn` to zwykłe zmienne JavaScript, zadeklarowane wewnątrz funkcji komponentu.
* `{userName}` wstawia wartość zmiennej do treści strony.
* `{isLoggedIn ? "aktywny" : "nieaktywny"}` to operator warunkowy (ten sam, którego używasz w zwykłym JS) - wewnątrz JSX to najprostszy sposób na wyświetlenie jednej z dwóch wartości w zależności od warunku.
* `export default App` udostępnia ten komponent do użycia w innych plikach - właśnie stąd importuje go `main.jsx`.

Komponent `App` renderowany jest przez `main.jsx` w postaci znacznika `<App />` - dokładnie tak samo, jak używa się zwykłego znacznika HTML, tylko z wielkiej litery:

```javascript
createRoot(document.getElementById("root")).render(<App />);
```

Po zapisaniu pliku i przy uruchomionym `npm run dev` przeglądarka od razu pokaże zaktualizowany widok.

## Najczęstsze błędy

**Brak jednego elementu głównego.** Próba zwrócenia dwóch sąsiadujących elementów bez wspólnego opakowania (`<div>` albo Fragmentu) kończy się błędem kompilacji.

**`class` zamiast `className`.** Zadziała, ale React w konsoli przeglądarki wypisze ostrzeżenie, a stylowanie może nie zadziałać tak, jak oczekujesz.

**Mała litera w nazwie komponentu.** `function app() { ... }` użyty jako `<app />` zostanie potraktowany przez React jako nieznany znacznik HTML, a nie jako komponent. Nazwy komponentów zawsze zaczynasz wielką literą.

**Zapomnienie o `{}` przy wstawianiu zmiennej.** Zapis `<p>Witaj, name</p>` wypisze dosłownie tekst "Witaj, name", a nie wartość zmiennej - potrzebne jest `<p>Witaj, {name}</p>`.

**Niezamknięty znacznik bez treści.** `<img src="foo.jpg">` bez ukośnika na końcu jest w JSX błędem składniowym - musi być `<img src="foo.jpg" />`.

## Co trzeba zapamiętać

```text
React
→ biblioteka do budowania interfejsów z komponentów

SPA
→ aplikacja działająca na jednym pliku HTML, resztą steruje JavaScript

Vite
→ narzędzie do tworzenia i uruchamiania projektu React

npm create vite@latest
→ tworzy nowy projekt

npm run dev
→ uruchamia serwer deweloperski

index.html
→ jeden pusty <div id="root">, do którego trafia cała aplikacja

main.jsx
→ punkt wejścia, renderuje komponent App

App.jsx
→ główny komponent aplikacji

JSX
→ składnia łącząca HTML i JavaScript

{wyrażenie}
→ sposób na wstawienie wartości JS do JSX

className
→ odpowiednik atrybutu class w JSX
```
