# Komponenty funkcyjne, props i kompozycja interfejsu

W poprzednim pliku cały interfejs mieścił się w jednym komponencie `App`. Realna aplikacja tak nie wygląda - `App` dzieli się na mniejsze komponenty, a te przyjmują dane z zewnątrz przez **props**. W tym pliku uczysz się, jak taki podział wygląda w praktyce.

## 1. Komponent jako funkcja

Komponent funkcyjny to zwykła funkcja JavaScript, która zwraca JSX. Nic więcej - żadnej specjalnej składni, żadnej klasy. Dotąd cały kod trzymałeś w jednym pliku `App.jsx`. Teraz zaczynasz wydzielać kolejne komponenty do osobnych plików.

Załóżmy, że chcesz pokazać kartę produktu. Tworzysz plik `src/Card.jsx`:

```javascript
function Card() {
    return (
        <div className="card">
            <h2>Nazwa produktu</h2>
            <p>Opis produktu</p>
        </div>
    );
}

export default Card;
```

I używasz go w `App.jsx`, dokładnie tak jak znacznika HTML - tylko z importem:

```javascript
import Card from "./Card.jsx";

function App() {
    return (
        <div>
            <h1>Sklep</h1>
            <Card />
        </div>
    );
}

export default App;
```

Problem: `Card` w tej wersji zawsze pokazuje ten sam tekst. Żeby jednym komponentem opisać wiele różnych produktów, potrzebujesz sposobu na przekazanie mu danych z zewnątrz - i tu wchodzą props.

## 2. Czym są props

**Props** (od *properties*) to dane przekazywane do komponentu z miejsca, w którym go używasz - podobnie jak atrybuty przekazuje się znacznikowi HTML.

```javascript
<Card title="Klawiatura mechaniczna" price={249} />
```

Wewnątrz komponentu wszystkie przekazane propsy trafiają do jednego obiektu, który React podaje jako pierwszy argument funkcji:

```javascript
function Card(props) {
    return (
        <div className="card">
            <h2>{props.title}</h2>
            <p>Cena: {props.price} zł</p>
        </div>
    );
}
```

`props.title` i `props.price` to dokładnie te wartości, które przekazałeś w `<Card title="..." price={...} />`. Zwróć uwagę, że stringi w JSX zapisuje się w cudzysłowie (`title="Klawiatura..."`), a wszystko, co nie jest zwykłym tekstem - liczby, zmienne, wyrażenia - w klamrach (`price={249}`).

## 3. Destrukturyzacja propsów

Odwoływanie się do `props.title`, `props.price` przy każdym polu robi się szybko nieczytelne. Dużo wygodniej jest zdestrukturyzować props bezpośrednio w parametrach funkcji - dokładnie tak, jak destrukturyzujesz zwykły obiekt w JS:

```javascript
function Card({ title, price }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>Cena: {price} zł</p>
        </div>
    );
}
```

Efekt jest identyczny jak w poprzedniej wersji, ale kod jest krótszy i od razu widać, jakich propsów komponent oczekuje - to jest w praktyce forma używana w niemal każdym projekcie React, trzymaj się jej.

Użycie w `App` wygląda tak samo, niezależnie od tego, czy `Card` destrukturyzuje propsy czy nie - to, co dzieje się wewnątrz funkcji, nie ma na to wpływu:

```javascript
function App() {
    return (
        <div>
            <h1>Sklep</h1>
            <Card title="Klawiatura mechaniczna" price={249} />
            <Card title="Myszka bezprzewodowa" price={99} />
        </div>
    );
}
```

Dwa użycia tego samego komponentu, dwa różne zestawy danych, dwie różne karty na ekranie. O to właśnie chodzi w komponentach - piszesz logikę raz, a używasz jej wielokrotnie.

## 4. Jakie dane można przekazać przez props

Przez props można przekazać dosłownie każdą wartość JavaScript: string, liczbę, boolean, tablicę, obiekt, a nawet funkcję.

```javascript
function Card({ title, price, inStock }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>Cena: {price} zł</p>
            <p>{inStock ? "Dostępny" : "Brak w magazynie"}</p>
        </div>
    );
}
```

```javascript
<Card title="Klawiatura mechaniczna" price={249} inStock={true} />
```

Przekazanie funkcji jako propsa przyda się już w następnym pliku, gdzie zajmiesz się obsługą zdarzeń - na razie warto tylko wiedzieć, że jest to możliwe. Prosty przykład komponentu `Button`, który samodzielnie nie wie, co ma się wydarzyć po kliknięciu, tylko oddaje tę decyzję rodzicowi:

```javascript
function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
}
```

```javascript
<Button label="Dodaj do koszyka" onClick={() => console.log("Kliknięto!")} />
```

`Button` nie wie nic o koszyku - dostaje gotową funkcję `onClick` i tylko podpina ją pod znacznik `<button>`. Dzięki temu ten sam komponent `Button` można użyć wszędzie, z zupełnie inną logiką za każdym razem.

## 5. Props są tylko do odczytu

Komponent nigdy nie zmienia propsów, które dostał. To nie jest sugestia stylistyczna - to jedna z podstawowych zasad Reacta: dane płyną w jedną stronę, od rodzica do dziecka.

```javascript
function Card({ price }) {
    price = price - 10;
    return <p>Cena: {price} zł</p>;
}
```

