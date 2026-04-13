# Komunikace v síti — Berkeley Socket

## Síťový model

### OSI model (7 vrstev):
| Vrstva | Název | Protokoly |
|--------|-------|-----------|
| 7 | Aplikační | HTTP, FTP, DNS, SMTP |
| 6 | Prezentační | SSL/TLS, JPEG |
| 5 | Relační | NetBIOS |
| 4 | Transportní | **TCP**, **UDP** |
| 3 | Síťová | **IP**, ICMP, ARP |
| 2 | Linková | Ethernet, Wi-Fi |
| 1 | Fyzická | Kabely, signály |

### TCP/IP model (4 vrstvy):
Aplikační → Transportní → Síťová → Vrstva síťového rozhraní

## TCP vs UDP

| | TCP | UDP |
|-|-----|-----|
| Spojení | Spojované (handshake) | Nespojované |
| Spolehlivost | Garantované doručení | Bez záruky |
| Pořadí | Zachováno | Nezaručeno |
| Rychlost | Pomalejší | Rychlejší |
| Použití | HTTP, FTP, e-mail | DNS, streaming, hry |

## Berkeley Socket API

Standardní rozhraní pro síťovou komunikaci (1983, BSD Unix).

### Životní cyklus:

**Server:**
```
socket() → bind() → listen() → accept() → recv()/send() → close()
```

**Klient:**
```
socket() → connect() → send()/recv() → close()
```

### Klíčové funkce:
| Funkce | Popis |
|--------|-------|
| `socket()` | Vytvoří socket (AF_INET, SOCK_STREAM/SOCK_DGRAM) |
| `bind()` | Přiřadí adresu a port |
| `listen()` | Začne naslouchat (server) |
| `accept()` | Přijme spojení (blokující) |
| `connect()` | Připojí se k serveru (klient) |
| `send()/recv()` | Odesílání/přijímání dat |
| `close()` | Uzavře socket |

### Adresování:
- **IP adresa** — identifikace zařízení (IPv4: 192.168.1.1, IPv6: ::1)
- **Port** — identifikace služby (0-65535)
- Známé porty: HTTP=80, HTTPS=443, FTP=21, SSH=22, DNS=53

### Socket typy:
- `SOCK_STREAM` — TCP (proud bajtů, spolehlivý)
- `SOCK_DGRAM` — UDP (datagramy, nespolehlivý)

## Non-blocking a Asynchronní

- **Blocking:** `accept()`, `recv()` čekají do příchodu dat
- **Non-blocking:** okamžitě vrátí chybu, pokud nejsou data
- **Select/Poll:** čekání na více socketů najednou
- **Async I/O:** asyncio (Python), async/await (C#)
