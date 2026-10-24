# Zarządzanie stanem lokalnym - hook useState

W poprzednim pliku `useState` pojawił się już przy okazji usuwania elementu z listy, ale bez dokładnego tłumaczenia - potrzebny był tylko po to, żeby usuwanie w ogóle zadziałało. Ten plik nadrabia to porządnie: czym jest stan komponentu, jak się nim zarządza i dlaczego robi się to inaczej niż w zwykłym JavaScripcie.

## 1. Czym jest stan komponentu

Zwykła zmienna w funkcji komponentu nie nadaje się do przechowywania danych, które mają się zmieniać w czasie działania aplikacji. Spróbuj tak:

```javascript
function Counter() {
    let count = 0;

    function handleClick() {
        count = count + 1;
        console.log(count);
    }

    return (
        <div>
            <p>Wynik: {count}</p>
            <button onClick={handleClick}>+1</button>
        </div>
    );
}
```

Kliknięcie przycisku faktycznie zmieni wartość `count` - w konsoli zobaczysz rosnące liczby. Na ekranie jednak nic się nie zmieni, bo React nie ma pojęcia, że `count` się zmieniło, i nie wyrenderuje komponentu ponownie. Zwykła zmienna JS jest "martwa" dla Reacta - żyje tylko przez czas jednego wykonania funkcji komponentu i znika, gdy funkcja się skończy.

**Stan (state)** to dane, o których React wie, że mogą się zmienić - i które, gdy się zmienią, powodują ponowne wyrenderowanie komponentu z nową wartością. Do zarządzania stanem w komponencie funkcyjnym służy hook `useState`.

## 2. Deklaracja useState

```javascript
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Wynik: {count}</p>
            <button onClick={() => setCount(count + 1)}>+1</button>
        </div>
    );
}
```

Rozbijmy tę linijkę:

```javascript
const [count, setCount] = useState(0);
```

`useState(0)` tworzy jedną "przegródkę" na dane w komponencie, z wartością początkową `0`. Zwraca tablicę z dwoma elementami, które od razu rozpakowujesz przez destrukturyzację:

* `count` - aktualna wartość stanu (na start: `0`),
* `setCount` - funkcja, którą wywołujesz, żeby tę wartość zmienić.

Nazwy `count` i `setCount` to tylko konwencja (`coś` + `setCoś`) - możesz je nazwać dowolnie, ważna jest kolejność w tablicy, nie same nazwy.

Wartość początkowa (`0` w tym przykładzie) jest używana tylko przy **pierwszym** renderowaniu komponentu. Przy każdym kolejnym `useState` po prostu zwraca aktualną, już zmienioną wartość - nie resetuje jej z powrotem do `0`.

## 3. Dlaczego nie zmieniamy stanu bezpośrednio

`count` zwrócone przez `useState` to zwykła wartość - nic nie stoi na przeszkodzie, żeby napisać `count = count + 1`. Tyle że to nie zadziała tak, jak można by oczekiwać:

```javascript
function handleClick() {
    count = count + 1;
}
```

Ta linijka owszem, zmieni lokalną zmienną `count` - ale React w ogóle się o tym nie dowie. Ponowne renderowanie komponentu wywołuje wyłącznie funkcja aktualizująca zwrócona przez `useState`, w tym przypadku `setCount`. Jest to jedyny sposób, w jaki React "dowiaduje się", że coś się zmieniło i że trzeba przerysować komponent z nową wartością:

```javascript
function handleClick() {
    setCount(count + 1);
}
```

Zasada do zapamiętania: **stan zmieniamy wyłącznie przez funkcję aktualizującą, nigdy przez bezpośrednie przypisanie.**

## 4. Licznik - pełny przykład

```javascript
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Wynik: {count}</p>
            <button onClick={() => setCount(count + 1)}>+1</button>
            <button onClick={() => setCount(count - 1)}>-1</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}

export default Counter;
```

Każde kliknięcie wywołuje `setCount` z nową wartością. React zapisuje ją jako aktualny stan i wykonuje funkcję `Counter` jeszcze raz - tym razem `count` ma już nową wartość, więc na ekranie pojawia się zaktualizowana liczba.

## 5. Przełącznik

Drugi klasyczny przypadek to wartość logiczna, którą klik przełącza między `true` i `false` - np. pokazywanie i ukrywanie fragmentu widoku:

```javascript
import { useState } from "react";

function Details() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "Ukryj szczegóły" : "Pokaż szczegóły"}
            </button>
            {isOpen && <p>To jest ukryta treść, widoczna po kliknięciu.</p>}
        </div>
    );
}

export default Details;
```

`setIsOpen(!isOpen)` zapisuje w stanie zaprzeczenie aktualnej wartości - `true` zamienia na `false` i odwrotnie. Wyrażenie `{isOpen && <p>...</p>}` to typowy sposób na warunkowe renderowanie w JSX: jeśli `isOpen` jest `false`, całe wyrażenie ucina się na `false` i nic się nie renderuje, jeśli `true` - renderuje się to, co po prawej stronie `&&`.

## 6. Stan powiązany z inputem

Stan równie dobrze może trzymać tekst wpisywany przez użytkownika:

```javascript
import { useState } from "react";

function Greeting() {
    const [name, setName] = useState("");

    return (
        <div>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <p>Cześć, {name || "nieznajomy"}!</p>
        </div>
    );
}

export default Greeting;
```