Ten kod zadziała technicznie (React nie rzuci błędem), ale jest złą praktyką i prędzej czy później doprowadzi do trudnych do znalezienia błędów - zwłaszcza gdy komponentów i przepływów danych w aplikacji przybędzie. Jeśli potrzebujesz przeliczyć wartość, zrób to w osobnej zmiennej, nie nadpisuj propsa:

```javascript
function Card({ price }) {
    const discountedPrice = price - 10;
    return <p>Cena: {discountedPrice} zł</p>;
}
```

## 6. Kompozycja - budowa interfejsu z mniejszych komponentów

**Kompozycja** to składanie większego interfejsu z mniejszych, niezależnych komponentów - dokładnie tak, jak buduje się aplikację z klocków. Zamiast pisać cały widok w jednym pliku `App.jsx`, wydzielasz logiczne fragmenty: nagłówek, listę, pojedynczy element, przycisk.

Przykład prostszej strony sklepu złożonej z trzech komponentów:

`src/Navbar.jsx`:

```javascript
function Navbar({ shopName }) {
    return (
        <nav className="navbar">
            <h1>{shopName}</h1>
        </nav>
    );
}

export default Navbar;
```

`src/Card.jsx` (ten sam komponent co wcześniej):

```javascript
function Card({ title, price }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>Cena: {price} zł</p>
        </div>
    );
}

export default Card;
```

`src/App.jsx` - spina wszystko w jeden widok:

```javascript
import Navbar from "./Navbar.jsx";
import Card from "./Card.jsx";

function App() {
    return (
        <div>
            <Navbar shopName="Elektro-Sklep" />
            <Card title="Klawiatura mechaniczna" price={249} />
            <Card title="Myszka bezprzewodowa" price={99} />
            <Card title="Podkładka pod mysz" price={39} />
        </div>
    );
}

export default App;
```

`App` sam nie renderuje żadnego tekstu ani żadnej karty bezpośrednio - jego jedynym zadaniem jest ułożenie mniejszych komponentów w odpowiedniej kolejności i przekazanie im danych. Im większa aplikacja, tym ważniejszy staje się taki podział - trudno utrzymać jeden plik z tysiącem linii JSX, dużo łatwiej pracuje się na kilkunastu małych, czytelnych komponentach.

## 7. Dobre praktyki nazewnicze

Kilka zasad, których warto trzymać się od początku:

**Wielka litera w nazwie komponentu.** To już było w poprzednim pliku, ale przy tworzeniu kolejnych komponentów łatwo o literówkę - `card` zamiast `Card` sprawi, że React potraktuje to jako nieznany znacznik HTML, nie jako Twój komponent.

**Jeden plik = jeden komponent.** Plik `Card.jsx` eksportuje komponent `Card`, plik `Navbar.jsx` eksportuje komponent `Navbar`. Ułatwia to odnalezienie kodu i jest powszechnie przyjętą konwencją w projektach React.

**Nazwa pliku zgodna z nazwą komponentu.** Komponent `ProductCard` trzymasz w pliku `ProductCard.jsx`, nie w `card2.jsx` czy `productcard.jsx`.

**Nazwy propsów opisowe, nie skrócone.** `title`, `price`, `onClick` zamiast `t`, `p`, `fn`. Skrócone nazwy oszczędzają kilka znaków, a kosztują dużo więcej czasu każdemu, kto później czyta ten kod - łącznie z Tobą za miesiąc.

## Najczęstsze błędy

**Mutowanie propsów.** Nadpisywanie wartości otrzymanej przez props (`price = price - 10`) zamiast stworzenia nowej zmiennej. Props są tylko do odczytu.

**`props.props.x` zamiast destrukturyzacji.** Po zdestrukturyzowaniu parametru (`{ title }`) odwołujesz się bezpośrednio do `title`, nie do `props.title` - to dwa różne sposoby zapisu tej samej rzeczy, nie łącz ich w jednym komponencie.

**Literówka w nazwie propsa.** Przekazanie `<Card titel="..." />` zamiast `title="..."` nie spowoduje błędu - komponent po prostu dostanie `undefined` pod oczekiwaną nazwą i coś nie wyświetli się tak, jak powinno. React nie sprawdza w podstawowej konfiguracji, czy nazwy propsów się zgadzają, więc taki błąd trzeba wyłapać samemu.

**Brak importu komponentu.** Stworzenie pliku `Card.jsx` nic nie da, jeśli zapomnisz o `import Card from "./Card.jsx"` w pliku, w którym chcesz go użyć.

**Zapomniany `export default`.** Bez niego komponent istnieje tylko w swoim pliku i nie da się go zaimportować gdzie indziej.

## Co trzeba zapamiętać

```text
komponent funkcyjny
→ zwykła funkcja JS zwracająca JSX

props
→ dane przekazywane do komponentu, jak atrybuty znacznika HTML

{ title, price }
→ destrukturyzacja propsów w parametrach funkcji

props są tylko do odczytu
→ komponent nigdy nie zmienia otrzymanych propsów

kompozycja
→ budowa większego interfejsu z mniejszych, reużywalnych komponentów

jeden plik = jeden komponent
→ nazwa pliku zgodna z nazwą komponentu, z wielkiej litery
```
