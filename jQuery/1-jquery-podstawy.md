# jQuery - kontekst historyczny

Krótko: jQuery to biblioteka JavaScript, która przez lata (mniej więcej 2006-2016) była standardem w pracy z DOM i komunikacji z serwerem. Dziś nie zaczyna się nią nowych projektów - to, do czego kiedyś była niezbędna, robi dziś natywny JavaScript (`querySelector`, `fetch`) i frameworki takie jak React. Uczysz się jej nie po to, żeby jej używać, tylko żeby rozpoznać ten kod, gdy się z nim zetkniesz - w starszych aplikacjach albo w pytaniu egzaminacyjnym.

## Po co w ogóle powstała

W czasach sprzed jQuery JavaScript był dużo mniej wygodny. Nie było `document.querySelector` (trzeba było ręcznie przeszukiwać drzewo dokumentu), nie było `fetch`, a przeglądarki (zwłaszcza stare wersje Internet Explorera) różniły się między sobą tak bardzo, że ten sam kod potrafił działać inaczej w każdej z nich. jQuery ujednolicała te różnice pod jednym, prostym API - stąd jej hasło reklamowe "write less, do more".

## Jak dodać jQuery do projektu

jQuery jest zewnętrzną biblioteką. Przeglądarka musi ją wczytać, zanim uruchomi nasz kod, który korzysta z `$` albo `jQuery`.

### Opcja 1: dołączenie przez CDN

Do ćwiczeń najprościej dodać znacznik `<script>` z adresem biblioteki. Własny plik JavaScript umieść po nim:

```html
<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Moja strona z jQuery</title>
</head>
<body>
  <h1 id="naglowek">Witaj!</h1>
  <button id="zmien-tekst" type="button">Zmień tekst</button>

  <!-- Najpierw biblioteka jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <!-- Potem nasz kod, który używa jQuery -->
  <script src="app.js"></script>
</body>
</html>
```

Utwórz obok plik `app.js`:

```javascript
$(function () {
  $("#zmien-tekst").on("click", function () {
    $("#naglowek").text("Tekst został zmieniony");
  });
});
```

Funkcja przekazana do `$()` uruchomi się, gdy przeglądarka zbuduje strukturę HTML dokumentu. Dzięki temu selektory znajdą elementy strony. Ten zapis jest skrótem dla `$(document).ready(function () { ... })`.

CDN pobiera bibliotekę z internetu, więc strona potrzebuje połączenia z siecią. Do projektu wybierz konkretną wersję i nie zmieniaj jej przypadkowo. Numer użyty w przykładzie pasuje też do zadań w tym folderze.

### Opcja 2: plik zapisany w projekcie

Można pobrać plik jQuery i przechowywać go lokalnie, na przykład w folderze `js/vendor/`. W HTML zmienia się wtedy ścieżka:

```html
<script src="js/vendor/jquery-3.7.1.min.js"></script>
<script src="js/app.js"></script>
```

Ścieżki są liczone względem pliku HTML. Jeżeli plik strony leży w podfolderze, trzeba odpowiednio zmienić ścieżkę.

### Opcja 3: projekt z npm

W projekcie JavaScript zarządzanym przez npm bibliotekę można zainstalować poleceniem:

```bash
npm install jquery
```

W kodzie obsługiwanym przez bundler (na przykład Vite lub Webpack) importuje się ją tak:

```javascript
import $ from "jquery";

$(function () {
  $("#naglowek").text("jQuery jest wczytane");
});
```

Nie mieszaj sposobów instalacji w jednym projekcie. Prosta strona ćwiczeniowa może używać CDN, a projekt z bundlerem zwykle korzysta z npm.

## Jak wygląda typowa praca z jQuery

Najczęściej kod wykonuje cztery kroki:

1. Czeka, aż dokument będzie gotowy.
2. Wybiera element lub grupę elementów selektorem CSS.
3. Podpina zdarzenie, na przykład kliknięcie.
4. W reakcji zmienia tekst, klasę, zawartość albo atrybut elementu.

```javascript
$(function () {
  const $przycisk = $("#pokaz");
  const $wynik = $("#wynik");

  $przycisk.on("click", function () {
    $wynik.text("Przycisk został kliknięty.");
  });
});
```

Nazwy zmiennych zaczynające się od `$`, takie jak `$przycisk`, są konwencją. Przypominają, że zmienna zawiera obiekt jQuery, a nie pojedynczy element DOM.

## Selektory

`$("selektor")` to odpowiednik `document.querySelector`/`querySelectorAll` - przyjmuje taki sam zapis selektora CSS, ale zwraca specjalny obiekt jQuery (nie zwykły element DOM), z własnym zestawem metod.

```javascript
$("p");            // wszystkie akapity
$(".karta");        // elementy z klasą "karta"
$("#naglowek");      // element o id "naglowek"
```

To samo w czystym JavaScript:

```javascript
document.querySelectorAll("p");
document.querySelectorAll(".karta");
document.getElementById("naglowek");
```

Wynik `$(...)` jest obiektem jQuery. Nawet jeśli selektor znajdzie jeden element, metody jQuery wywołuje się na tym obiekcie. W czystym JavaScript wynik `querySelector()` jest pojedynczym elementem, a `querySelectorAll()` zwraca kolekcję.

## Manipulacja DOM

jQuery udostępnia zestaw metod do zmiany treści i wyglądu elementów bez pisania osobnej funkcji dla każdej operacji:

