# Formularze kontrolowane, walidacja danych i upload plików w React

W poprzednim pliku pojawił się jeden input powiązany ze stanem, jako zapowiedź. Tu ten wzorzec zostaje rozwinięty w pełny, systematyczny temat: jak budować formularze w React, jak je walidować przed wysłaniem i jak przygotować do wysłania także pliki.

## 1. Komponent kontrolowany

W zwykłym HTML wartość pola formularza żyje w DOM - przeglądarka sama pamięta, co wpisał użytkownik. W React zwykle robi się to inaczej: wartość pola trzymana jest w stanie komponentu, a pole tylko tę wartość wyświetla. Taki input nazywa się **komponentem kontrolowanym** (controlled component) - to React kontroluje, co jest w polu, a nie DOM.

Para, która to zapewnia, to `value` + `onChange`:

```javascript
import { useState } from "react";

function NameInput() {
    const [name, setName] = useState("");

    return (
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
    );
}
```

`value={name}` mówi polu, jaką wartość ma pokazywać - zawsze tę, która jest aktualnie w stanie. `onChange` odpala się przy każdej zmianie zawartości pola (każdym wciśniętym znaku) i przez `e.target.value` odczytuje nową treść, którą od razu zapisuje w stanie.

Jeśli dasz polu `value` bez `onChange`, przeglądarka pokaże w konsoli ostrzeżenie i pole stanie się faktycznie tylko do odczytu - użytkownik będzie mógł kliknąć w nie, ale nie wpisze nic, bo `value` cały czas jest sztywno ustawiane na tę samą wartość ze stanu, a nic jej nie aktualizuje.

## 2. Formularz z kilkoma polami

Przy jednym polu osobny `useState` wystarczy. Przy kilku polach są dwa sensowne podejścia.

**Osobny stan na każde pole** - czytelne przy małych formularzach:

```javascript
function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    return (
        <form>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </form>
    );
}
```

**Jeden obiekt stanu** - lepiej się skaluje przy większej liczbie pól:

```javascript
function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "" });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    return (
        <form>
            <input name="name" value={form.name} onChange={handleChange} />
            <input name="email" value={form.email} onChange={handleChange} />
        </form>
    );
}
```

Tu każde pole ma atrybut `name` odpowiadający kluczowi w obiekcie stanu. Jedna funkcja `handleChange` obsługuje wszystkie pola naraz - `e.target.name` mówi, który klucz zaktualizować, a `[e.target.name]` to zapis property computed name, czyli "użyj wartości tej zmiennej jako nazwy klucza". `{...form, ...}` kopiuje resztę pól bez zmian, żeby aktualizacja jednego pola nie skasowała pozostałych.

Przy dwóch, trzech polach osobne `useState` jest prostsze do czytania. Przy większym formularzu (rejestracja, dodawanie produktu) jeden obiekt stanu jest wygodniejszy - nie trzeba pisać osobnej funkcji `onChange` dla każdego pola.

## 3. select i checkbox jako komponenty kontrolowane

`select` działa tak samo jak input tekstowy - `value` + `onChange`:

```javascript
function CategoryPicker() {
    const [category, setCategory] = useState("elektronika");

    return (
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="elektronika">Elektronika</option>
            <option value="ksiazki">Książki</option>
            <option value="odziez">Odzież</option>
        </select>
    );
}
```

`checkbox` różni się jednym szczegółem - zamiast `value` używa `checked`, a odczytuje się go przez `e.target.checked` (wartość logiczna), nie `e.target.value`:

```javascript
function AvailabilityCheckbox() {
    const [available, setAvailable] = useState(true);

    return (
        <label>
            <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
            />
            Dostępny
        </label>
    );
}
```

## 4. Wysłanie formularza i preventDefault

Formularz HTML domyślnie, po kliknięciu przycisku typu `submit`, wysyła żądanie i przeładowuje całą stronę. W aplikacji React prawie nigdy tego nie chcemy - obsługę wysłania przejmuje JavaScript, więc trzeba domyślne zachowanie zablokować:

```javascript
function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "" });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log("Wysyłam:", form);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange} />
            <input name="email" value={form.email} onChange={handleChange} />
            <button type="submit">Wyślij</button>
        </form>
    );
}
```

`e.preventDefault()` zatrzymuje domyślne zachowanie przeglądarki (przeładowanie strony), dzięki czemu funkcja `handleSubmit` może spokojnie zrobić to, co ma zrobić - na razie tylko wypisać dane, docelowo wysłać je do backendu.

## 5. Walidacja przed wysłaniem

Prosta walidacja to sprawdzenie warunków na danych z formularza i zapisanie komunikatu błędu w stanie, jeśli coś jest nie tak:

```javascript
function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "" });
    const [error, setError] = useState("");

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (form.name.trim() === "") {
            setError("Podaj imię.");
            return;
        }

        if (!form.email.includes("@")) {
            setError("Podaj poprawny adres e-mail.");
            return;
        }

        setError("");
        console.log("Formularz poprawny:", form);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange} />
            <input name="email" value={form.email} onChange={handleChange} />
            {error && <p>{error}</p>}
            <button type="submit">Wyślij</button>
        </form>
    );
}
```

Każdy warunek, który nie przejdzie, ustawia komunikat i przerywa funkcję przez `return` - dalszy kod (wysłanie danych) nie wykona się, dopóki dane nie będą poprawne. `{error && <p>{error}</p>}` pokazuje komunikat tylko wtedy, gdy `error` nie jest pustym stringiem.

To walidacja na poziomie formularza (frontend) - ułatwia użytkownikowi pracę i oszczędza zbędne żądania do serwera, ale nie zastępuje walidacji po stronie backendu, która i tak musi tam być (backend nigdy nie ufa danym z frontu).

