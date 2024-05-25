# Reservation System - Micro Frontend

Objednávací systém na základe požiadavky pacienta, vysielajúceho, alebo odborného lekára.

## Use case #1

- [ ] (CREATE) Ako pacient chcem mať možnosť vytvoriť požiadavku na vyšetrenie na základe typu potrebného vyšetrenia.
- [ ] (READ) Ako pacientovi mi systém na základe požiadavky ponúkne ambulancie a voľné termíny.
- [ ] (CREATE) Ako pacient môžem potvrdiť alebo zamietnuť ponúknuté termíny.
- [ ] (READ) Ako ambulancia chcem vidieť, ktorí pacienti čakajú na vyšetrenie.
- [ ] (DELETE) Ako ambulancia môžem zamietnuť termín vyšetrenia.
- [ ] (DELETE) Ako pacient chcem mať možnosť odstrániť žiadosť o vyšetrenie.
- [ ] (UPDATE) Ako pacient chcem mať možnosť upraviť žiadosť o vyšetrenie.

## Use case #2

- [x] (CREATE) Ako ambulacia chcem mať možnosť vytvoriť ambulanciu s potrebnými parametrami.
- [x] (UPDATE) Ako ambulacia chcem mať možnosť upraviť parametre ambulancie.
- [x] (DELETE) Ako ambulancia chcem mať možnosť odstrániť ambulanciu.
- [x] (CREATE) Ako pacient chcem mať možnosť si vytvoriť profil.
- [x] (UPDATE) Ako pacient chcem mať možnosť upraviť svoj profil.
- [x] (DELETE) Ako pacient chcem mať možnosť odstrániť svoj profil.
- [x] (READ) Ako pacient chcem mať možnosť vidieť svoje žiadosti a termíny vyšetrení.

## 30 points

- [ ] Front-end: 6 bodov
  - [ ] Funkčnosť (podľa počtu študentov priradených k práci)
  - [ ] CRUD operácie
  - [ ] error handling/okrajové prípady použitia
  - [x] dizajn (material komponenty)
  - [x] web komponent - čitateľnosť kódu
- [ ] Go back-end: 6 bodov
  - [ ] API špecifikácia(swagger) - existencia a zmysluplnosť [https://editor.swagger.io/](https://editor.swagger.io/)
  - [ ] implementácia (CRUD)
  - [ ] api, db service - zmysluplná adresárová štruktúra
  - [ ] models, api, service
  - [ ] Konfigurácia
  - [ ] Databáza
  - [ ] error handling
- [x] Rozšírenie funkčnosti: 4 body
  - [x] Extra web element, použite iného Material elementu
  - [x] usecase má inú "mechaniku" ako ukážka zo skrípt
- [ ] Nasadenie na Azure (FE): 3 body
  - [ ] stránka funguje
- [ ] Nasadenie do spoločného klastra na Azure – 5 bodov
  - [ ] funkčný FE komponent
  - [ ] funkčnosť celej aplikácie (perzistencia)
- [ ] CI/CD-Flux – 6 bodov
  - [ ] existencia buildov a releasov a ich úspešnosť
  - [ ] docker push súčasťou CI

## Assignment

- [ ] Nahrajte zip súbor, ktorý obsahuje kópiu git repozitárov pre FE, BE a GitOps, a súbor README.md. V súbore README.md uveďte:
  - [x] Zadanie projektu + prípady použitia (podľa zadania)
  - [x] Mená členov tímu, ktorý sa podieľali na projekte
  - [x] Názov vašej aplikácie na spoločnom klastri
  - [x] Linka na Github repozitáre obsahujúce FE,BE a gitops. Predpokladáme, že sú public,
  v opačnom prípade poskytnite prístup čítania obsahu pre cvičiacich.
  - [ ] Linka na DockerHub registry, kde sú registrované použité softvérové kontajnery.
  - [x] Linka k FE aplikácii na spločnom klastri
  - [x] Názov deployment objektu pre UI
  - [x] Názov deploymentu pre webapi
  - [ ] Stručný opis riešenie k vyhodnoteteniu - informácie pre hodnotiacich, tak aby sa vedeli zorientovať vo Vašej funkcionalite
  - [ ] Linka na nasadenie samostatného web UI v Azure Cloud. Musí zobraziť aspoň nejký obsah, s prípadnou chybovou informáciou, že sa nevie pripojiť k web službe
