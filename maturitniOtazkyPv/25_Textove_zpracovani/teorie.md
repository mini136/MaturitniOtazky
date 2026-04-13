# Zpracování a parsování textových dat, regulární výrazy

## Zpracování textu

### Základní operace:
| Operace | Python | Popis |
|---------|--------|-------|
| Rozdělení | `s.split(',')` | Rozdělí řetězec na seznam |
| Spojení | `', '.join(lst)` | Spojí seznam do řetězce |
| Hledání | `s.find('abc')`, `'abc' in s` | Nalezení podřetězce |
| Nahrazení | `s.replace('a', 'b')` | Nahradí výskyty |
| Oříznutí | `s.strip()` | Odstraní whitespace |
| Velká/malá | `s.upper()`, `s.lower()`, `s.title()` | Konverze velikosti |
| Formátování | `f"Ahoj {jmeno}"` | F-string interpolace |

### Kódování:
- **ASCII** — 7 bitů, 128 znaků (anglická abeceda)
- **Latin-1/ISO-8859-1** — 8 bitů, 256 znaků (západoevropské)
- **UTF-8** — proměnná délka (1-4 bajty), zpětně kompatibilní s ASCII
- **UTF-16** — 2 nebo 4 bajty (Java, C# interně)

## Regulární výrazy (Regex)

### Metaznaky:
| Znak | Význam | Příklad |
|------|--------|---------|
| `.` | Libovolný znak (kromě \n) | `a.c` → abc, a1c |
| `*` | 0 nebo více opakování | `ab*c` → ac, abc, abbc |
| `+` | 1 nebo více opakování | `ab+c` → abc, abbc |
| `?` | 0 nebo 1 opakování | `colou?r` → color, colour |
| `{n}` | Přesně n opakování | `a{3}` → aaa |
| `{n,m}` | n až m opakování | `a{2,4}` → aa, aaa, aaaa |
| `^` | Začátek řetězce | `^Hello` |
| `$` | Konec řetězce | `world$` |
| `\|` | Alternativa (OR) | `cat\|dog` |
| `()` | Skupina (group) | `(ab)+` → ab, abab |
| `[]` | Třída znaků | `[aeiou]` → samohláska |
| `[^]` | Negace třídy | `[^0-9]` → ne-číslice |

### Zkratkové třídy:
| Zkratka | Význam | Ekvivalent |
|---------|--------|------------|
| `\d` | Číslice | `[0-9]` |
| `\D` | Ne-číslice | `[^0-9]` |
| `\w` | Word character | `[a-zA-Z0-9_]` |
| `\W` | Ne-word | `[^a-zA-Z0-9_]` |
| `\s` | Whitespace | `[ \t\n\r\f\v]` |
| `\S` | Ne-whitespace | `[^ \t\n\r\f\v]` |
| `\b` | Hranice slova | `\bword\b` |

### Kvantifikátory — greedy vs lazy:
- **Greedy** (default): `.*` → matchne co nejvíc
- **Lazy** (s `?`): `.*?` → matchne co nejméně
- Příklad: `<.*>` na `<b>text</b>` matchne celý `<b>text</b>`
- Příklad: `<.*?>` matchne jen `<b>` (první tag)

### Python re modul:
| Funkce | Popis |
|--------|-------|
| `re.search(pattern, text)` | První výskyt kdekoliv |
| `re.match(pattern, text)` | Pouze od začátku řetězce |
| `re.findall(pattern, text)` | Všechny výskyty (seznam) |
| `re.finditer(pattern, text)` | Iterátor Match objektů |
| `re.sub(pattern, repl, text)` | Nahrazení |
| `re.split(pattern, text)` | Rozdělení |
| `re.compile(pattern)` | Kompilace pro opakované použití |

### Flagy:
- `re.IGNORECASE` / `re.I` — case-insensitive
- `re.MULTILINE` / `re.M` — `^` a `$` pro každý řádek
- `re.DOTALL` / `re.S` — `.` matchne i `\n`

## Parsování

### Formáty:
- **CSV** — `csv` modul, oddělovač (čárka, středník)
- **JSON** — `json.loads()` / `json.dumps()`
- **XML/HTML** — `xml.etree.ElementTree`, `BeautifulSoup`
- **INI/Config** — `configparser`
- **YAML** — `pyyaml`

### Tokenizace:
Rozklad textu na tokeny (slova, symboly, čísla) — základ pro kompilátory a NLP.
