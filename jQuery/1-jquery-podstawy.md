# jQuery - kontekst historyczny

Krótko: jQuery to biblioteka JavaScript, która przez lata (mniej więcej 2006-2016) była standardem w pracy z DOM i komunikacji z serwerem. Dziś nie zaczyna się nią nowych projektów - to, do czego kiedyś była niezbędna, robi dziś natywny JavaScript (`querySelector`, `fetch`) i frameworki takie jak React. Uczysz się jej nie po to, żeby jej używać, tylko żeby rozpoznać ten kod, gdy się z nim zetkniesz - w starszych aplikacjach albo w pytaniu egzaminacyjnym.

## Po co w ogóle powstała

W czasach sprzed jQuery JavaScript był dużo mniej wygodny. Nie było `document.querySelector` (trzeba było ręcznie przeszukiwać drzewo dokumentu), nie było `fetch`, a przeglądarki (zwłaszcza stare wersje Internet Explorera) różniły się między sobą tak bardzo, że ten sam kod potrafił działać inaczej w każdej z nich. jQuery ujednolicała te różnice pod jednym, prostym API - stąd jej hasło reklamowe "write less, do more".

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

## Obsługa zdarzeń

Metoda `.on()` podpina funkcję pod zdarzenie - to odpowiednik `addEventListener`:

```javascript
$("#przycisk").on("click", function () {
    $("#wynik").text("Kliknięto!");
});
```

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
