# Komunikacja z backendem - fetch, useEffect i integracja z API

Do tej pory wszystkie dane w komponentach były zaszyte w kodzie - tablica produktów, lista zadań, wartości formularza istniały tylko w pamięci przeglądarki. Prawdziwa aplikacja pobiera dane z backendu (tego samego typu API, jakie budowałeś w serii Node.js/Express) i wysyła do niego to, co zrobi użytkownik. Ten plik pokazuje, jak to zrobić poprawnie w React.

## 1. Dlaczego samo pobranie danych w komponencie nie wystarczy

Mogłoby się wydawać, że wystarczy napisać `fetch` bezpośrednio w ciele komponentu:

```javascript
function ProductList() {
    const [products, setProducts] = useState([]);

    fetch("http://localhost:3000/api/produkty")
        .then((res) => res.json())
        .then((data) => setProducts(data));

    return (
        <ul>
            {products.map((p) => (
                <li key={p.id}>{p.name}</li>
            ))}
        </ul>
    );
}
```

To wygląda niewinnie, ale jest błędem. `setProducts` na końcu `fetch` wywoła ponowne wyrenderowanie komponentu - a skoro `fetch` jest wywoływany wprost w ciele funkcji komponentu, uruchomi się on ponownie przy TYM renderze też, co znowu zmieni stan, co znowu wywoła render, i tak w kółko. Pobieranie danych to efekt uboczny (**side effect**) - coś, co nie jest częścią samego renderowania widoku, tylko dzieje się "obok" niego, w reakcji na to, że komponent się pojawił. React potrzebuje osobnego narzędzia do takich efektów - jest nim hook `useEffect`.

## 2. Podstawowa składnia useEffect

```javascript
import { useEffect } from "react";

useEffect(() => {
    console.log("Komponent został wyrenderowany");
}, []);
```

`useEffect` przyjmuje dwa argumenty: funkcję z kodem efektu i tablicę zależności. Funkcja przekazana jako pierwszy argument uruchamia się **po** wyrenderowaniu komponentu, nie w trakcie - dzięki temu może bezpiecznie zmieniać stan bez wpadania w pętlę opisaną wyżej.

Druga rzecz - tablica zależności - decyduje, kiedy efekt ma się uruchomić ponownie:

```text
useEffect(fn, [])
→ efekt jest powiązany z zamontowaniem komponentu; w Strict Mode React może wykonać dodatkowy cykl w trybie deweloperskim

useEffect(fn, [id])
→ efekt uruchamia się po pierwszym renderze i za każdym razem, gdy zmieni się "id"

useEffect(fn)
→ brak tablicy w ogóle - efekt uruchamia się po KAŻDYM renderze
```

Pusta tablica `[]` oznacza, że efekt nie zależy od zmiennych z komponentu i jest powiązany z zamontowaniem. W zwykłym przebiegu produkcyjnym efekt uruchamia się po pierwszym renderze. W trybie deweloperskim z `<StrictMode>` React może wykonać dodatkowy cykl uruchomienia i sprzątania, aby pomóc wykryć brak sprzątania. Nie opieraj poprawności aplikacji na założeniu, że żądanie sieciowe zawsze poleci dokładnie raz. Wariant z wartościami w tablicy (np. `[id]`) przyda się, gdy dane trzeba pobrać ponownie po zmianie parametru. Brak tablicy w ogóle oznacza, że efekt uruchamia się po każdym renderze i może utworzyć pętlę, jeśli zmienia stan.

## 3. fetch wewnątrz useEffect

Najprostszy wariant, na `.then()`:

```javascript
import { useState, useEffect } from "react";

function ProductList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/api/produkty")
            .then((res) => res.json())
            .then((data) => setProducts(data));
    }, []);

    return (
        <ul>
            {products.map((p) => (
                <li key={p.id}>{p.name}</li>
            ))}
        </ul>
    );
}
```

Wygodniejszy w czytaniu bywa wariant z `async/await`. Jest tu jedna pułapka: funkcja przekazana bezpośrednio do `useEffect` **nie może być `async`** - React oczekuje, że efekt albo nic nie zwróci, albo zwróci funkcję sprzątającą (o tym za chwilę), a `async function` zawsze zwraca `Promise`, co nie pasuje do tego kontraktu. Rozwiązanie: zdefiniować osobną funkcję `async` w środku i od razu ją wywołać:

