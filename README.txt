Projekt to prosty portal społecznościowy, został stworzony w środowisku node.js, poprzez komendę "npm init" po czym został podłączony z repozytorium na GitHubie. 
W folderze public znajduje się podstawowa strona główna html, ikona aplikacji oraz w folderze css plik style.css zawierający arkusze stylów do projektu. 
Folder views zawiera dynamiczne widoki ejs stosowane przez plik index.js do wyświetlania treści, w tym formularze do tworzenia nowych, edycji i usuwania wpisów. 
plik .gitignore służy w projekcie do blokowania niepotrzebnego dodawania folderu node_modules na repozytorium.

w kodzie index.js są dwie zmienne dla testowania przez dewelopera. var nuke=true usunie wszystkie posty i var populate=true stworzy 25 nowych losowych postów przy uruchomieniu aplikacji.
Od tych amiennych zależą funkcje w devactions.js wykonujące tą funkcjonalność.
UWAGA! - ustawić na true, uruchomić aplikację i od razu zmienić na false. Bez ustawienia na false funkcja będzie wykonywana za każdym uruchomieniem aplikacji.

Strona z postami: /forum - wyświetla listę wszystkich postów z tytułem, autorem i treścią na stronach po 10 postów
Formularz tworzenia: /create - zawiera formularz do tworzenia nowego posta
Tworzenie postu: /create/new - odbiera dane z formularza i dodaje nowy post do bazy danych
Formularz edycji: /edit/(id posta) - Formularz edycji posta. przy próbie edycji ze złym hasłem przekierowuje na /wrong_edit_key
Formularz usuwania: /delete/(id posta) - Formularz usuwania posta. przy próbie usunięcia ze złym hasłem przekierowuje na /wrong_edit_key
Wiadomość - złe hasło: /wrong_edit_key - wyświetla wiadomość o wprowadzeniu złego hasła edycji posta
Posty są przechowywane w bazie danych sqlite db.sqlite. Każdy post zawiera: tytuł, autora, treść posta i klucz edycji

KONFIGURACJA:
w środowisku node js konieczne jest wykonanie komend:
>npm install express
>npm install ejs
>npm install morgan
to instaluje dodatki używane przez aplikację

URUCHOMIENIE:
komenda "node index.js" w terminalu 
Serwer będzie dostępny na http://localhost:8000