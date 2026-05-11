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

## Alokace paměti

Alokace paměti = proces **rezervace části paměti** pro data programu za běhu.

### Stack alokace
- Probíhá **automaticky** při vstupu do funkce
- Kompilátor dopředu zná velikost → rychlé, bez režie
- Po návratu z funkce se paměť automaticky uvolní (posunutím stack pointeru)
- Omezená velikost (typicky 1–8 MB) → `StackOverflowException` při přetečení

```csharp
void Foo() {
    int x = 42;        // stack: 4 bajty rezervovány automaticky
    double d = 3.14;   // stack: 8 bajtů
}                      // ← SP se vrátí, paměť "uvolněna"
```

### Heap alokace
- Explicitní žádost programu o blok paměti za běhu
- Umožňuje **dynamickou** velikost a dobu života přesahující funkci
- Pomalejší než stack — OS/runtime musí najít volný blok

#### C/C++ — manuální správa
| Funkce | Popis |
|--------|-------|
| `malloc(n)` | Alokuje n bajtů, neinicializuje, vrací `void*` |
| `calloc(n, size)` | Alokuje n×size bajtů, inicializuje nulami |
| `realloc(ptr, n)` | Změní velikost existujícího bloku |
| `free(ptr)` | Uvolní blok — **musí** být zavoláno ručně |
| `new` / `delete` | C++ operátory (volají konstruktor/destruktor) |

```c
int *arr = (int*)malloc(10 * sizeof(int));
// ... použití ...
free(arr);          // nutné, jinak memory leak
arr = NULL;         // dobrá praxe — zamezí dangling pointer
```

#### C# / Java — správa přes runtime
- `new` alokuje na heapu, uvolnění zajistí **Garbage Collector**
- Programátor se nestará o `free` — ale musí uvolnit **zdroje** (soubory, spojení) přes `Dispose`/`using`

```csharp
var list = new List<int>();   // heap, GC uvolní až nebude dosažitelný
using var fs = new FileStream(...);  // IDisposable — Dispose() zavoláno automaticky
```

### Fragmentace paměti
- **Interní fragmentace** — alokovaný blok je větší, než je potřeba (nevyužité bajty uvnitř)
- **Externí fragmentace** — mezi alokovanými bloky vznikají malé díry, do nichž nový blok nevejde
- Řeší se **memory compaction** (GC přesouvá objekty) nebo **memory pooling** (předalokovaný pool bloků stejné velikosti)

---

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

### Co je GC obecně
Garbage Collector je **součást runtime prostředí**, která automaticky sleduje, které objekty na heapu jsou ještě **dosažitelné** (reachable) z kořenů programu (lokální proměnné, statické proměnné, registry CPU), a ty ostatní — nedosažitelné (unreachable) — uvolní.

Cíl: programátor **nemusí volat `free`** — GC to udělá za něj, čímž eliminuje celé třídy chyb (memory leaks, dangling pointers, double-free).

Nevýhody:
- **Stop-the-world pauzy** — GC může na chvíli zastavit vlákna programu
- Větší spotřeba paměti (objekty zůstávají déle, než jsou striktně potřeba)
- Méně předvídatelný výkon (nelze říct přesně, kdy GC poběží)

### Algoritmy GC

#### Mark & Sweep (základní princip)
1. **Mark** — od kořenů projde graf referencí a označí vše dosažitelné
2. **Sweep** — projde celý heap a uvolní vše neoznačené

```
Kořeny → A → B → C
              ↘ D
         E (nedosažitelný) ← sweep uvolní
```

#### Generační GC (C# .NET, Java JVM)
Vychází z pozorování: **většina objektů umírá mladá** (short-lived).

| Generace | Obsah | Frekvence kolekce |
|----------|-------|-------------------|
| **Gen 0** | Nově alokované objekty | Velmi časté (ms) |
| **Gen 1** | Objekty, které přežily Gen 0 | Méně časté |
| **Gen 2** | Dlouhodobé objekty (statika, cache) | Zřídka |

- Kolekce Gen 0 je rychlá a levná — prochází jen malou část heapu
- Objekty, které přežijí, jsou **promoted** do vyšší generace

#### Reference Counting (Python, Swift, COM)
- Každý objekt drží **počítadlo referencí** (`refcount`)
- Při přiřazení se refcount zvýší, při uvolnění sníží
- Při refcount == 0 → objekt okamžitě uvolněn

```python
a = MyObj()   # refcount = 1
b = a         # refcount = 2
del a         # refcount = 1
del b         # refcount = 0 → uvolněno ihned
```

Problém — **cyklické reference**:
```python
a.next = b
b.prev = a    # a i b mají refcount > 0, ale jsou nedosažitelné
```
→ Python má doplňkový **cyklický GC** (modul `gc`), který cykly detekuje a uvolní.

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