```javascript
useEffect(() => {
    async function loadProducts() {
        const res = await fetch("http://localhost:3000/api/produkty");
        const data = await res.json();
        setProducts(data);
    }

    loadProducts();
}, []);
```

Sama funkcja przekazana do `useEffect` (ta na zewnątrz) pozostaje zwykłą, synchroniczną funkcją - to `loadProducts` w środku jest `async` i to ją się wywołuje.

Przy żądaniach zależnych od propsa lub stanu, komponent może zostać odmontowany albo identyfikator może się zmienić, zanim odpowiedź nadejdzie. `AbortController` pozwala anulować poprzednie żądanie podczas sprzątania efektu:

```javascript
useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
        try {
            const res = await fetch(`/api/products/${id}`, {
                signal: controller.signal
            });
            if (!res.ok) throw new Error("Nie udało się pobrać produktu.");
            setProduct(await res.json());
        } catch (err) {
            if (err.name !== "AbortError") {
                setError("Nie udało się pobrać produktu.");
            }
        }
    }

    loadProduct();
    return () => controller.abort();
}, [id]);
```

Funkcja zwrócona z efektu to sprzątanie. React uruchamia ją przed ponownym wykonaniem efektu dla nowego `id` oraz przy odmontowaniu komponentu. W prostym ćwiczeniu można zacząć bez anulowania żądania, ale warto znać ten wzorzec, gdy zależności efektu się zmieniają.

## 4. Stan ładowania i błędu

Pobranie danych z sieci trwa jakiś czas, a czasem się nie udaje - użytkownik nie powinien patrzeć na pustą stronę bez żadnej informacji, co się dzieje. Do tego przydają się dwa dodatkowe stany obok samych danych:

```javascript
import { useState, useEffect } from "react";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProducts() {
            try {
                const res = await fetch("http://localhost:3000/api/produkty");

                if (!res.ok) {
                    throw new Error("Serwer zwrócił błąd: " + res.status);
                }

                const data = await res.json();
                setProducts(data);
            } catch (err) {
                setError("Nie udało się pobrać produktów.");
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    if (loading) {
        return <p>Ładowanie...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <ul>
            {products.map((p) => (
                <li key={p.id}>{p.name}</li>
            ))}
        </ul>
    );
}
```

Trzy stany, trzy role: `products` trzyma dane po udanym pobraniu, `loading` mówi, czy żądanie wciąż trwa (start: `true`, bo na starcie zawsze czekamy), `error` trzyma komunikat, jeśli coś poszło nie tak (start: pusty string, czyli "brak błędu"). `res.ok` sprawdza, czy serwer odpowiedział kodem sukcesu (2xx) - `fetch` sam z siebie nie traktuje błędu 404 czy 500 jako wyjątku, trzeba to sprawdzić ręcznie i samemu rzucić błąd przez `throw`, żeby trafił do `catch`. Blok `finally` wykonuje się zawsze, niezależnie od tego, czy było `try` czy `catch` - to naturalne miejsce na wyłączenie `loading`, bez powtarzania `setLoading(false)` w dwóch miejscach.

Zanim dane są gotowe, komponent renderuje jedynie `<p>Ładowanie...</p>` i kończy działanie w tym miejscu (`return` przerywa dalsze wykonanie funkcji) - dopiero gdy `loading` jest `false` i nie ma błędu, dochodzi do właściwej listy.

## 5. Wysyłanie danych - fetch z metodą POST

Pobieranie to `GET`, domyślna metoda `fetch`. Do wysłania nowych danych (formularz z poprzedniej lekcji) potrzeba metody `POST`, nagłówka informującego serwer o formacie danych i samych danych zamienionych na tekst JSON:

```javascript
async function addProduct(product) {
    const res = await fetch("http://localhost:3000/api/produkty", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    });

    if (!res.ok) {
        throw new Error("Nie udało się dodać produktu.");
    }

    return res.json();
}
```

`method: "POST"` zmienia metodę żądania. `Content-Type: application/json` mówi backendowi, że w treści żądania jest JSON (bez tego serwer, np. Express z `express.json()`, może nie sparsować body). `JSON.stringify(product)` zamienia obiekt JavaScript na tekst - `body` żądania HTTP zawsze jest tekstem albo binarnymi danymi, nigdy gotowym obiektem JS. To jest dokładnie ten sam mechanizm, który po stronie backendu w serii Node.js odbierał `req.body`.

## 6. Wysyłanie plików przez FormData