```javascript
$("h1").text("Nowy tytuł");           // zmienia tekst
$("#opis").html("<b>Pogrubione</b>"); // zmienia zawartość HTML
$("p").css("color", "red");            // zmienia styl
$(".karta").addClass("aktywna");       // dodaje klasę CSS
$(".karta").removeClass("aktywna");    // usuwa klasę CSS
$("ul").append("<li>Nowy element</li>"); // dodaje element na końcu
$(".stary").remove();                  // usuwa element ze strony
```

Do tekstu pochodzącego od użytkownika używaj `.text()`. Metoda `.html()` interpretuje podany tekst jako HTML, więc nie wstawiaj nią niezaufanych danych. Zamiast zmieniać wygląd bezpośrednio przez `.css()`, często lepiej dodać klasę przez `.addClass()` i opisać wygląd w arkuszu CSS.

## Obsługa zdarzeń

Metoda `.on()` podpina funkcję pod zdarzenie - to odpowiednik `addEventListener`:

```javascript
$("#przycisk").on("click", function () {
    $("#wynik").text("Kliknięto!");
});
```

Zdarzenia dla elementów dodanych później do strony można obsłużyć przez delegowanie. Zdarzenie przechodzi od klikniętego elementu do wskazanego rodzica:

```javascript
$("#lista").on("click", ".usun", function () {
  $(this).closest("li").remove();
});
```

Tutaj `#lista` jest elementem istniejącym od początku, a `.usun` może być przyciskiem utworzonym później. `$(this)` oznacza element, który wywołał zdarzenie.

W czystym JavaScript to samo wygląda tak:

```javascript
document.getElementById("przycisk").addEventListener("click", function () {
    document.getElementById("wynik").textContent = "Kliknięto!";
});
```

## Komunikacja z backendem

Zanim istniał `fetch`, standardem pobierania danych z serwera bez przeładowania strony (czyli AJAX) było `$.ajax()` i jego uproszczone warianty `$.get()` oraz `$.getJSON()`:

```javascript
$.getJSON("https://api.example.com/produkty", function (dane) {
    dane.forEach(function (produkt) {
        $("#lista").append("<li>" + produkt.nazwa + "</li>");
    });
});
```

Dziś ten sam efekt osiąga się przez `fetch`:

```javascript
fetch("https://api.example.com/produkty")
    .then((res) => res.json())
    .then((dane) => {
        dane.forEach((produkt) => {
            document.querySelector("#lista").innerHTML += `<li>${produkt.nazwa}</li>`;
        });
    });
```

Adres `api.example.com` w przykładach jest przykładowy. W prawdziwym projekcie należy podać adres własnego API, a także obsłużyć błędy odpowiedzi i sieci. Gdy wstawiasz dane z serwera do HTML, unikaj składania łańcuchów HTML z niezaufanym tekstem. Bezpieczniej utworzyć elementy i ustawiać tekst przez `.text()`.

## Najczęstsze problemy

- **`$ is not defined`**: jQuery nie została wczytana albo własny skrypt uruchomił się przed biblioteką. Sprawdź adres CDN i kolejność znaczników `<script>`.
- **`$(...).on is not a function`**: sprawdź, czy wybrany obiekt pochodzi z jQuery i czy `$` nie zostało nadpisane przez inną bibliotekę.
- **Kod nie znajduje elementu**: upewnij się, że selektor odpowiada `id` lub klasie w HTML i że kod uruchamia się po załadowaniu dokumentu.
- **Nie działa bez internetu**: strona korzysta z CDN. Użyj lokalnej kopii biblioteki albo sprawdź połączenie.
- **Kod jQuery umieszczony w `<head>` uruchamia się za wcześnie**: użyj `$(function () { ... })` albo przenieś znaczniki skryptów na koniec `<body>`.

## jQuery UI i jQuery Mobile

Wokół samej biblioteki jQuery powstały dodatkowe projekty. **jQuery UI** dodawał gotowe komponenty interfejsu - kalendarz wyboru daty, akordeony, okna modalne, przeciąganie elementów - zanim tego typu gotowe komponenty stały się standardem w bibliotekach takich jak dzisiejsze zestawy komponentów Reacta. **jQuery Mobile** był próbą dopasowania jQuery do urządzeń dotykowych i mniejszych ekranów, w czasach zanim ugruntowało się podejście responsywne (RWD) i zanim powstały frameworki mobilne oparte na JavaScript. Oba projekty dziś praktycznie nie są rozwijane.

## jQuery kiedyś a JavaScript/React dziś

| zadanie | jQuery (kiedyś) | dziś |
|---|---|---|
| wybór elementu | `$(".karta")` | `document.querySelector(".karta")` |
| zmiana treści | `$("h1").text(...)` | `element.textContent = ...` albo JSX w komponencie |
| obsługa kliknięcia | `$("#btn").on("click", fn)` | `element.addEventListener(...)` albo `onClick` w React |
| dane z API | `$.getJSON(url, fn)` | `fetch(url).then(...)` albo `useEffect` + `fetch` w React |

## Co trzeba zapamiętać

```text
jQuery
→ biblioteka JS do manipulacji DOM i AJAX, popularna głównie 2006-2016

$("selektor")
→ odpowiednik document.querySelector/querySelectorAll

.text() / .html() / .css() / .addClass() / .append() / .remove()
→ podstawowe metody manipulacji DOM

.on("click", fn)
→ odpowiednik addEventListener

$.ajax() / $.get() / $.getJSON()
→ historyczny odpowiednik dzisiejszego fetch()

dziś
→ tę rolę przejął natywny JavaScript (querySelector, fetch) i frameworki jak React
```

Jeśli zobaczysz w kodzie znak dolara przed nawiasem - `$(...)` - to niemal na pewno jQuery.