Zdarzenie `onChange` wywołuje się przy każdej zmianie zawartości pola, a `e.target.value` to aktualna treść inputu w momencie zdarzenia. Ten wzorzec - wartość inputu trzymana w stanie i aktualizowana przy każdym wpisanym znaku - to podstawa **formularzy kontrolowanych**, którymi zajmiesz się dokładniej w kolejnej lekcji. Tu jest to tylko naturalne rozszerzenie tego, co już wiesz o `useState`.

## 7. Mini-aplikacja: lista zadań

Połączmy to, co już umiesz - listę, `.map()`, `key` z poprzedniego pliku - ze stanem w postaci tablicy:

```javascript
import { useState } from "react";

function TodoApp() {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Zrobić zadanie domowe" },
        { id: 2, text: "Powtórzyć useState" }
    ]);
    const [newTask, setNewTask] = useState("");

    function handleAdd() {
        if (newTask.trim() === "") {
            return;
        }

        const task = { id: Date.now(), text: newTask };
        setTasks([...tasks, task]);
        setNewTask("");
    }

    return (
        <div>
            <h1>Lista zadań</h1>
            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
            />
            <button onClick={handleAdd}>Dodaj</button>

            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>{task.text}</li>
                ))}
            </ul>
        </div>
    );
}

export default TodoApp;
```

Dwie osobne wartości w stanie: `tasks` (tablica zadań) i `newTask` (treść aktualnie wpisywana w polu). `handleAdd` sprawdza, czy pole nie jest puste, tworzy nowy obiekt zadania i dopisuje go do listy:

```javascript
setTasks([...tasks, task]);
```

`...tasks` rozpakowuje wszystkie dotychczasowe zadania do nowej tablicy, a `task` dopisuje na końcu. To kluczowy moment - `setTasks(tasks.push(task))` wyglądałoby na skrót, ale jest błędem: `.push()` modyfikuje starą tablicę w miejscu i zwraca jej nową długość (liczbę), nie nową tablicę. Więcej o tym w błędach poniżej.

Na końcu `handleAdd` czyści pole przez `setNewTask("")` - stąd input jest znowu pusty po dodaniu zadania.

## 8. Co się dzieje przy wywołaniu setState

Gdy wywołujesz `setCount(nowaWartość)`, dzieje się to w dużym skrócie tak:

```text
setCount(nowaWartość)
        ↓
React zapisuje nową wartość jako aktualny stan
        ↓
React planuje ponowne wykonanie funkcji komponentu
        ↓
funkcja komponentu wykonuje się od nowa
        ↓
tym razem useState zwraca już nową wartość
        ↓
JSX renderuje się z aktualnymi danymi
```

Ważne jest to, że `setCount` nie zmienia wartości `count` "w miejscu", w trakcie trwania bieżącego wywołania funkcji - planuje dopiero **kolejne** wykonanie komponentu. Dlatego jeśli po `setCount(count + 1)` w tej samej funkcji spróbujesz odczytać `count`, wciąż zobaczysz starą wartość - nowa będzie dostępna dopiero przy następnym renderowaniu.

## Najczęstsze błędy

**Bezpośrednia zmiana stanu.** `count = count + 1` albo `count++` nie wywoła ponownego renderowania - zawsze `setCount(...)`.

**Mutowanie tablicy lub obiektu w stanie.** `tasks.push(task)` albo `user.name = "Nowa"` zmieniają istniejące dane w pamięci, ale React o tym nie wie i nie odświeży widoku. Zawsze twórz nową tablicę lub nowy obiekt: `setTasks([...tasks, task])`, `setUser({ ...user, name: "Nowa" })`.

**Oczekiwanie na natychmiastową zmianę.** Po `setCount(count + 1)` zmienna `count` w tej samej funkcji wciąż ma starą wartość - nowa pojawi się dopiero przy kolejnym renderowaniu komponentu, nie w tej samej linijce kodu.

**Brak wartości początkowej dopasowanej do typu danych.** `useState()` bez argumentu daje `undefined`, co często prowadzi do błędów przy próbie wywołania np. `.map()` na czymś, co jeszcze nie jest tablicą. Jeśli stan ma być tablicą, zacznij od `useState([])`, jeśli obiektem - od `useState({})` albo konkretnego kształtu danych.

**Zbyt wiele osobnych `useState` tam, gdzie dane logicznie należą do siebie.** To nie jest błąd składniowy, ale często lepiej trzymać powiązane dane (np. `title` i `price` nowego produktu) w jednym obiekcie stanu niż w kilku niezależnych zmiennych - łatwiej wtedy o spójną aktualizację.

## Co trzeba zapamiętać

```text
useState(wartośćPoczątkowa)
→ zwraca [aktualnaWartość, funkcjaAktualizująca]

zmiana stanu
→ zawsze przez funkcję aktualizującą, nigdy przez zwykłe przypisanie

setState(nowaWartość)
→ zapisuje nową wartość i planuje ponowne renderowanie komponentu
→ nie zmienia wartości "natychmiast" w bieżącym wykonaniu funkcji

tablice i obiekty w stanie
→ zawsze nowa kopia (spread ...), nigdy mutacja w miejscu

typowe zastosowania
→ liczniki, przełączniki, pola tekstowe, listy elementów
```
