# INF.04 — Node.js, JavaScript, serwery i backend

**Zestaw 34 pytań jednokrotnego wyboru (A–D)**

## Część I — Pytania z internetowych baz INF.04 (parafrazy)

**1. Do czego służy środowisko Node.js?**

A. Wyłącznie do tworzenia arkuszy CSS.  
B. Do uruchamiania kodu JavaScript poza przeglądarką, m.in. po stronie serwera.  
C. Do zarządzania sprzętem sieciowym przez BIOS.  
D. Wyłącznie do tworzenia relacyjnych baz danych.

**2. Czym jest ESLint?**

A. Systemem zarządzania bazami danych.  
B. Serwerem HTTP.  
C. Narzędziem do statycznej analizy kodu JavaScript.  
D. Kompilatorem języka Java.

**3. Który operator JavaScript porównuje wartości bez konwersji typów?**

A. `==`  
B. `=`  
C. `!=`  
D. `===`

**4. Która z wymienionych nazw nie jest odrębnym typem danych w JavaScript?**

A. `number`  
B. `integer`  
C. `boolean`  
D. `string`

**5. Na czym polega hoisting w JavaScript?**

A. Na przeniesieniu kodu do osobnego pliku.  
B. Na automatycznej konwersji liczby na tekst.  
C. Na sposobie przetwarzania deklaracji przed wykonaniem kodu w danym zakresie.  
D. Na usuwaniu nieużywanych zmiennych.

**6. Jak należy ograniczać dostęp do chronionych zasobów aplikacji internetowej?**

A. Przez uwierzytelnianie użytkownika i kontrolę uprawnień po stronie serwera.  
B. Wyłącznie przez ukrycie przycisków w interfejsie.  
C. Przez zmianę koloru strony.  
D. Wyłącznie przez użycie plików CSS.

**7. Która metoda HTTP jest zwykle wykorzystywana do pełnego zastąpienia lub aktualizacji zasobu?**

A. `GET`  
B. `HEAD`  
C. `OPTIONS`  
D. `PUT`

**8. Czym jest JWT?**

A. Językiem programowania aplikacji serwerowych.  
B. Formatem tokenu służącym do przekazywania zestawu oświadczeń (claims).  
C. Relacyjną bazą danych.  
D. Protokołem transferu plików.

**9. Który mechanizm umożliwia przechowywanie niewielkich danych po stronie przeglądarki i ich przesyłanie do serwera zgodnie z regułami cookies?**

A. DNS  
B. FTP  
C. Cookies  
D. TCP

**10. Który zapis przedstawia funkcję strzałkową JavaScript?**

A. `() => {}`  
B. `function => ()`  
C. `def funkcja():`  
D. `public void funkcja()`

