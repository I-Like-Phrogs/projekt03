Projekt to prosty portal społecznościowy, został stworzony w środowisku node.js, poprzez komendę "npm init" po czym został podłączony z repozytorium na GitHubie. 
W folderze public znajduje się podstawowa strona główna html, ikona aplikacji oraz w folderze css plik style.css zawierający arkusze stylów do projektu. 
Folder views zawiera dynamiczne widoki ejs stosowane przez plik index.js do wyświetlania treści, w tym formularze do tworzenia nowych, edycji i usuwania wpisów. 
plik .gitignore służy w projekcie do blokowania niepotrzebnego dodawania folderu node_modules na repozytorium.

GŁÓWNE PLIKI:
- index.js - główny plik serwera z obsługą routingu
- post_handling.js - zarządzanie postami i uprawnieniami
- user_handling.js - rejestracja i uwierzytelnianie użytkowników
- session_handling.js - zarządzanie sesjami z HMAC-bezpieczeństwem
- devactions.js - narzędzia deweloperskie (tworzenie próbnych postów, czyszczenie bazy)

SYSTEM UWIERZYTELNIANIA:
Aplikacja teraz używa systemu rejestracji i logowania użytkowników z szyfrowaniem haseł argon2. Każdy post jest powiązany z konto użytkownika, które go utworzyło.
Użytkownik musi się zalogować aby móc tworzyć posty. Sesje użytkowników są przechowywane w bazie danych z zabezpieczeniem HMAC-SHA256, co zapobiega modyfikacji ciasteczek przez złośliwych użytkowników.

Przy pierwszym uruchomieniu aplikacji, konto administratora jest automatycznie tworzone z loginem "admin" i hasłem "overseer". Administrator ma możliwość edycji i usunięcia wszystkich postów.

SYSTEM UPRAWNIEŃ:
Każdy post może być edytowany i usunięty wyłącznie przez:
- Autora posta (użytkownika, który go stworzył)
- Administratora (konto admin)
Zwykli użytkownicy mogą widzieć przyciski edycji i usunięcia tylko dla swoich własnych postów (lub jeśli są administratorami).

w kodzie index.js są dwie zmienne dla testowania przez dewelopera. var nuke=true usunie dane z bazy i var populate=true stworzy (defaultowo) 25 nowych losowych postów przy uruchomieniu aplikacji.
Od tych zmiennych zależą funkcje w devactions.js wykonujące tą funkcjonalność.
UWAGA! - ustawić na true, uruchomić aplikację i od razu zmienić na false. Bez ustawienia na false funkcja będzie wykonywana za każdym uruchomieniem aplikacji.

ROUTES:
Strona główna: / - strona główna aplikacji
Strona z postami: /forum - wyświetla listę wszystkich postów z tytułem, autorem i treścią na stronach po 10 postów
Logowanie: /login - formularz logowania dla istniejących użytkowników
Rejestracja: /register - formularz rejestracji nowych kont użytkowników
Uwierzytelnienie: /authenticate_acc - odbiera dane z formularza logowania i tworzy sesję
Tworzenie konta: /create_acc - odbiera dane z formularza rejestracji i tworzy nowe konto
Formularz tworzenia: /create - zawiera formularz do tworzenia nowego posta (wymaga zalogowania)
Tworzenie postu: /create/new - odbiera dane z formularza i dodaje nowy post do bazy danych (wymaga zalogowania)
Formularz edycji: /edit/(id posta) - Formularz edycji posta
Edycja posta: POST /edit/(id posta) - zapisuje zmiany do posta
Formularz usuwania: /delete/(id posta) - Formularz usuwania posta z potwierdzeniem
Usunięcie posta: POST /delete/(id posta) - usuwa post z bazy danych
Wylogowanie: /logout - wylogowuje bieżącego użytkownika i czyści ciasteczko sesji

BAZA DANYCH:
Posty, użytkownicy i sesje są przechowywane w bazie danych sqlite db.sqlite.

Tabela users zawiera:
- id (PRIMARY KEY)
- login (wymagane, unikalne)
- password (wymagane, zahaszowane argon2)

Tabela posts zawiera:
- id (PRIMARY KEY)
- title (wymagane, tekst)
- user_id (wymagane, klucz obcy do tabeli users)
- text (wymagane, tekst)

Tabela sessions zawiera (HMAC-bezpieczne przechowywanie sesji):
- id (PRIMARY KEY)
- sessionId (wymagane, unikalne, 32-znakowe hex)
- userId (wymagane, klucz obcy do tabeli users)
- sessionHash (wymagane, sygnatura HMAC-SHA256 do zabezpieczenia przed modyfikacją ciasteczek)
- createdAt (data utworzenia sesji)
- expiresAt (data wygaśnięcia sesji - 24 godziny)
- lastActivity (data ostatniej aktywności)

BEZPIECZEŃSTWO SESJI:
Sesje są zabezpieczone przed modyfikacją ciasteczek poprzez:
- HMAC-SHA256 sygnatury: Każde ciasteczko sessionId ma przypisaną sygnaturę przechowywana w bazie danych
- Jeśli użytkownik spróbuje zmodyfikować wartość ciasteczka, sygnatura nie będzie zgadzać się z wartością w bazie danych i sesja zostanie odrzucona
- Automatyczne czyszczenie wygasłych sesji co godzinę (maksymalny czas życia sesji to 24 godziny)
- Ciasteczka oznaczone jako httpOnly (niedostępne z JavaScriptu) i sameSite=strict (ochrona przed atakami CSRF)

KONFIGURACJA:
w środowisku node js konieczne jest wykonanie komend:
>npm install express
>npm install ejs
>npm install morgan
>npm install cookie-parser
>npm install argon2

to instaluje dodatki używane przez aplikację

URUCHOMIENIE:
komenda "node index.js" w terminalu 
Serwer będzie dostępny na http://localhost:8000
