# Renderowanie list danych i klucze w React

W poprzednim pliku każdą kartę produktu dopisywałeś do `App` ręcznie, jedną linijką na sztukę. To działa przy trzech produktach, ale nie przy trzydziestu czy trzystu - a dane w prawdziwej aplikacji i tak nie leżą w kodzie, tylko przychodzą z API jako tablica. Ten plik pokazuje, jak taką tablicę zamienić na listę komponentów na ekranie.

## 1. Tablica obiektów jako źródło danych

Na razie dane trzymasz jeszcze w kodzie, jako zwykłą stałą (pobieranie ich z prawdziwego API to temat kolejnej lekcji, `useEffect` i `fetch`). Ważne jest to, że każdy element ma pole, które jednoznacznie go identyfikuje - zwykle `id`:

```javascript
const products = [
    { id: 1, title: "Klawiatura mechaniczna", price: 249 },
    { id: 2, title: "Myszka bezprzewodowa", price: 99 },
    { id: 3, title: "Podkładka pod mysz", price: 39 }
];
```

Zadanie komponentu `App` to zamienić tę tablicę na tablicę elementów `<Card />` - po jednym na każdy produkt.

## 2. Renderowanie listy metodą .map()

Do tego służy zwykła metoda tablicowa `.map()`, którą już znasz z JavaScriptu. Różnica jest tylko taka, że tym razem funkcja przekazana do `.map()` zwraca nie liczbę czy string, tylko JSX:

```javascript
import Card from "./Card.jsx";

const products = [
    { id: 1, title: "Klawiatura mechaniczna", price: 249 },
    { id: 2, title: "Myszka bezprzewodowa", price: 99 },
    { id: 3, title: "Podkładka pod mysz", price: 39 }
];

function App() {
    return (
        <div>
            <h1>Sklep</h1>
            {products.map((product) => (
                <Card key={product.id} title={product.title} price={product.price} />
            ))}
        </div>
    );
}

export default App;
```

`{products.map(...)}` to zwykłe wyrażenie JS wstawione w JSX przez klamry - dokładnie tak samo, jak wcześniej wstawiałeś pojedynczą zmienną. Różnica jest taka, że tym razem wynikiem wyrażenia jest tablica elementów JSX, a React potrafi taką tablicę wyrenderować bezpośrednio, jeden element po drugim.

Każde wywołanie `.map()` musi **zwrócić** JSX z każdej iteracji. Zapomnienie o `return` (przy funkcji z klamrowym ciałem) albo pomylenie `.map()` z `.forEach()` sprawi, że nic się nie wyrenderuje - o tym więcej w błędach na końcu.

## 3. Po co jest key

Zauważ atrybut `key={product.id}` przy `<Card />`. To nie jest zwykły props przekazywany do komponentu - `key` React zabiera dla siebie, zanim `Card` w ogóle go zobaczy. Służy do czegoś innego niż wyświetlanie danych.

Gdy lista się zmienia - dochodzi element, znika, zmienia kolejność - React musi rozpoznać, który element na ekranie odpowiada któremu elementowi w nowej tablicy, żeby zaktualizować tylko to, co faktycznie się zmieniło, a nie przerysować całej listy od zera. `key` to właśnie ten identyfikator, po którym React rozpoznaje elementy między kolejnymi renderowaniami.

Bez `key` React i tak coś wyrenderuje (w konsoli zobaczysz tylko ostrzeżenie), ale zacznie zgadywać dopasowania po pozycji w tablicy - a to prowadzi do błędów opisanych w sekcji "Najczęstsze błędy".

**`key` musi być stabilny i unikalny w obrębie listy.** Najlepszym wyborem jest `id` z danych - coś, co nie zmienia się między renderowaniami i jednoznacznie wskazuje na dany element:

```javascript
{products.map((product) => (
    <Card key={product.id} title={product.title} price={product.price} />
))}
```

## 4. Dlaczego nie indeks tablicy

Kuszące (i częste w pierwszych próbach) jest użycie indeksu z `.map()` jako `key`:

```javascript
{products.map((product, index) => (
    <Card key={index} title={product.title} price={product.price} />
))}
```

Dopóki lista jest statyczna i nic z niej nie usuwasz ani nie zmieniasz kolejności, to zadziała bez widocznych problemów. Kłopot zaczyna się, gdy lista się zmienia - usuniesz pierwszy element, a wszystkie kolejne indeksy się przesuną. React, patrząc tylko na `key`, myśli, że to wciąż te same elementy co poprzednio (bo mają te same indeksy 0, 1, 2...), tylko z innymi danymi w środku - i zaczyna mylić, który komponent do czego pasuje. W praktyce widać to np. jako złe dane w polu formularza po usunięciu elementu z listy powyżej.