## 6. Upload pliku

Pole `<input type="file">` jest wyjątkiem od reguły komponentów kontrolowanych - z powodów bezpieczeństwa przeglądarka nie pozwala programowo ustawić, jaki plik jest "wybrany" w takim polu, więc nie da się dać mu `value` tak jak innym inputom. Zamiast tego po prostu odczytuje się, co użytkownik wybrał:

```javascript
function PhotoInput() {
    const [file, setFile] = useState(null);

    function handleFileChange(e) {
        setFile(e.target.files[0]);
    }

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {file && <p>Wybrano: {file.name}</p>}
        </div>
    );
}
```

`e.target.files` to lista wybranych plików (przy polu bez atrybutu `multiple` zawsze ma maksymalnie jeden element), więc `e.target.files[0]` daje pierwszy (i jedyny) wybrany plik. Obiekt pliku ma m.in. `name`, `size` i `type`.

## 7. Przygotowanie danych przez FormData

Sam wybrany plik to za mało - żeby wysłać go razem z resztą pól formularza, dane trzeba spakować do obiektu `FormData`. To specjalny format, który potrafi nieść zarówno zwykłe pola tekstowe, jak i pliki w jednym pakiecie:

```javascript
function buildFormData(form, file) {
    const data = new FormData();

    data.append("name", form.name);
    data.append("category", form.category);
    data.append("photo", file);

    return data;
}
```

`append(klucz, wartość)` dodaje kolejne pole do paczki - działa zarówno dla zwykłego tekstu, jak i dla obiektu pliku. Samo wysłanie tak przygotowanych danych do backendu (przez `fetch`) to temat kolejnej lekcji - tu ważne jest umieć taką paczkę poprawnie złożyć.

## 8. Pełny przykład - formularz dodawania produktu

Wszystko razem: kilka pól tekstowych, `select`, `checkbox`, upload pliku, walidacja i przygotowanie `FormData`:

```javascript
import { useState } from "react";

function ProductForm() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "elektronika",
        available: true
    });
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState("");

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (form.name.trim() === "") {
            setError("Nazwa produktu jest wymagana.");
            return;
        }

        if (!photo) {
            setError("Dodaj zdjęcie produktu.");
            return;
        }

        setError("");

        const data = new FormData();
        data.append("name", form.name);
        data.append("description", form.description);
        data.append("category", form.category);
        data.append("available", form.available);
        data.append("photo", photo);

        console.log("Gotowe do wysłania:", data);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                placeholder="Nazwa produktu"
                value={form.name}
                onChange={handleChange}
            />

            <textarea
                name="description"
                placeholder="Opis"
                value={form.description}
                onChange={handleChange}
            />

            <select name="category" value={form.category} onChange={handleChange}>
                <option value="elektronika">Elektronika</option>
                <option value="ksiazki">Książki</option>
                <option value="odziez">Odzież</option>
            </select>

            <label>
                <input
                    type="checkbox"
                    name="available"
                    checked={form.available}
                    onChange={handleChange}
                />
                Dostępny od ręki
            </label>

            <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

            {error && <p>{error}</p>}

            <button type="submit">Dodaj produkt</button>
        </form>
    );
}

export default ProductForm;
```

Warto zwrócić uwagę na `handleChange` - obsługuje teraz trzy różne typy pól jedną funkcją. Destrukturyzacja `const { name, value, type, checked } = e.target` wyciąga wszystko naraz, a wyrażenie `type === "checkbox" ? checked : value` decyduje, czy do stanu ma trafić `checked` (dla checkboxa) czy `value` (dla reszty pól). Plik trzymany jest osobno w `photo`, bo pole plikowe i tak nie mogłoby być częścią tego samego kontrolowanego obiektu stanu.

## Najczęstsze błędy

**Brak `e.preventDefault()` w `onSubmit`.** Strona przeładowuje się po kliknięciu "Wyślij", a cały stan aplikacji znika. To jeden z pierwszych błędów, na jaki trafia prawie każdy przy pierwszym formularzu w React.

**`value` bez `onChange`.** Pole wygląda na zablokowane - da się w nie kliknąć, ale nic nie da się wpisać, bo `value` cały czas jest sztywno ustawiane na starą wartość ze stanu.

**Mylenie `value` z `checked` przy checkboxach.** Checkbox nie ma sensownego `value` do kontrolowania w ten sposób - trzeba użyć `checked` i odczytywać `e.target.checked`, nie `e.target.value`.

**Próba ustawienia `value` na polu typu file.** Przeglądarka nie pozwala programowo ustawić wybranego pliku - pole `type="file"` odczytuje się przez `onChange` i `e.target.files`, ale nigdy nie kontroluje przez `value`.

**Aktualizacja jednego pola bez spreadu reszty.** `setForm({ name: e.target.value })` zamiast `setForm({ ...form, name: e.target.value })` bezpowrotnie kasuje wszystkie inne pola obiektu stanu - zostaje tylko to jedno, które właśnie zaktualizowano.

## Co trzeba zapamiętać

```text
komponent kontrolowany
→ value/checked ze stanu + onChange aktualizujący stan

kilka pól
→ osobne useState (mało pól) albo jeden obiekt stanu ze spreadem (dużo pól)

onSubmit
→ zawsze z e.preventDefault(), inaczej przeładowanie strony

walidacja
→ sprawdzenie warunków przed wysłaniem, komunikat błędu w osobnym stanie

input type="file"
→ wyjątek: brak value, odczyt przez e.target.files[0]

FormData
→ pakuje tekst i pliki razem, gotowe do wysłania przez fetch (kolejna lekcja)
```
