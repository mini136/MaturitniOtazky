# Soubory a serializace — Ukládání a načítání dat, formáty souborů

## Práce se soubory

### Základní operace:
1. **Otevření** souboru (open)
2. **Čtení/Zápis** dat (read/write)
3. **Zavření** souboru (close)

### Režimy otevření:
| Režim | Popis |
|-------|-------|
| `r` | Čtení (read) |
| `w` | Zápis, přepíše obsah (write) |
| `a` | Připojení na konec (append) |
| `rb/wb` | Binární režim |
| `r+` | Čtení i zápis |

### Textové vs Binární soubory:
- **Textové:** čitelné člověkem, kódování (UTF-8), znaky
- **Binární:** surová data, obrázky, video, serializované objekty

## Formáty souborů

### JSON (JavaScript Object Notation)
```json
{
    "jmeno": "Alice",
    "vek": 25,
    "jazyky": ["Python", "Java"]
}
```
- Textový, čitelný, univerzální
- Podporuje: string, number, boolean, null, array, object
- Použití: API, konfigurace, data exchange

### XML (eXtensible Markup Language)
```xml
<student>
    <jmeno>Alice</jmeno>
    <vek>25</vek>
</student>
```
- Verbose, ale flexibilní
- Podporuje schéma (XSD), transformace (XSLT)
- Použití: konfigurace, SOAP, starší systémy

### CSV (Comma-Separated Values)
```
jmeno,vek,obor
Alice,25,IT
Bob,22,Design
```
- Jednoduchý, tabulkový
- Problémy: oddělovač v datech, kódování
- Použití: export/import dat, tabulkové procesory

### YAML
```yaml
student:
  jmeno: Alice
  vek: 25
  jazyky:
    - Python
    - Java
```
- Čitelný, odsazením (jako Python)
- Použití: konfigurace (Docker, Kubernetes, CI/CD)

## Serializace

Proces převodu objektu na **formát pro uložení nebo přenos** (a zpět = deserializace).

```
Objekt → [Serializace] → Bajty/Text → [Uložení/Přenos]
Bajty/Text → [Deserializace] → Objekt
```

### Typy:
- **Textová:** JSON, XML, YAML — čitelná, přenositelná
- **Binární:** pickle (Python), BinaryFormatter (C#) — kompaktní, rychlá
- **Protobuf/MessagePack** — výkonná binární serializace (Google, cross-platform)

### Bezpečnost:
- **Nikdy nedeserializovat nedůvěryhodná data!** (pickle, BinaryFormatter)
- Útočník může vložit škodlivý kód → Remote Code Execution
- Preferovat JSON pro nedůvěryhodná data

## Stream (proud dat)
- Abstrakce pro sekvenční čtení/zápis
- FileStream, MemoryStream, NetworkStream
- Buffering — čtení/zápis po blocích (výkon)