Zasada jest prosta: jeśli masz stabilne `id` w danych, używaj go. Indeks jako `key` ma sens tylko wtedy, gdy lista jest naprawdę statyczna i nigdy nie zmienia kolejności ani liczby elementów.

## 5. Prosta interakcja - usuwanie elementu z listy

Żeby pokazać usuwanie elementu po kliknięciu, dane muszą już siedzieć w stanie komponentu, a nie w zwykłej stałej - inaczej React nie będzie wiedział, że coś się zmieniło, i nie przerysuje widoku. Do tego służy hook `useState`, którym w pełni zajmiesz się w następnym pliku. Tutaj używasz go tylko jako narzędzia, żeby usuwanie w ogóle zadziałało:

```javascript
import { useState } from "react";
import Card from "./Card.jsx";

function App() {
    const [products, setProducts] = useState([
        { id: 1, title: "Klawiatura mechaniczna", price: 249 },
        { id: 2, title: "Myszka bezprzewodowa", price: 99 },
        { id: 3, title: "Podkładka pod mysz", price: 39 }
    ]);

    function handleRemove(id) {
        setProducts(products.filter((product) => product.id !== id));
    }

    return (
        <div>
            <h1>Sklep</h1>
            {products.map((product) => (
                <div key={product.id}>
                    <Card title={product.title} price={product.price} />
                    <button onClick={() => handleRemove(product.id)}>Usuń</button>
                </div>
            ))}
        </div>
    );
}

export default App;
```

`handleRemove` tworzy nową tablicę metodą `.filter()` - wszystkie produkty poza tym, którego `id` się zgadza - i zapisuje ją z powrotem w stanie przez `setProducts`. To właśnie ta zmiana stanu powoduje ponowne renderowanie `App` z już zaktualizowaną listą. Zauważ, że `key` przeniósł się na zewnętrzny `<div>`, bo to on jest teraz bezpośrednim elementem zwracanym przez `.map()`.

## 6. Pusta lista

Gdy tablica jest pusta (np. po usunięciu wszystkich produktów), `.map()` po prostu nic nie wyrenderuje - żadnego błędu, ale też żadnej informacji dla użytkownika. Warto to obsłużyć osobno:

```javascript
{products.length === 0 ? (
    <p>Brak produktów do wyświetlenia.</p>
) : (
    products.map((product) => (
        <div key={product.id}>
            <Card title={product.title} price={product.price} />
            <button onClick={() => handleRemove(product.id)}>Usuń</button>
        </div>
    ))
)}
```

Operator warunkowy `? :` decyduje, co pokazać: komunikat o pustej liście albo wyrenderowaną tablicę kart.

## Najczęstsze błędy

**Brak `key`.** React wyrenderuje listę i pokaże w konsoli ostrzeżenie `Warning: Each child in a list should have a unique "key" prop`. Kod zadziała, ale lepiej się przyzwyczaić do dodawania `key` od razu, zanim stanie się to nawykiem do naprawiania.

**Indeks tablicy jako `key` przy liście, która się zmienia.** Powoduje błędne dopasowanie komponentów do danych po usunięciu, dodaniu lub posortowaniu elementów - objawia się jako "przeskakujące" albo nieaktualne dane na ekranie, mimo że stan jest poprawny.

**`.map()` bez `return`.** Przy funkcji strzałkowej z klamrowym ciałem `(product) => { <Card ... /> }` trzeba pamiętać o `return` - bez niego funkcja zwraca `undefined` dla każdego elementu i lista jest pusta. Zapis bez klamer i bez `return`, jak w przykładach powyżej, jest bezpieczniejszy dla prostych przypadków.

**Pomylenie `.map()` z `.forEach()`.** `.forEach()` nie zwraca żadnej wartości - jeśli użyjesz go zamiast `.map()` przy próbie renderowania listy, nic się nie wyświetli. Do renderowania zawsze `.map()`.

**`key` przekazywany dalej jako zwykły props.** React zabiera `key` dla siebie na etapie renderowania - wewnątrz komponentu (np. w `Card`) nie masz dostępu do `props.key`. Jeśli element listy potrzebuje identyfikatora również wewnątrz komponentu, przekaż go pod inną nazwą, np. `id={product.id}`.

## Co trzeba zapamiętać

```text
.map()
→ zamienia tablicę danych na tablicę elementów JSX

key
→ stabilny, unikalny identyfikator elementu listy dla Reacta
→ najlepiej id z danych, nie indeks tablicy

pusta lista
→ .map() nic nie wyrenderuje - obsłuż ten przypadek osobno

usuwanie elementu z listy
→ nowa tablica przez .filter(), zapisana z powrotem w stanie
```
