# Programovací jazyky — vlastnosti, srovnání, tvorba a běh programů

## Klasifikace jazyků

### Podle úrovně abstrakce:
- **Strojový kód** — přímé instrukce procesoru (0 a 1)
- **Assembler** — symbolické instrukce (MOV, ADD, JMP)
- **Vyšší jazyky** — C, Java, Python, C# — bližší lidskému myšlení

### Podle paradigmatu:
| Paradigma | Jazyky | Princip |
|-----------|--------|---------|
| Imperativní | C, Pascal | Sekvence příkazů |
| Objektové | Java, C#, Python | Objekty a třídy |
| Funkcionální | Haskell, F#, Lisp | Funkce bez vedlejších efektů |
| Logické | Prolog | Fakta a pravidla |
| Multi-paradigma | Python, C++, Kotlin | Kombinace |

### Podle typového systému:
- **Staticky typované:** Java, C#, C++ — typy se kontrolují při kompilaci
- **Dynamicky typované:** Python, JavaScript, Ruby — typy za běhu
- **Silně typované:** Python, Java — nelze mixovat typy implicitně
- **Slabě typované:** JavaScript, PHP — implicitní konverze

## Způsoby tvorby a běhu programů

### Kompilace
```
Zdrojový kód → [Kompilátor] → Strojový kód → Spuštění
                                (exe, .o)
```
- **Celý** program se přeloží najednou
- Rychlý běh programu
- Specifický pro platformu
- Příklady: C, C++, Rust, Go

### Interpretace
```
Zdrojový kód → [Interpret] → Přímé vykonání (řádek po řádku)
```
- Pomalejší běh
- Přenositelné (interpret na každé platformě)
- Příklady: Python, Ruby, PHP

### Kombinace (JIT)
```
Zdrojový kód → [Kompilátor] → Bytecode → [VM/JIT] → Strojový kód
                                (IL, .class)
```
- Kompilace do mezikódu (bytecode/IL)
- JIT (Just-In-Time) kompilátor překládá za běhu
- Příklady: Java (JVM), C# (.NET CLR), Kotlin

## Srovnání hlavních jazyků

| | Python | Java | C# | C++ |
|-|--------|------|-----|-----|
| Typ | Interpretovaný | JIT (JVM) | JIT (.NET) | Kompilovaný |
| Typování | Dynamické | Statické | Statické | Statické |
| Paměť | GC (ref counting) | GC (generační) | GC (generační) | Manuální |
| Rychlost | Pomalý | Středně rychlý | Středně rychlý | Velmi rychlý |
| Syntaxe | Jednoduchá | Verbose | Moderate | Složitá |
| Platforma | Multiplatformní | JVM (multi) | .NET (multi) | Nativní |
| Použití | ML, scripting, web | Enterprise, Android | Enterprise, hry | Systémy, hry, HPC |

## Kompilační proces (detailně)

```
Zdrojový kód (.c, .cpp)
    ↓
[Preprocesor] → zpracuje #include, #define, makra
    ↓
[Kompilátor] → syntaktická + sémantická analýza → AST → optimalizace
    ↓
Assembler kód → objektový soubor (.o, .obj)
    ↓
[Linker] → propojí s knihovnami → spustitelný soubor (.exe)
```

### Fáze kompilace:
1. **Lexikální analýza** — tokeny (identifikátory, klíčová slova, operátory)
2. **Syntaktická analýza** — AST (Abstract Syntax Tree)
3. **Sémantická analýza** — typová kontrola, rozsah proměnných
4. **Optimalizace** — zrychlení, zmenšení kódu
5. **Generování kódu** — strojový/bytecode

## Běhové prostředí (Runtime)

### JVM (Java Virtual Machine):
- Spouští Java bytecode (.class soubory)
- GC, class loader, JIT compiler
- Write once, run anywhere

### .NET CLR (Common Language Runtime):
- Spouští IL (Intermediate Language)
- Multi-jazykové (C#, F#, VB.NET)
- GC, type safety, exception handling

### CPython:
- Referenční implementace Pythonu
- Kompiluje do bytecode (.pyc), interpretuje
- GIL (Global Interpreter Lock) — omezení pro vlákna
