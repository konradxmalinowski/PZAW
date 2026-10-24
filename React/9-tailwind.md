# Stylizowanie aplikacji - Tailwind CSS i nowoczesny UI

Dotąd komponenty w tej serii miały `className="card"`, `className="navbar"` - nazwy klas, dla których nigdzie nie było ani jednej reguły CSS. Działały tylko w JSX, wizualnie nic się nie działo. W tym pliku dochodzi brakujący element: stylizacja przez Tailwind CSS, czyli sposób pisania CSS bezpośrednio w `className`, bez osobnych plików `.css` pełnych własnych klas.

To ostatni plik w serii lekcji React. Cała droga do tej pory: Vite i JSX → komponenty i props → listy → `useState` → formularze → `fetch`/`useEffect` → routing → Context API → i teraz stylizacja. Kolejny plik w tym katalogu, jeśli powstanie, to już praktyczny projekt, nie kolejna lekcja teorii.

## 1. Czym różni się Tailwind od zwykłego CSS

Klasyczne podejście do CSS: piszesz własną klasę, a w osobnym pliku definiujesz, co ona robi.

```css
.card {
    padding: 16px;
    background-color: #3b82f6;
    color: white;
    border-radius: 8px;
}
```

```javascript
<div className="card">...</div>
```

Tailwind odwraca ten schemat. Zamiast wymyślać nazwę klasy i osobno pisać dla niej reguły, składasz gotowe, małe klasy narzędziowe (**utility classes**) bezpośrednio w `className` - każda odpowiada za jedną, konkretną właściwość CSS:

```javascript
<div className="p-4 bg-blue-500 text-white rounded-lg">...</div>
```

`p-4` to padding, `bg-blue-500` to kolor tła, `text-white` to kolor tekstu, `rounded-lg` to zaokrąglone rogi. Efekt wizualny identyczny jak w wersji z `.card`, ale bez przełączania się między plikiem JSX a plikiem CSS i bez wymyślania nazw klas, które i tak nikt poza Tobą nie zobaczy. To podejście nazywa się **utility-first**.

## 2. Instalacja w projekcie Vite

Aktualna wersja to Tailwind CSS 4, z prostszą instalacją niż starsze tutoriale mogą sugerować. Jeśli trafisz na przykład z poleceniem `npx tailwindcss init -p` i plikiem `tailwind.config.js` pełnym ustawień - to opis starszej wersji 3. Tu pokazana jest aktualna metoda, przez oficjalny plugin do Vite.

Instalacja pakietów:

```bash
npm install tailwindcss @tailwindcss/vite
```

Dodanie pluginu w `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
});
```

W głównym pliku CSS (zwykle `src/index.css`, importowanym w `main.jsx`) zostaje jedna linijka:

```css
@import "tailwindcss";
```

Od tego momentu każda klasa Tailwind użyta w `className` działa - bez dodatkowej konfiguracji.

## 3. Podstawowe klasy utility

### Odstępy

```javascript
<div className="p-4">padding ze wszystkich stron</div>
<div className="px-4 py-2">padding poziomy i pionowy osobno</div>
<div className="m-4">margines</div>
<div className="mt-2 mb-4">margines góra / dół</div>
<div className="flex gap-4">odstęp między elementami flex</div>
```

Liczba po myślniku to wielokrotność stałej jednostki Tailwinda (`4` to `1rem`, czyli 16px) - nie piksele bezpośrednio.

### Kolory

```javascript
<div className="bg-blue-500 text-white">tło i kolor tekstu</div>
<p className="text-gray-600">tekst w odcieniu szarości</p>
```

Każdy kolor ma skalę od `50` (bardzo jasny) do `900` (bardzo ciemny) - `bg-blue-500` to podstawowy niebieski, `bg-blue-100` jasnoniebieskie tło, `bg-blue-800` ciemny granat.

### Typografia

```javascript
<h1 className="text-2xl font-bold">Duży, pogrubiony nagłówek</h1>
<p className="text-sm text-gray-500">Mały, wyszarzony opis</p>
```

### Flexbox i grid

```javascript
<div className="flex items-center justify-between">
    <span>Lewa strona</span>
    <span>Prawa strona</span>
</div>

<div className="grid grid-cols-3 gap-4">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>
```

`flex` włącza flexbox, `items-center` wyrównuje elementy w pionie, `justify-between` rozpycha je do krawędzi. `grid-cols-3` dzieli kontener na trzy równe kolumny.

### Zaokrąglenia i cienie

```javascript
<div className="rounded-lg shadow-md">karta z zaokrąglonymi rogami i cieniem</div>
```

## 4. Responsywność

Tailwind jest **mobile-first**: klasa bez prefiksu obowiązuje na wszystkich szerokościach ekranu, a prefiks (`sm:`, `md:`, `lg:`, `xl:`) nadpisuje ją *od danej szerokości w górę*, nie tylko na niej.

```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

Jedna kolumna na telefonie, dwie od szerokości `md` (768px) w górę, trzy od `lg` (1024px) w górę. Nie ma osobnej klasy "tylko na tablecie" - `md:` obowiązuje na tablecie i na wszystkim szerszym, dopóki nie nadpisze jej kolejny, szerszy prefiks.

## 5. Stany: hover i focus

```javascript
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
    Kliknij
