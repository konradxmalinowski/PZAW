# Stan globalny aplikacji - Context API i problem prop drillingu

W poprzednich plikach props przekazywałeś zwykle o jeden poziom niżej - rodzic do dziecka. W większej aplikacji drzewo komponentów bywa głębsze, a niektóre dane (np. zalogowany użytkownik) potrzebne są w wielu miejscach naraz, często bardzo głęboko zagnieżdżonych. Przekazywanie ich przez zwykłe props zaczyna się wtedy robić uciążliwe. Ten plik pokazuje ten problem i jego rozwiązanie - Context API.

## 1. Problem: prop drilling

Załóżmy taką strukturę komponentów:

```text
App
 └── Layout
      └── Header
           └── UserBadge
```

`App` wie, kto jest zalogowany (ma dane użytkownika). Potrzebuje ich tylko `UserBadge`, żeby wyświetlić imię i awatar. Problem w tym, że `UserBadge` nie jest bezpośrednim dzieckiem `App` - żeby dane tam dotarły, muszą przejść przez `Layout` i `Header`, mimo że żaden z nich sam ich nie potrzebuje:

```javascript
function App() {
    const user = { name: "Konrad", role: "admin" };

    return <Layout user={user} />;
}

function Layout({ user }) {
    return (
        <div>
            <Header user={user} />
            <main>Treść strony</main>
        </div>
    );
}

function Header({ user }) {
    return (
        <header>
            <UserBadge user={user} />
        </header>
    );
}

function UserBadge({ user }) {
    return <p>Zalogowany: {user.name}</p>;
}
```

`Layout` i `Header` przyjmują props `user` tylko po to, żeby oddać go dalej - to właśnie nazywa się **prop drilling** (przewiercanie się przez props). Przy dwóch poziomach to jeszcze znośne, ale przy pięciu, sześciu komponentach pośrednich, i przy kilku różnych wartościach przekazywanych w ten sposób jednocześnie, kod robi się trudny do utrzymania - każda zmiana kształtu danych wymusza poprawki we wszystkich komponentach po drodze, nawet jeśli sam w sobie żadnego z nich to nie dotyczy.

## 2. Context API - rozwiązanie

**Context** pozwala umieścić dane "ponad" częścią drzewa komponentów i pobrać je bezpośrednio w dowolnym komponencie potomnym, bez przekazywania przez props przez wszystkie pośrednie poziomy.

Mechanizm składa się z trzech elementów:

* `createContext()` - tworzy sam kontekst,
* `Provider` - komponent opakowujący fragment drzewa, udostępniający wartość wszystkim potomkom,
* `useContext()` - hook, którym dowolny komponent potomny odczytuje tę wartość.

### Tworzenie kontekstu

Zwykle w osobnym pliku, np. `src/UserContext.jsx`:

```javascript
import { createContext } from "react";

const UserContext = createContext(null);

export default UserContext;
```

`createContext(null)` tworzy kontekst z wartością domyślną `null` - to wartość, którą dostanie komponent, jeśli spróbuje odczytać kontekst spoza `Provider`a (więcej o tym w błędach).

### Provider

`Provider` to komponent, który każdy kontekst ma "wbudowany" - opakowujesz nim tę część aplikacji, która ma mieć dostęp do danych, i przekazujesz wartość przez props `value`:

```javascript
import UserContext from "./UserContext.jsx";

function App() {
    const user = { name: "Konrad", role: "admin" };

    return (
        <UserContext.Provider value={user}>
            <Layout />
        </UserContext.Provider>
    );
}
```

Zwróć uwagę: `Layout` już nie przyjmuje żadnego propsa `user`. Cały fragment drzewa wewnątrz `Provider`a - `Layout`, `Header`, `UserBadge` - ma teraz dostęp do wartości kontekstu, niezależnie od tego, jak głęboko jest zagnieżdżony.

### Odczyt kontekstu przez useContext

```javascript
import { useContext } from "react";
import UserContext from "./UserContext.jsx";

function UserBadge() {
    const user = useContext(UserContext);

    return <p>Zalogowany: {user.name}</p>;
}
```

`Layout` i `Header` wracają do bycia zwykłymi, "głupimi" komponentami - nie wiedzą nic o użytkowniku i nie muszą go przekazywać dalej:

```javascript
function Layout() {
    return (
        <div>
            <Header />
            <main>Treść strony</main>
        </div>
    );
}

function Header() {
    return (
        <header>
            <UserBadge />
        </header>
    );
}
```

To jest sedno rozwiązania: `UserBadge` sięga po dane bezpośrednio z kontekstu, zamiast czekać, aż ktoś mu je poda przez props.

## 3. Własny hook opakowujący useContext

W praktyce zamiast importować `useContext` i `UserContext` w każdym komponencie, który ich potrzebuje, tworzy się jeden własny hook. To niewielka zmiana, ale znacznie czytelniejsza w większym projekcie:

```javascript
import { useContext } from "react";
import UserContext from "./UserContext.jsx";

function useUser() {
    return useContext(UserContext);
}

export default useUser;
```

Użycie w komponencie:

```javascript
import useUser from "./useUser.js";

function UserBadge() {
    const user = useUser();

    return <p>Zalogowany: {user.name}</p>;
}
```

