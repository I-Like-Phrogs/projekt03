Projekt to prosty portal społecznościowy, został stworzony w środowisku node.js, poprzez komendę "npm init" po czym został podłączony z repozytorium na GitHubie. 
W folderze public znajduje się podstawowa strona główna html, ikona aplikacji oraz w folderze css plik style.css zawierający arkusze stylów do projektu. 
Folder views zawiera dynamiczne widoki ejs stosowane przez plik index.js do wyświetlania treści, w tym formularz do tworzenia nowych wpisów. 
plik .gitignore służy w projekcie do blokowania niepotrzebnego dodawania folderu node_modules na repozytorium.
Strona z postami: /forum - wyświetla listę wszystkich postów z tytułem, autorem i treścią
Formularz: /create - zawiera formularz do tworzenia nowego posta
Tworzenie postu: /create/new - odbiera dane z formularza i dodaje nowy post do listy
Posty są przechowywane w pamięci ulotnej w pliku post_handling.js. Każdy post zawiera: tytuł, autora, treść posta

URUCHOMIENIE:
komenda "node index.js" w terminalu 
Serwer będzie dostępny na http://localhost:8000




