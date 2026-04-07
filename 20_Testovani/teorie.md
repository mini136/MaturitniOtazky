# Testování, Unit testování a dokumentace

## Úrovně testování

```
                    ┌──────────────────┐
                    │ E2E testy        │ ← celý systém, UI
                    ├──────────────────┤
                    │ Integrační testy │ ← spolupráce komponent
                    ├──────────────────┤
                    │ Unit testy       │ ← jednotlivé funkce/třídy
                    └──────────────────┘
                    (testovací pyramida)
```

### Unit testy:
- Testují **jednu funkci/metodu** izolovaně
- Rychlé, automatizované, opakovatelné
- Nesmí záviset na externích systémech (DB, síť)

### Integrační testy:
- Testují **spolupráci** více komponent
- Připojení k DB, API volání
- Pomalejší než unit testy

### E2E (End-to-End) testy:
- Testují celý systém z pohledu uživatele
- Simulace reálného použití (Selenium, Playwright)
- Nejpomalejší, ale nejblíže realitě

## Principy testování

### AAA pattern:
1. **Arrange** — příprava dat a prostředí
2. **Act** — provedení testované akce
3. **Assert** — ověření výsledku

### FIRST principy:
- **F**ast — testy musí být rychlé
- **I**ndependent — nezávislé na sobě
- **R**epeatable — stejný výsledek při opakování
- **S**elf-validating — pass/fail bez manuální kontroly
- **T**imely — psát testy včas (ideálně před kódem)

## TDD (Test-Driven Development)

```
1. RED   — napiš test (který selže)
2. GREEN — napiš minimální kód (aby test prošel)
3. REFACTOR — vylepši kód (testy stále procházejí)
↺ opakuj
```

## Nástroje

| Jazyk | Framework | Příklad |
|-------|-----------|---------|
| Python | `unittest`, `pytest` | `assert result == expected` |
| Java | JUnit 5 | `@Test assertEquals(expected, actual)` |
| C# | NUnit, xUnit, MSTest | `[Test] Assert.AreEqual(expected, actual)` |
| JavaScript | Jest, Mocha | `expect(result).toBe(expected)` |

## Mocking a Stubbing
- **Mock** — falešný objekt simulující chování reálného
- **Stub** — vrací předdefinované odpovědi
- Použití: izolování testované jednotky od závislostí (DB, API)

## Pokrytí kódu (Code Coverage)
- **Statement** — kolik řádků kódu se provedlo
- **Branch** — kolik větví (if/else) se otestovalo
- **Path** — kolik cest programem se otestovalo
- Cíl: 70-90 % (100 % není vždy nutné/smysluplné)

## Dokumentace

### Typy:
- **Inline komentáře** — vysvětlení složitého kódu
- **Docstringy** — dokumentace funkcí/tříd (Python, Java)
- **API dokumentace** — Swagger/OpenAPI, Javadoc
- **README** — popis projektu, návod k instalaci
- **Wiki/Confluence** — komplexní dokumentace

### Docstring konvence (Python):
```python
def funkce(param1: int, param2: str) -> bool:
    """Kratky popis funkce.
    
    Args:
        param1: Popis parametru
        param2: Popis parametru
        
    Returns:
        Popis navratove hodnoty
        
    Raises:
        ValueError: Kdyz je param1 zaporny
    """
```
