# Renderowanie po stronie serwera - silniki szablonów (EJS)

Krótko: EJS to silnik szablonów, który pozwala generować gotowy HTML na serwerze, wstawiając w niego dane z aplikacji (np. z bazy danych). To przykład podejścia zwanego **SSR** (Server-Side Rendering) - w przeciwieństwie do aplikacji typu React, gdzie HTML tworzy przeglądarka.

## 1. Po co silnik szablonów?

Do tej pory serwer w naszych przykładach odsyłał albo zwykły tekst, albo dane w formacie JSON (`res.json()`). Klientem takiego API zwykle jest inna aplikacja (np. napisana w React), która sama zamienia dane na widoczny interfejs.

Czasem jednak chcemy, żeby to serwer od razu zwrócił gotową stronę HTML - np. przy prostych stronach informacyjnych, panelach administracyjnych czy tam, gdzie nie ma osobnego frontendu. Ręczne sklejanie HTML-a ze zmiennymi w kodzie JavaScript szybko robi się nieczytelne:

```javascript
res.send("<h1>Użytkownicy</h1><ul><li>" + users[0].name + "</li></ul>");
```

**Silnik szablonów** (ang. *template engine*) rozwiązuje ten problem - piszemy zwykły plik HTML, a w miejscach, gdzie mają pojawić się dane, wstawiamy specjalną składnię. Silnik podmienia ją na wartości i zwraca gotowy HTML. EJS (*Embedded JavaScript*) to jeden z najprostszych i najpopularniejszych silników tego typu dla Express.

Ważne, żeby to sobie od razu poukładać: sam plik `.ejs` **nie jest** gotowym plikiem HTML. To szablon ze specjalnymi znacznikami, który dopiero po przejściu przez silnik EJS (uruchomiony wewnątrz Express, po stronie serwera) zamienia się w zwykły HTML wysyłany do przeglądarki. Otwarcie takiego pliku bezpośrednio w przeglądarce, z pominięciem serwera, pokazałoby surowy tekst ze znacznikami, a nie działającą stronę.

## 2. Instalacja i konfiguracja

```bash
npm install ejs
```

W Express wystarczy ustawić EJS jako domyślny silnik widoków:

```javascript
const express = require("express");

const app = express();

app.set("view engine", "ejs");

app.listen(3000);
```

`app.set("view engine", "ejs")` mówi Expressowi, że pliki widoków mają rozszerzenie `.ejs` i mają być renderowane właśnie tym silnikiem. Express domyślnie szuka takich plików w katalogu `views/` w głównym folderze projektu - trzeba go utworzyć samodzielnie.

## 3. res.render() i przekazywanie danych

Zamiast `res.send()` czy `res.json()`, przy widokach używamy `res.render()`:

```javascript
app.get("/", (req, res) => {
    res.render("index", { title: "Strona główna" });
});
```

Pierwszy argument to nazwa pliku widoku (bez rozszerzenia `.ejs`, więc `"index"` odpowiada plikowi `views/index.ejs`). Drugi argument to obiekt z danymi, które trafią do tego widoku - każde jego pole staje się dostępną w szablonie zmienną (tutaj `title`).

`views/index.ejs`:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8" />
    <title><%= title %></title>
</head>
<body>
    <h1><%= title %></h1>
</body>
</html>
```

`<%= title %>` wstawia wartość zmiennej `title` do HTML-a. Wynikiem będzie zwykła strona HTML z tekstem "Strona główna" w tytule i w nagłówku `<h1>`.

To dokładnie taki HTML trafi do przeglądarki po wejściu na `/` (widać go np. przez "Pokaż źródło strony"):

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8" />
    <title>Strona główna</title>
</head>
<body>
    <h1>Strona główna</h1>
</body>
</html>
```

Żadnych śladów `<%= %>` już tam nie ma - EJS zdążył zamienić znacznik na rzeczywistą wartość, zanim odpowiedź trafiła do przeglądarki.

## 4. Renderowanie listy danych

Do prawdziwej pętli w EJS służy składnia `<% %>` (bez znaku `=`) - pozwala pisać dowolny kod JavaScript, ale nic sama z siebie nie wypisuje:

```javascript
const users = [
    { id: 1, name: "Jan" },
    { id: 2, name: "Anna" }
];

app.get("/users", (req, res) => {
    res.render("users", { users });
});
```

`views/users.ejs`:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8" />
    <title>Użytkownicy</title>