**11. Który protokół transportowy zapewnia niezawodne, uporządkowane dostarczanie strumienia bajtów?**
[click me](https://chatgpt.com/s/w_6adcebe842308191839cbb12295b07a9) <br>
A. UDP  
B. IP  
C. DNS  
D. TCP

**12. Które narzędzie jest rozproszonym systemem kontroli wersji?**

A. Postman  
B. Git  
C. MySQL  
D. Apache HTTP Server

**13. Jakie dane przechowuje tablica asocjacyjna?**

A. Wyłącznie liczby całkowite w kolejności rosnącej.  
B. Tylko znaki ASCII.  
C. Pary klucz–wartość.  
D. Wyłącznie adresy IP.

**14. Który z wymienionych frameworków jest przeznaczony do tworzenia aplikacji internetowych w Pythonie?**

A. Django  
B. Express  
C. Spring Boot  
D. Angular

## Część II — Autorskie pytania treningowe

**15. Do czego służy npm w projektach Node.js?**

A. Do zarządzania pakietami i zależnościami projektu.  
B. Do uruchamiania bazy MySQL.  
C. Do kompilowania kodu Java.  
D. Do obsługi serwerów DNS.

**16. Która instrukcja tworzy instancję aplikacji Express, jeśli `express` zostało wcześniej zaimportowane?**

A. `express.listen()`  
B. `express.create()`  
C. `express()`  
D. `new Node()`

**17. Co zapewnia instrukcja `app.use(express.json())` w aplikacji Express?**

A. Konwersję dokumentów HTML na JSON.  
B. Parsowanie treści żądań JSON i udostępnienie danych w `req.body`.  
C. Automatyczne tworzenie pliku JSON na dysku.  
D. Uruchomienie serwera na porcie 3000.

**18. W której właściwości obiektu żądania Express znajduje się parametr `id` z trasy `/users/:id`?**

A. `req.body.id`  
B. `req.query.id`  
C. `res.params.id`  
D. `req.params.id`

**19. Jak odczytać wartość parametru `name` z adresu `/users?name=Adam` w Express?**

A. `req.query.name`  
B. `req.params.name`  
C. `req.body.name`  
D. `res.query.name`

**20. Który kod odpowiedzi HTTP informuje o pomyślnym utworzeniu zasobu?**

A. `200 OK`  
B. `201 Created`  
C. `204 No Content`  
D. `404 Not Found`

**21. Który kod HTTP oznacza, że serwer nie znalazł żądanego zasobu?**

A. `400`  
B. `401`  
C. `500`  
D. `404`

**22. Do czego służy metoda `res.json()` w Express?**

A. Do pobierania rekordów z bazy danych.  
B. Do zatrzymywania procesu serwera.  
C. Do wysyłania odpowiedzi w formacie JSON.  
D. Do instalowania pakietów npm.

**23. Która metoda HTTP służy standardowo do pobierania reprezentacji zasobu?**

A. `GET`  
B. `POST`  
C. `PATCH`  
D. `DELETE`

**24. Która metoda HTTP służy do częściowej modyfikacji zasobu?**

A. `POST`  
B. `PATCH`  
C. `OPTIONS`  
D. `HEAD`

**25. Jaką rolę pełni middleware w aplikacji Express?**

A. Służy wyłącznie do zapisywania plików.  
B. Kompiluje JavaScript do kodu maszynowego przed każdym żądaniem.  
C. Automatycznie usuwa wszystkie tabele bazy danych.  
D. Przetwarza żądania i może przekazywać sterowanie kolejnym funkcjom.

**26. Co robi wywołanie `next()` w typowym middleware Express?**

A. Kończy proces Node.js.  
B. Zawsze wysyła odpowiedź `200 OK`.  
C. Przekazuje sterowanie do kolejnego pasującego middleware lub handlera.  
D. Uruchamia nowy serwer HTTP.

**27. Co zwraca funkcja zadeklarowana z użyciem słowa kluczowego `async`?**

A. Zawsze obiekt `Promise`.  
B. Zawsze wartość `undefined`.  
C. Wyłącznie obiekt `Response`.  
D. Zawsze nowy wątek systemowy.

**28. Do czego służy operator `await` w JavaScript?**

A. Do deklarowania serwera HTTP.  
B. Do oczekiwania na rozstrzygnięcie wartości typu Promise.  
C. Do tworzenia tablic.  
D. Do natychmiastowego zakończenia programu.

**29. Co zazwyczaj zawiera plik `package.json` w projekcie Node.js?**

A. Wyłącznie kod aplikacji serwerowej.  
B. Hasła wszystkich użytkowników.  
C. Strukturę tabel SQL w formacie binarnym.  
D. Metadane projektu, skrypty i zależności.

**30. Jakim poleceniem uruchomisz plik `app.js` za pomocą Node.js?**

A. `npm install app.js`  
B. `node create app.js`  
C. `node app.js`  
D. `javascript start app.js`

**31. Co oznacza kod odpowiedzi HTTP `500`?**

A. Wewnętrzny błąd serwera.  
B. Nie znaleziono zasobu.  
C. Brak uwierzytelnienia.  
D. Pomyślne wykonanie żądania.

**32. Co oznacza skrót CRUD?**

A. Create, Run, Update, Deploy.  
B. Create, Read, Update, Delete.  
C. Copy, Read, Upload, Delete.  
D. Connect, Render, Update, Debug.

**33. Do czego służy biblioteka Multer używana z Express?**

A. Do generowania tokenów JWT.  
B. Do nawiązywania połączenia z PostgreSQL.  
C. Do obsługi przesyłanych plików w żądaniach `multipart/form-data`.  
D. Do przeprowadzania testów jednostkowych.

**34. Które rozwiązanie skutecznie ogranicza ryzyko SQL Injection przy przekazywaniu danych do zapytań SQL?**

A. Ukrywanie kodu frontendowego.  
B. Zmiana portu serwera HTTP.  
C. Zastąpienie wszystkich metod POST metodą GET.  
D. Stosowanie zapytań parametryzowanych.

---

## Klucz odpowiedzi

| Nr | Odpowiedź | Nr | Odpowiedź | Nr | Odpowiedź | Nr | Odpowiedź |
|---:|:---:|---:|:---:|---:|:---:|---:|:---:|
| 1 | B | 2 | C | 3 | D | 4 | B |
| 5 | C | 6 | A | 7 | D | 8 | B |
| 9 | C | 10 | A | 11 | D | 12 | B |
| 13 | C | 14 | A | 15 | A | 16 | C |
| 17 | B | 18 | D | 19 | A | 20 | B |
| 21 | D | 22 | C | 23 | A | 24 | B |
| 25 | D | 26 | C | 27 | A | 28 | B |
| 29 | D | 30 | C | 31 | A | 32 | B |
| 33 | C | 34 | D | | | | |

## Źródła baz i arkuszy

- https://zawodowe.edu.pl/technik-programista/INF.04/
- https://ee-informatyk.pl/inf04/egzamin/baza-pytan/
- https://www.kwalifikacje-w-zawodzie.pl/kwalifikacja-inf4-arkusze
- https://www.praktycznyegzamin.pl/inf04/praktyka/

**Zastrzeżenie:** zestaw służy do nauki; nie jest oficjalnym arkuszem CKE.