</button>

<input className="border border-gray-300 focus:border-blue-500 focus:outline-none" />
```

`hover:bg-blue-600` znaczy: ta klasa włącza się tylko przy najechaniu myszą. Bazowy kolor (`bg-blue-500`) obowiązuje zawsze, `hover:` go tymczasowo nadpisuje.

## 6. Przykład: komponenty z pliku 2, ostylowane

W poprzednim pliku `Card` i `Navbar` miały `className="card"` i `className="navbar"` bez żadnego efektu wizualnego. Oto te same komponenty z Tailwindem:

```javascript
function Navbar({ shopName }) {
    return (
        <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-4">
            <h1 className="text-xl font-bold">{shopName}</h1>
        </nav>
    );
}

export default Navbar;
```

```javascript
function Card({ title, price }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-gray-500">Cena: {price} zł</p>
        </div>
    );
}

export default Card;
```

```javascript
function Button({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg"
        >
            {label}
        </button>
    );
}

export default Button;
```

Złożenie w `App.jsx` - kilka kart w responsywnej siatce:

```javascript
import Navbar from "./Navbar.jsx";
import Card from "./Card.jsx";

function App() {
    return (
        <div>
            <Navbar shopName="Elektro-Sklep" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <Card title="Klawiatura mechaniczna" price={249} />
                <Card title="Myszka bezprzewodowa" price={99} />
                <Card title="Podkładka pod mysz" price={39} />
            </div>
        </div>
    );
}

export default App;
```

Ten sam kod komponentów co w pliku 2, jedyna różnica to zawartość `className` - a efekt wizualny jest zupełnie inny: ciemny pasek nawigacji, karty z cieniem reagujące na najechanie, responsywna siatka układająca się od jednej do trzech kolumn zależnie od szerokości ekranu.

## 7. Podstawy optymalizacji: React.memo

Osobny temat, luźno związany ze stylizacją, ale w tym samym zakresie z arkusza: gdy komponent nadrzędny się renderuje, domyślnie renderują się też wszystkie jego komponenty potomne - nawet jeśli ich propsy się nie zmieniły. Zwykle nie ma to znaczenia, ale w większych aplikacjach z wieloma elementami może zacząć spowalniać interfejs.

`React.memo` opakowuje komponent tak, że React pomija jego ponowne renderowanie, jeśli propsy są takie same jak poprzednio:

```javascript
import { memo } from "react";

function Card({ title, price }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-gray-500">Cena: {price} zł</p>
        </div>
    );
}

export default memo(Card);
```

Jeśli `App` renderuje się ponownie (np. przez zmianę jakiegoś niezwiązanego stanu), a propsy konkretnej karty `Card` się nie zmieniły, `memo` sprawia, że ta karta nie jest renderowana od nowa. To narzędzie do sięgania wtedy, gdy faktycznie widać spowolnienie - nie coś, co owija się wokół każdego komponentu z automatu. Bardziej zaawansowane narzędzia z tej samej rodziny, `useMemo` i `useCallback`, zostają na później - na tym poziomie wystarczy wiedzieć, że `React.memo` istnieje i po co jest.

## Najczęstsze błędy

**Literówka w nazwie klasy.** `bg-blu-500` zamiast `bg-blue-500` nie wywoła żadnego błędu w konsoli - po prostu nic się nie ostylizuje. Tailwind nie sprawdza, czy klasa "ma sens", więc literówki trzeba wyłapywać wzrokiem.

**Zła kolejność modyfikatora.** Prefiks zawsze poprzedza właściwą klasę: `hover:bg-blue-600`, nie `bg-blue-600:hover`. To samo dotyczy `md:`, `focus:` i innych prefiksów.

**Mylne rozumienie responsywności.** `md:grid-cols-2` nie znaczy "tylko na tabletach" - znaczy "od szerokości `md` w górę", czyli też na desktopie, jeśli nic tego nie nadpisze wyższym prefiksem.

**Nadmierne mnożenie klas w jednym miejscu.** Gdy ten sam zestaw dziesięciu klas powtarza się w kilku miejscach kodu, to sygnał, żeby wydzielić komponent (jak `Card` czy `Button`), a nie kopiować `className` wszędzie ręcznie.

## Co trzeba zapamiętać

```text
utility-first
→ styl budowany z małych, gotowych klas w className, bez osobnego CSS

p-4, bg-blue-500, text-white, rounded-lg
→ przykłady klas: padding, tło, kolor tekstu, zaokrąglenie

mobile-first
→ klasa bez prefiksu działa wszędzie, prefiks (md:, lg:) nadpisuje ją od danej szerokości w górę

hover:, focus:
→ klasa włącza się tylko w danym stanie elementu

React.memo
→ pomija ponowne renderowanie komponentu, gdy jego propsy się nie zmieniły
```

Tym plikiem kończy się seria lekcji React w tym kursie - od pustego projektu Vite, przez komponenty, stan, komunikację z API i routing, aż po wygląd gotowy do pokazania. Kolejny krok to połączenie tego z backendem logowania z serii Node.js w jeden, działający projekt.
