# Integrita dat, bezpečnost, logování, kontrola vstupů, zpracování chyb

## Integrita dat

Zajištění **správnosti a konzistence** dat v systému.

### Typy integrity:
- **Entitní** — každý záznam má unikátní identifikátor (Primary Key)
- **Referenční** — cizí klíče odkazují na existující záznamy (Foreign Key)
- **Doménová** — hodnoty musí být v povoleném rozsahu (CHECK, NOT NULL)
- **Uživatelská** — business pravidla (např. věk >= 0)

### Transakce (ACID):
- **Atomicity** — vše nebo nic
- **Consistency** — data jsou konzistentní před i po transakci
- **Isolation** — transakce se navzájem neovlivňují
- **Durability** — potvrzená data přežijí výpadek

## Bezpečnost

### Základní principy:
- **Authentication** — ověření identity (kdo jsi?)
- **Authorization** — oprávnění (co smíš?)
- **Encryption** — šifrování dat (at rest, in transit)
- **Hashing** — jednosměrná funkce pro hesla (bcrypt, argon2)

### Běžné útoky:
| Útok | Popis | Obrana |
|------|-------|--------|
| SQL Injection | Vložení SQL do vstupu | Parametrizované dotazy |
| XSS | Vložení scriptu do HTML | Escapování výstupu |
| CSRF | Falešný požadavek za uživatele | CSRF token |
| Brute Force | Hádání hesla | Rate limiting, lockout |

## Logování

Záznam událostí pro **debugging, audit, monitoring**.

### Log úrovně:
| Úroveň | Použití |
|---------|---------|
| DEBUG | Detailní informace pro vývoj |
| INFO | Běžné události |
| WARNING | Potenciální problém |
| ERROR | Chyba, ale aplikace běží |
| CRITICAL | Fatální chyba |

### Best practices:
- Logovat KDO, CO, KDY, VÝSLEDEK
- Nikdy nelogovat hesla a citlivá data
- Strukturované logy (JSON)
- Rotace logů (aby nezaplnily disk)

## Kontrola vstupů (Input Validation)

- **Nikdy nedůvěřuj vstupu od uživatele!**
- Validace na straně serveru (klient lze obejít)
- Whitelist > Blacklist
- Sanitizace — odstranění nebezpečných znaků

### Typy:
- **Délka** — min/max délka řetězce
- **Formát** — regex (e-mail, telefon)
- **Rozsah** — číselné limity
- **Typ** — správný datový typ

## Zpracování chyb

### Strategie:
- **Fail fast** — okamžitě zastavit při chybě
- **Graceful degradation** — omezená funkčnost místo pádu
- **Retry** — opakování transientních chyb
- **Circuit breaker** — zastavení opakování po sérii selhání
