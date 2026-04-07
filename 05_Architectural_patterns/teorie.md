# Architectural Design Patterns

## MVC (Model-View-Controller)

Odděluje aplikaci do tří vrstev:

```
Uzivatel → [Controller] → [Model]
                ↓              ↓
           [View] ←────── data
```

| Vrstva | Odpovědnost |
|--------|-------------|
| **Model** | Data, business logika, komunikace s DB |
| **View** | Zobrazení dat uživateli (UI) |
| **Controller** | Zpracovává vstupy, řídí tok, propojuje Model a View |

**Výhody:** Oddělení zodpovědností, testovatelnost, znovupoužitelnost
**Nevýhody:** Složitější pro malé projekty
**Použití:** ASP.NET MVC, Django, Spring MVC, Ruby on Rails

### Varianty:
- **MVP** (Model-View-Presenter) — Presenter místo Controlleru, View je pasivní
- **MVVM** (Model-View-ViewModel) — data binding, WPF, Xamarin, Vue.js

## Multitier (Vícevrstvá architektura)

Rozdělení na logické/fyzické vrstvy:

```
[Prezentační vrstva]     UI, webový prohlížeč
        ↕
[Aplikační/Business]     Logika, API, služby
        ↕
[Datová vrstva]          Databáze, úložiště
```

- **2-tier:** Klient ↔ Databáze
- **3-tier:** Klient ↔ Server ↔ Databáze (nejčastější)
- **N-tier:** Více vrstev (cache, message queue, microservices)

## Monolithic (Monolitická architektura)

- Celá aplikace v **jednom celku** (jeden projekt, jeden deployment)
- Jednoduchý vývoj a nasazení pro malé projekty
- Špatné škálování, obtížná údržba velkých systémů

```
[Jedna aplikace]
├── UI modul
├── Business logika
├── Datový přístup
└── Utility
```

**Výhody:** Jednoduchost, žádná síťová komunikace mezi moduly
**Nevýhody:** Nelze škálovat jednotlivé části, dlouhé buildy, složitý deployment

### vs. Microservices
- Microservices = každá služba je samostatný proces
- Komunikace přes REST API, message queue
- Nezávislé nasazení a škálování

## Peer-to-Peer (P2P)

- Všechny uzly jsou **rovnocenné** (žádný centrální server)
- Každý uzel je klient i server zároveň

```
[Peer A] ←→ [Peer B]
   ↕            ↕
[Peer C] ←→ [Peer D]
```

**Použití:** BitTorrent, blockchain, IPFS
**Výhody:** Odolnost proti výpadku, škálovatelnost
**Nevýhody:** Bezpečnost, konzistence dat, NAT traversal

## Client/Server

- **Server** poskytuje služby (centrální)
- **Klient** se připojuje a využívá služby

```
[Klient 1] ──→ [Server] ←── [Klient 3]
[Klient 2] ──↗
```

**Použití:** Webové aplikace, e-mail, databáze
**Výhody:** Centrální správa, bezpečnost
**Nevýhody:** Single point of failure, škálovatelnost serveru