Jeśli formularz zawiera plik, wyślij go jako `FormData`. Nie wywołuj `JSON.stringify()` i nie ustawiaj ręcznie nagłówka `Content-Type`: przeglądarka sama doda właściwy nagłówek `multipart/form-data` wraz z separatorem części.

```javascript
async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("http://localhost:3000/api/avatar", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        throw new Error("Nie udało się wysłać pliku.");
    }

    return res.json();
}
```

Nazwa `avatar` musi odpowiadać nazwie pola obsługiwanego przez backend. W serii Node.js endpoint Express korzysta zwykle z middleware takiego jak Multer, który odczytuje plik z `req.file` lub `req.files`. Sam frontend nie zapisuje pliku na serwerze; backend musi go przyjąć i zdecydować, gdzie go przechować.

## 7. Pełny przykład - lista produktów z formularzem dodawania

Wszystko razem: pobranie listy przy starcie, loader, obsługa błędu, renderowanie listy (`.map()` + `key` z lekcji 3) i formularz dodający nowy element przez POST:

```javascript
import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/produkty";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        async function loadProducts() {
            try {
                const res = await fetch(API_URL);

                if (!res.ok) {
                    throw new Error("Błąd serwera: " + res.status);
                }

                const data = await res.json();
                setProducts(data);
            } catch (err) {
                setError("Nie udało się pobrać produktów.");
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (name.trim() === "") {
            return;
        }

        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        const newProduct = await res.json();
        setProducts([...products, newProduct]);
        setName("");
    }

    if (loading) {
        return <p>Ładowanie...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <ul>
                {products.map((p) => (
                    <li key={p.id}>{p.name}</li>
                ))}
            </ul>

            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nazwa produktu"
                />
                <button type="submit">Dodaj</button>
            </form>
        </div>
    );
}

export default ProductList;
```

Po udanym dodaniu produktu (`handleSubmit`) komponent nie pobiera całej listy od nowa - po prostu dokłada nowo utworzony produkt (zwrócony przez backend, razem z `id` nadanym przez bazę) do istniejącej tablicy w stanie przez `setProducts([...products, newProduct])`. To ten sam wzorzec niemutowalnej aktualizacji tablicy, co w lekcji o `useState`.

## Najczęstsze błędy

**Brak tablicy zależności w `useEffect`.** Bez `[]` na końcu efekt uruchamia się po każdym renderze, a skoro sam często zmienia stan (przez `setProducts`), prowadzi to do nieskończonej pętli żądań do serwera.

**Próba użycia `async` bezpośrednio jako funkcji `useEffect`.** `useEffect(async () => { ... }, [])` nie jest poprawne - trzeba zdefiniować osobną funkcję `async` w środku i ją wywołać, tak jak w sekcji 3.

**Brak obsługi stanu ładowania i błędu.** Bez `loading` aplikacja przez chwilę pokazuje pustą listę, zanim dane dotrą - wygląda to jak błąd, nawet jeśli wszystko działa poprawnie. Bez obsługi błędu nieudane połączenie z serwerem kończy się cichą awarią albo białym ekranem.

**Zapominanie o `Content-Type` przy `POST`.** Bez nagłówka `"Content-Type": "application/json"` backend (np. Express z `express.json()`) może nie rozpoznać formatu danych i `req.body` po stronie serwera będzie puste.

**Wysyłanie obiektu zamiast tekstu w `body`.** `body: product` nie zadziała - żądanie HTTP wymaga tekstu (albo `FormData`, jak w poprzedniej lekcji), więc obiekt trzeba najpierw zamienić przez `JSON.stringify(product)`.

**Ustawianie `Content-Type` ręcznie dla `FormData`.** Przeglądarka musi dodać do nagłówka separator multipart. Przekaż sam obiekt `FormData`, bez nagłówka `Content-Type`.

## Co trzeba zapamiętać

```text
useEffect(fn, [])
→ uruchamia efekt po zamontowaniu; Strict Mode może wykonać dodatkowy cykl w deweloperskim trybie

fetch + async wewnątrz useEffect
→ osobna funkcja async w środku, wywołana od razu - nie async bezpośrednio w useEffect

trzy stany przy pobieraniu danych
→ dane, loading, error - każdy odpowiada za inną fazę żądania

POST
→ method: "POST", nagłówek Content-Type: application/json, body: JSON.stringify(dane)

plik
→ FormData z plikiem, bez ręcznego Content-Type

res.ok
→ trzeba sprawdzić ręcznie - fetch nie rzuca wyjątku przy 404/500 samo z siebie
```