</head>
<body>
    <h1>Lista użytkowników</h1>
    <ul>
        <% users.forEach((user) => { %>
            <li><%= user.name %></li>
        <% }) %>
    </ul>
</body>
</html>
```

`<% users.forEach(...) %>` uruchamia pętlę po tablicy `users` przekazanej z serwera - dla każdego elementu tworzy nowy `<li>`. `<%= user.name %>` wstawia samo imię, jako bezpieczny tekst. Różnica między znacznikami jest prosta: `<% %>` to logika (pętle, `if`), `<%= %>` to wypisanie wartości jako tekstu.

Po wyrenderowaniu tego widoku przeglądarka dostaje już gotową listę, bez żadnej pętli w kodzie - EJS wykonał `forEach` po swojej stronie, zanim wysłał odpowiedź:

```html
<ul>
    <li>Jan</li>
    <li>Anna</li>
</ul>
```

Jest jeszcze trzeci wariant, `<%- %>`, który wstawia surowy HTML bez jego "ucieczki" (escapowania) - przydaje się, gdy dana zmienna sama zawiera znaczniki HTML, które mają zostać zinterpretowane, a nie pokazane jako tekst. W typowych przypadkach (jak wypisywanie imienia użytkownika) zawsze używa się `<%=`, bo chroni to przed przypadkowym wstrzyknięciem obcego kodu HTML do strony.

## 5. SSR a SPA - najważniejsza różnica

EJS to przykład podejścia **SSR** (Server-Side Rendering) - serwer generuje gotowy, kompletny HTML i wysyła go do przeglądarki. React, który poznasz w dalszej części kursu, reprezentuje inne podejście - **SPA** (Single Page Application), gdzie serwer wysyła tylko minimalny szkielet HTML, a resztę interfejsu buduje JavaScript uruchomiony w przeglądarce.

| | SSR (EJS) | SPA (React) |
|---|---|---|
| kto generuje HTML | serwer | przeglądarka (JavaScript) |
| co dostaje przeglądarka | gotową, wypełnioną stronę | pusty szkielet + kod JS |
| kiedy strona jest "gotowa" | od razu po odpowiedzi serwera | po wykonaniu się JavaScriptu w przeglądarce |
| zmiana widoku | zwykle nowe żądanie do serwera i przeładowanie strony | podmiana treści bez przeładowania (routing po stronie klienta) |
| typowe zastosowanie | proste strony, panele, SEO ważny od pierwszej sekundy | rozbudowane, interaktywne aplikacje webowe |

Żadne z tych podejść nie jest uniwersalnie "lepsze" - to inne narzędzia do innych sytuacji. EJS jest dobry, kiedy potrzeba prostej strony generowanej przez serwer bez budowania osobnej aplikacji frontendowej. React sprawdza się tam, gdzie interfejs jest rozbudowany i ma dużo interakcji bez przeładowywania strony.

## Najczęstsze błędy

**Brak katalogu `views/` albo zły plik.** Express domyślnie szuka widoków w `views/` w głównym katalogu projektu - jeśli plik `.ejs` leży gdzie indziej, `res.render()` zwróci błąd, że nie może znaleźć widoku.

**Pomylenie `<%=` z `<%-`.** `<%=` wypisuje wartość jako bezpieczny tekst (escapuje znaki HTML), `<%-` wstawia surowy HTML. Użycie `<%-` dla danych pochodzących od użytkownika (np. komentarza) jest ryzykowne - pozwala wstrzyknąć obcy HTML do strony.

**Brak `<%` na końcu pętli.** Blok `<% users.forEach((user) => { %> ... <% }) %>` musi mieć zamknięty nawias funkcji strzałkowej w drugim znaczniku - łatwo o pomyłkę przy pierwszym kontakcie z tą składnią.

## Co trzeba zapamiętać

```text
silnik szablonów
→ generuje HTML na serwerze na podstawie szablonu i danych

app.set("view engine", "ejs")
→ ustawia EJS jako silnik widoków w Express

views/
→ domyślny katalog na pliki .ejs

res.render(nazwa, dane)
→ renderuje widok i wysyła gotowy HTML jako odpowiedź

<%= wartość %>
→ wypisuje wartość jako bezpieczny tekst

<% kod %>
→ wykonuje kod JavaScript (pętle, warunki) bez wypisywania

<%- html %>
→ wstawia surowy HTML bez escapowania

SSR (EJS)
→ HTML generowany przez serwer

SPA (React)
→ HTML generowany przez JavaScript w przeglądarce
```
