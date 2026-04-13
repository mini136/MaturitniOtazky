# Metodiky a životní cyklus vývoje softwaru

## Životní cyklus softwaru (SDLC)

Fáze vývoje od nápadu po údržbu:

```
Analýza → Návrh → Implementace → Testování → Nasazení → Údržba
```

### Fáze:
1. **Analýza požadavků** — co systém má dělat (funkční a nefunkční požadavky)
2. **Návrh (Design)** — architektura, datový model, UML diagramy
3. **Implementace** — psaní kódu
4. **Testování** — unit, integrační, systémové, akceptační
5. **Nasazení (Deployment)** — uvedení do provozu
6. **Údržba** — opravy chyb, vylepšení

## Vodopádový model (Waterfall)

```
Analýza → Návrh → Implementace → Testování → Nasazení
    ↓         ↓          ↓            ↓          ↓
(nelze se vrátit zpět bez velké ceny)
```

- Sekvenční, každá fáze musí být dokončena před další
- **Výhody:** jednoduchost, jasné milníky, dokumentace
- **Nevýhody:** neflexibilní, pozdní zpětná vazba, obtížné změny
- **Použití:** kritické systémy (letectví, medicína), jasné požadavky

## Agilní metodiky

Iterativní přístup s krátkými cykly a průběžnou zpětnou vazbou.

### Manifest Agilního vývoje (2001):
- **Jednotlivci a interakce** > procesy a nástroje
- **Fungující software** > dokumentace
- **Spolupráce se zákazníkem** > vyjednávání smluv
- **Reagování na změny** > dodržování plánu

### Scrum
```
Product Backlog → Sprint Planning → Sprint (2-4 týdny) → Review → Retrospektiva
                                    Daily Standup ↺
```

**Role:**
- Product Owner — co se bude dělat (priority)
- Scrum Master — odstraňuje překážky
- Development Team — samořídící vývojový tým

**Artefakty:**
- Product Backlog — seznam všech požadavků
- Sprint Backlog — úkoly pro aktuální sprint
- Increment — hotový kus softwaru

### Kanban
- Vizuální tabule: To Do → In Progress → Done
- Limit WIP (Work In Progress) — max počet úkolů rozpracovaných současně
- Průběžný tok (bez sprintů)

## Další přístupy

### Spirálový model
Kombinace vodopádu a prototypování. Iterace s analýzou rizik.

### DevOps
- Propojení vývoje (Dev) a provozu (Ops)
- CI/CD — Continuous Integration / Continuous Deployment
- Automatizace: build, test, deploy

```
Code → Build → Test → Release → Deploy → Monitor
  ↑___________________________________________|
```

### RUP (Rational Unified Process)
Iterativní, use-case driven. Fáze: Inception, Elaboration, Construction, Transition.

## Verzování kódu

### Git:
- **Repository** — úložiště kódu
- **Commit** — snapshot změn
- **Branch** — větev vývoje
- **Merge** — sloučení větví
- **Pull Request** — review kódu před mergem

### Git Flow:
```
main ────────────●──────────●────── (produkce)
                /          /
develop ──●──●──●──●──●──●── (vývoj)
           \      /
feature ────●──●── (nová funkce)
```

## UML diagramy

- **Use Case** — případy užití (actor + systém)
- **Class diagram** — třídy a vztahy
- **Sequence diagram** — interakce v čase
- **Activity diagram** — workflow/flowchart
- **State diagram** — stavy objektu
