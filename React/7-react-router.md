# Routing po stronie klienta - react-router-dom

W pliku `1-vite-start.md` padło zdanie, że w SPA cały czas jesteś na tej samej stronie, a JavaScript podmienia jej zawartość. Do tej pory Twoja aplikacja miała jeden widok - `App`. Prawdziwa aplikacja ma ich zwykle kilka: stronę główną, listę produktów, szczegóły produktu, panel logowania. Ten plik pokazuje, jak przełączać się między takimi widokami bez przeładowywania strony, za pomocą biblioteki **react-router-dom**.

## 1. Czego dokładnie brakuje

Gdybyś chciał zrobić kilka "podstron" bez żadnej biblioteki, najprostszym pomysłem byłoby trzymanie w stanie informacji "jaki widok pokazać teraz" i renderowanie go warunkowo. To by nawet zadziałało dla bardzo małej aplikacji, ale ma poważną wadę: adres w pasku przeglądarki cały czas wygląda tak samo. Nie da się wysłać komuś linku do konkretnej podstrony, przycisk "wstecz" w przeglądarce nie działa tak, jak powinien, a po odświeżeniu strony wracasz zawsze do tego samego widoku.

`react-router-dom` rozwiązuje to porządnie: łączy adres URL w pasku przeglądarki z tym, który komponent jest aktualnie renderowany, a zmianę adresu obsługuje JavaScriptem, bez przeładowania całej strony.

Instalacja:

```bash
npm install react-router-dom
```

## 2. BrowserRouter, Routes i Route

Cały mechanizm routingu musi opakowywać aplikację, żeby wszystkie komponenty w środku wiedziały, jaki jest aktualny adres i mogły go zmieniać. Robi się to zwykle raz, w `main.jsx`:

```javascript
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
```

`BrowserRouter` sam w sobie niczego nie wyświetla - udostępnia tylko mechanizm routingu wszystkim komponentom wewnątrz. Konkretne trasy definiuje się w `App`, za pomocą `Routes` i `Route`:

```javascript
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Products from "./pages/Products.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
        </Routes>
    );
}

export default App;
```

`Routes` to kontener, który sprawdza aktualny adres URL i wybiera **jedną**, pasującą trasę spośród swoich dzieci. `Route` opisuje pojedyncze dopasowanie: `path` to wzorzec adresu, `element` to komponent, który ma się wyrenderować, gdy adres pasuje. Wejście pod `/about` sprawi, że w miejscu `<Routes>` pojawi się komponent `About`, a reszta aplikacji (np. wspólne menu, jeśli je dodasz poza `Routes`) zostanie na miejscu.

## 3. Nawigacja przez Link

Zwykły `<a href="/about">` też zmieni adres - ale zrobi to tak, jak robił to internet od zawsze: wyśle nowe żądanie do serwera i przeładuje całą stronę. To dokładnie to, czego SPA ma unikać - stracisz cały stan aplikacji i będziesz musiał wczytać wszystko od nowa.

Do nawigacji wewnątrz aplikacji React służy komponent `Link`:

```javascript
import { Link } from "react-router-dom";

function Menu() {
    return (
        <nav>
            <Link to="/">Strona główna</Link>
            <Link to="/about">O nas</Link>
            <Link to="/products">Produkty</Link>
        </nav>
    );
}
```

`Link` renderuje się finalnie jako zwykły `<a>` (link nadal działa jak link - można go otworzyć w nowej karcie, najechać myszką i zobaczyć adres), ale przechwytuje kliknięcie i zamiast wysyłać żądanie do serwera, po prostu zmienia adres i podmienia widok przez JavaScript.

## 4. NavLink - oznaczanie aktywnej trasy

`NavLink` to wariant `Link` przeznaczony właśnie do menu nawigacyjnych - automatycznie wie, czy jego `to` odpowiada aktualnie aktywnej trasie, i pozwala nadać takiemu linkowi inny wygląd:

```javascript
import { NavLink } from "react-router-dom";

function Menu() {
    return (
        <nav>
            <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active-link" : "")}
            >
                Strona główna
            </NavLink>
            <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? "active-link" : "")}
            >
                Produkty
            </NavLink>
        </nav>
    );
}
```

Zamiast zwykłego stringa, `className` przyjmuje tu funkcję, która dostaje obiekt z polem `isActive` i na tej podstawie zwraca odpowiednią klasę CSS. Dzięki temu aktualnie otwarta zakładka menu może się wizualnie wyróżniać, bez żadnego ręcznego porównywania adresu w komponencie.

## 5. Dynamiczne ścieżki i useParams

Strona ze szczegółami pojedynczego produktu nie może mieć jednej, sztywnej trasy - musi jakoś wiedzieć, o który produkt chodzi. Do tego służą parametry w ścieżce, zapisywane z dwukropkiem:

```javascript
<Route path="/products/:id" element={<ProductDetails />} />
```

`:id` to nazwa parametru - w miejscu tego fragmentu adresu może znaleźć się dowolna wartość, np. `/products/1` albo `/products/42`. Wewnątrz komponentu docelowego odczytujesz tę wartość hookiem `useParams`:

```javascript
import { useParams } from "react-router-dom";

function ProductDetails() {
    const { id } = useParams();

    return (
        <div>
            <h1>Szczegóły produktu</h1>
            <p>Wybrany produkt ma id: {id}</p>
        </div>
    );
}
```

`useParams()` zwraca obiekt ze wszystkimi parametrami zdefiniowanymi w `path` danej trasy - nazwa pola w tym obiekcie (tu: `id`) musi dokładnie odpowiadać nazwie po dwukropku w `path`.

Sam `id` z URL-a to na razie tylko tekst - w prawdziwej aplikacji użyjesz go, żeby znaleźć odpowiedni produkt w tablicy albo (jak zobaczysz w kolejnym pliku serii) pobrać go z API.

## 6. Połączenie z listą - od karty do szczegółów

W pliku `3-listy-klucze.md` renderowałeś listę kart produktów. Teraz każda karta może linkować do swojej strony szczegółów, korzystając z `id` produktu:

```javascript
import { Link } from "react-router-dom";

function ProductCard({ product }) {
    return (
        <div className="card">
            <h3>{product.title}</h3>
            <p>{product.price} zł</p>
            <Link to={`/products/${product.id}`}>Zobacz szczegóły</Link>
        </div>
    );
}
```

To pełny obraz działania routingu: lista produktów renderuje karty, każda karta linkuje do `/products/:id` ze swoim konkretnym `id`, a `Route` z takim wzorcem ścieżki przechwytuje kliknięcie i renderuje `ProductDetails`, który przez `useParams()` wie, o który produkt chodzi.

## 7. Trasa dla nieznanego adresu

Gdy użytkownik wpisze adres, który nie pasuje do żadnej zdefiniowanej trasy, domyślnie nie zobaczy nic. Warto dodać trasę wyłapującą taki przypadek - wzorzec `*` pasuje do dowolnego adresu, który nie dopasował się wcześniej:

```javascript
<Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetails />} />
    <Route path="*" element={<NotFound />} />
</Routes>
```

`Routes` sprawdza trasy po kolei, więc `path="*"` musi być na końcu - inaczej przechwyciłby wszystko, zanim `Routes` zdążyłby dojść do bardziej konkretnych wzorców.

## 8. Nawigacja programowa - useNavigate

Czasem trzeba przekierować użytkownika bez klikania w link - np. po poprawnym zalogowaniu albo po zapisaniu formularza. Do tego służy hook `useNavigate`:

```javascript
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        // logika logowania...
        navigate("/products");
    }

    return <form onSubmit={handleSubmit}>{/* pola formularza */}</form>;
}
```

`navigate("/products")` zmienia adres dokładnie tak samo, jakby użytkownik kliknął `<Link to="/products">`, tylko wywołane jest to z kodu, a nie z kliknięcia.

## Cały przykład razem

```javascript
// main.jsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
```

```javascript
// App.jsx
import { Routes, Route } from "react-router-dom";
import Menu from "./Menu.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
    return (
        <div>
            <Menu />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}

export default App;
```

`Menu` renderuje się poza `Routes`, więc zostaje widoczne niezależnie od tego, która trasa jest aktualnie aktywna - typowy układ strony z nawigacją i podmienianą zawartością pod spodem.

## Najczęstsze błędy

**`<a href="...">` zamiast `Link`.** Zadziała, ale przeładuje całą stronę i zniweczy sens SPA - w kodzie komponentów React zawsze używaj `Link` albo `NavLink`, nigdy zwykłego `<a>` do nawigacji wewnątrz aplikacji.

**Brak `BrowserRouter`.** Użycie `Link`, `Route` czy `useParams` poza `BrowserRouter` kończy się błędem - te elementy muszą być renderowane gdzieś wewnątrz niego.

**`path="*"` nie na końcu listy tras.** `Routes` dopasowuje trasy w kolejności - wzorzec wyłapujący wszystko musi być ostatni, inaczej przechwyci ruch, który powinien trafić do bardziej szczegółowych tras.

**Odczyt parametru bez `useParams`.** Sam fakt, że w `path` jest `:id`, nic nie daje wewnątrz komponentu - wartość trzeba jawnie odczytać przez `const { id } = useParams()`.

**Niezgodna nazwa parametru.** `path="/products/:id"` i `useParams().productId` to dwie różne nazwy - trzeba użyć dokładnie tej samej nazwy, która występuje po dwukropku w `path`.

## Co trzeba zapamiętać

```text
BrowserRouter
→ opakowuje całą aplikację, włącza mechanizm routingu

Routes + Route
→ definiują, jaki komponent odpowiada jakiej ścieżce

Link / NavLink
→ nawigacja bez przeładowania strony
→ NavLink dodatkowo zna aktywną trasę (isActive)

/produkty/:id
→ dynamiczna ścieżka z parametrem

useParams()
→ odczyt parametrów z aktualnego adresu URL

path="*"
→ trasa domyślna dla nieznanego adresu (musi być na końcu)

useNavigate()
→ programowa zmiana trasy z poziomu kodu
```
