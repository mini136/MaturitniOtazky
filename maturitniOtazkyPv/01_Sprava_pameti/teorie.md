# Adresování a správa paměti

## Struktura paměti programu

Program v paměti je rozdělen do několika segmentů:

| Segment | Popis |
|---------|-------|
| **Stack (zásobník)** | Lokální proměnné, parametry funkcí, návratové adresy. LIFO struktura, automatická správa. |
| **Heap (halda)** | Dynamicky alokovaná paměť (`new`, `malloc`). Musí být uvolněna manuálně nebo GC. |
| **Data segment** | Globální a statické proměnné. |
| **Code segment** | Strojový kód programu (instrukce). |

```
+------------------+
|   Stack          |  ← roste dolů
|   (lokální var.) |
+------------------+
|   ↕ volné místo  |
+------------------+
|   Heap           |  ← roste nahoru
|   (new, malloc)  |
+------------------+
|   Data segment   |
|   (static, global)|
+------------------+
|   Code segment   |
|   (instrukce)    |
+------------------+
```

## Reference a ukazatele

### Ukazatel (Pointer) — C/C++
- Proměnná uchovávající **adresu v paměti**
- Umožňuje přímý přístup k paměti (dereference `*ptr`)
- Lze provádět aritmetiku ukazatelů (`ptr++`)
- Nebezpečné — může vzniknout dangling pointer, buffer overflow

### Reference — C#, Java, Python
- Abstrakce nad ukazatelem, **nelze** s ní dělat aritmetiku
- Bezpečnější — runtime kontroluje platnost
- V C# existují value types (struct, int) a reference types (class, string)

```
Value type:  int a = 5;     → přímo na stacku
Ref type:    object o = new MyClass();  → na stacku je reference, objekt na heapu
```

## Garbage Collector (GC)

Automatický systém pro uvolňování nepoužívané paměti na heapu.

### Jak funguje:
1. **Mark & Sweep** — označí dosažitelné objekty, ostatní smaže
2. **Generační GC** (C#/.NET) — objekty rozděleny do generací (Gen0, Gen1, Gen2)
   - Gen0: nové objekty, časté kolekce
   - Gen2: dlouhodobé objekty, méně časté kolekce
3. **Reference counting** (Python) — každý objekt má počítadlo referencí, při 0 se uvolní
   - Problém: cyklické reference → řeší se cyklickým detektorem

### Porovnání jazyků:
| Jazyk | Správa paměti |
|-------|--------------|
| C/C++ | Manuální (malloc/free, new/delete) |
| Java | GC (generační, JVM) |
| C# | GC (generační, .NET CLR) |
| Python | Reference counting + cyklický GC |
| Rust | Ownership systém (bez GC) |

## Úniky paměti (Memory Leaks)
- Vznikají, když alokovaná paměť není uvolněna
- V jazycích s GC: objekt je stále referencovaný, i když není potřeba
- Prevence: slabé reference (WeakReference), dispose pattern (IDisposable v C#)
