# Výjimky, aserce a debugování

## Výjimky (Exceptions)

### Princip:
- Mechanismus zpracování **chybových stavů** za běhu programu
- Odděluje normální tok programu od zpracování chyb
- Výjimka se "vyhodí" (throw/raise) a "chytí" (catch/except)

### Hierarchie výjimek:
```
BaseException
├── SystemExit
├── KeyboardInterrupt
└── Exception
    ├── ValueError
    ├── TypeError
    ├── IndexError
    ├── KeyError
    ├── FileNotFoundError
    ├── ZeroDivisionError
    ├── AttributeError
    ├── IOError
    └── RuntimeError
```

### Try-Catch-Finally:
```
try {
    // rizikový kód
} catch (SpecificException e) {
    // zpracování konkrétní výjimky
} catch (Exception e) {
    // zpracování obecné výjimky
} finally {
    // VŽDY se provede (uklízení prostředků)
}
```

### Checked vs Unchecked (Java):
- **Checked** — musí se ošetřit (IOException, SQLException) — kompilátor vynutí
- **Unchecked** — Runtime výjimky (NullPointerException, ArrayIndexOutOfBoundsException) — nemusí se ošetřit

### Vlastní výjimky:
- Dědění z Exception / RuntimeException
- Specifické chybové stavy aplikace

## Aserce (Assertions)

### Princip:
- **Kontrola předpokladů** — podmínka, která MUSÍ platit
- Pokud neplatí → chyba programátora (ne uživatele)
- Lze vypnout v produkci (`python -O`, `java -da`)

### Použití:
- Preconditions — kontrola vstupů parametrů (interních)
- Postconditions — kontrola výstupu funkce
- Invarianty — stav, který musí vždy platit

### Aserce vs Výjimky:
| | Aserce | Výjimka |
|-|--------|---------|
| Účel | Bug v kódu | Očekávaná chyba |
| Produkce | Lze vypnout | Vždy aktivní |
| Příklad | `assert len(data) > 0` | `raise ValueError("prázdná data")` |
| Kdo může opravit | Programátor | Uživatel/systém |

## Debugování

### Techniky:
1. **Print/Log debugging** — výpisy hodnot proměnných
2. **Debugger** — breakpoints, step-through, watches
3. **Rubber duck debugging** — vysvětli problém nahlas

### Debugger funkce:
- **Breakpoint** — zastavení na řádku
- **Step Over** (F10) — přeskočí funkci
- **Step Into** (F11) — vstoupí do funkce
- **Step Out** (Shift+F11) — vystoupí z funkce
- **Watch** — sledování hodnoty proměnné
- **Call Stack** — kde jsme v hierarchii volání
- **Conditional Breakpoint** — zastaví jen při splnění podmínky

### Logování vs Print:
| | print() | logging |
|-|---------|---------|
| Úrovně | Ne | DEBUG, INFO, WARNING, ERROR, CRITICAL |
| Vypnutí | Manuální | Konfigurace |
| Formát | Vlastní | Timestamp, level, modul |
| Výstup | stdout | Soubor, konsole, server |
