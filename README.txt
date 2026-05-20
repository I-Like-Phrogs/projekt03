Portal społecznościowy do publikowania i zarządzania postami. Zbudowany w Node.js z hashowaniem haseł argon2 i sesją HMAC-bezpieczną.

FUNKCJE GŁÓWNE:
- Rejestracja i logowanie użytkowników
- Tworzenie, edycja i usuwanie postów (CRUD)
- Sesje z HMAC-SHA256 zabezpieczeniem
- System uprawnień (autor i administrator mogą edytować/usuwać posty)
- Konto administratora tworzone automatycznie (login: admin, hasło: overseer)

PLIKI:
- index.js - serwer i routing
- post_handling.js - zarządzanie postami i uprawnieniami
- user_handling.js - rejestracja i uwierzytelnianie
- session_handling.js - zarządzanie sesjami
- devactions.js - narzędzia do testowania

TESTOWANIE:
W pliku index.js są zmienne:
- nuke=true - usuwa dane z bazy przy starcie
- populate=true - tworzy 25 losowych testowych postów przy starcie
Po testach zmienić obie na false.

DOSTĘPNE TRASY:
GET /                    Strona główna
GET /forum              Lista postów (10 na stronę)
GET /login              Formularz logowania
GET /register           Formularz rejestracji
POST /authenticate_acc  Uwierzytelnienie użytkownika
POST /create_acc        Tworzenie nowego konta
GET /create             Formularz tworzenia postu
POST /create/new        Dodaj nowy post
GET /edit/:id           Formularz edycji posta
POST /edit/:id          Zapisz zmiany w poście
GET /delete/:id         Formularz usuwania posta
POST /delete/:id        Usuń post
GET /logout             Wyloguj użytkownika

BAZA DANYCH (SQLite - db.sqlite):
Tabela users: id, login (unikalne), password (zahaszowane argon2)
Tabela posts: id, title, user_id (klucz obcy), text
Tabela sessions: id, sessionId (unikalne, 32 znaki hex), userId (klucz obcy), sessionHash (HMAC-SHA256), createdAt, expiresAt (24h), lastActivity

BEZPIECZEŃSTWO:
- Ciasteczka chronione HMAC-SHA256 przed modyfikacją
- Hasła hashowane argon2
- Sesje oznaczone httpOnly i sameSite=strict
- Automatyczne czyszczenie wygasłych sesji co godzinę
- Każdy post edytować/usunąć może tylko autor lub administrator

INSTALACJA:
Komenda w terminalu:
npm install

URUCHOMIENIE:
node index.js
Serwer dostępny na http://localhost:8000