`useUser()` czyta się od razu jednoznacznie - "daj mi dane zalogowanego użytkownika" - bez zastanawiania się, z którego kontekstu i jak dokładnie go pobrać. To standardowy wzorzec w projektach React i warto się go trzymać.

## 4. Pełniejszy przykład: użytkownik z funkcją wylogowania

W realnej aplikacji kontekst użytkownika zwykle niesie więcej niż same dane - także funkcje do ich zmiany, np. wylogowanie:

```javascript
import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

function UserProvider({ children }) {
    const [user, setUser] = useState({ name: "Konrad", role: "admin" });

    function logout() {
        setUser(null);
    }

    return (
        <UserContext.Provider value={{ user, logout }}>
            {children}
        </UserContext.Provider>
    );
}

function useUser() {
    return useContext(UserContext);
}

export { UserProvider, useUser };
```

`UserProvider` łączy w sobie stan (`useState`) i `Provider` w jednym komponencie - dzięki temu w `App` wystarczy jedno opakowanie:

```javascript
import { UserProvider } from "./UserContext.jsx";

function App() {
    return (
        <UserProvider>
            <Layout />
        </UserProvider>
    );
}
```

A dowolny komponent potomny, także wiele poziomów niżej, może zarówno odczytać dane użytkownika, jak i wywołać wylogowanie:

```javascript
import { useUser } from "./UserContext.jsx";

function UserBadge() {
    const { user, logout } = useUser();

    if (!user) {
        return <p>Niezalogowany</p>;
    }

    return (
        <div>
            <p>Zalogowany: {user.name}</p>
            <button onClick={logout}>Wyloguj</button>
        </div>
    );
}
```

`children` w `UserProvider` to specjalny prop - zawiera wszystko, co zostało umieszczone między otwierającym a zamykającym tagiem komponentu (tu: `<Layout />`). Dzięki temu `UserProvider` może opakować dowolną zawartość, nie znając jej z góry.

## 5. Kontekst nie musi dotyczyć użytkownika

Mechanizm jest uniwersalny - działa dokładnie tak samo dla dowolnych danych globalnych. Przykład z motywem UI:

```javascript
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");

    function toggleTheme() {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

function useTheme() {
    return useContext(ThemeContext);
}

export { ThemeProvider, useTheme };
```

```javascript
function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme}>
            Aktualny motyw: {theme}
        </button>
    );
}
```

Wzorzec jest identyczny jak przy użytkowniku - kontekst, provider ze stanem, własny hook. Zmienia się tylko to, jakie dane trzymamy.

## 6. Kiedy Context, a kiedy zwykłe props

Context nie zastępuje props wszędzie - do prostego, płytkiego przekazania danych props są prostsze, szybsze do napisania i łatwiejsze do prześledzenia (widać od razu, skąd dana wartość pochodzi).

| Zwykłe props | Context API |
|---|---|
| dane potrzebne w 1-2 komponentach niżej | dane potrzebne w wielu, różnie zagnieżdżonych komponentach |
| jasne, bezpośrednie źródło danych | dane "dostępne wszędzie", źródło mniej oczywiste na pierwszy rzut oka |
| dobre do lokalnych, tymczasowych ustawień | dobre do naprawdę globalnych danych: zalogowany użytkownik, motyw, język |
| prostsze do przetestowania i prześledzenia | wygodniejsze przy głębokim zagnieżdżeniu |

Zasada praktyczna: jeśli przekazujesz coś jeden, dwa poziomy niżej - użyj props. Jeśli łapiesz się na przekazywaniu tej samej wartości przez cztery komponenty, z których trzy jej nie używają - to sygnał, że warto sięgnąć po Context.

## Najczęstsze błędy

**Brak opakowania w `Provider`.** Jeśli komponent wywołuje `useContext(UserContext)`, a nie jest potomkiem `UserContext.Provider`, dostanie wartość domyślną podaną w `createContext(...)` - w powyższych przykładach `null`. Próba odczytania `user.name` z `null` skończy się błędem.

**Nowy obiekt jako `value` przy każdym renderze.** Zapis `<UserContext.Provider value={{ user, logout }}>` tworzy nowy obiekt JS przy każdym renderowaniu `UserProvider`, nawet jeśli `user` się nie zmienił. W większych aplikacjach może to powodować niepotrzebne ponowne renderowanie komponentów korzystających z kontekstu. Na tym etapie nauki nie trzeba się tym jeszcze przejmować, ale warto wiedzieć, że taki problem istnieje - rozwiązuje się go np. przez `useMemo`.

**Context do wszystkiego.** Umieszczanie w kontekście każdej wartości "na wszelki wypadek" zamiast zwykłych props utrudnia śledzenie, skąd dane właściwie pochodzą. Context ma sens dla danych naprawdę globalnych, nie jako domyślny sposób przekazywania czegokolwiek.

## Co trzeba zapamiętać

```text
prop drilling
→ przekazywanie danych przez props przez komponenty, które ich same nie używają

createContext(wartośćDomyślna)
→ tworzy kontekst

Context.Provider
→ opakowuje fragment drzewa, udostępnia value wszystkim potomkom

useContext(Context)
→ odczytuje wartość kontekstu w dowolnym komponencie potomnym

własny hook (np. useUser)
→ wygodne opakowanie useContext, standardowy wzorzec w projektach React

Context API w tym kursie
→ jedyne narzędzie do stanu globalnego - bez Reduxa, bez zewnętrznych bibliotek
```
