```js
let users = [
    {
        id: 1,
        name: "Konrad",
        email: "konrad@konrad.pl"
    },
    {
        id: 2,
        name: "Konrad2",
        email: "konrad2@konrad.pl"
    },
    {
        id: 3,
        name: "Konrad3",
        email: "konrad3@konrad.pl"
    }
];
```

### Grupa 1 - GET + OPTIONS

**1. GET `/api/users/:id`**
Pobierz użytkownika po `id`. Jeśli nie istnieje → `404`.

**2. OPTIONS `/api/users`**
Zwróć w nagłówku `Allow` wszystkie dostępne metody:
`GET, POST, PUT, PATCH, DELETE, OPTIONS`.

---

### Grupa 2 - GET + POST

**1. GET `/api/users/search?name=...`**
Wyszukaj użytkowników po części imienia.

**2. POST `/api/users`**
Dodaj nowego użytkownika. `name` i `email` są wymagane.

---

### Grupa 3 - GET + DELETE

**1. GET `/api/users`**
Zwróć wszystkich użytkowników.

**2. DELETE `/api/users/:id`**
Usuń użytkownika po `id`. Jeśli nie istnieje → `404`.

---

### Grupa 4 - PUT + PATCH

**1. PUT `/api/users/:id`**
Zastąp dane użytkownika. Muszą być podane **oba pola**: `name` i `email`.

**2. PATCH `/api/users/:id`**
Zmień tylko te pola, które zostały przesłane.

---

### Grupa 5 - POST + DELETE

**1. POST `/api/users`**
Dodaj użytkownika z automatycznie nadanym `id`. Sprawdź, czy `name` i `email` zostały podane.

**2. DELETE `/api/users/:id`**
Usuń użytkownika po `id` za pomocą `findIndex()` i `splice()`.