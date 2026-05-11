# Asymptotické paměťové a časové složitosti

## Co je asymptotická složitost?

Popisuje **jak roste čas nebo paměť** algoritmu s velikostí vstupu `n`.
Nezáleží na konkrétním hardware ani implementaci — jde o **třídu růstu**.

Příklad: Pokud pro n=10 trvá algoritmus 1ms a pro n=100 trvá 100ms → složitost O(n²).

---

## Asymptotická notace

| Notace | Název | Popis |
|--------|-------|-------|
| **O(f(n))** | Big-O — horní odhad | Nejhorší případ. „Nebude pomalejší než..." |
| **Ω(f(n))** | Omega — dolní odhad | Nejlepší případ. „Nebude rychlejší než..." |
| **Θ(f(n))** | Theta — přesný odhad | Přesná složitost. „Roste stejně rychle jako..." |

> Nejčastěji se používá **O-notace** (Big-O) — zajímá nás nejhorší scénář.

---

## Třídy složitostí (od nejlepší po nejhorší)

| Složitost | Název | n=10 | n=100 | n=1000 |
|-----------|-------|------|-------|--------|
| O(1) | Konstantní | 1 | 1 | 1 |
| O(log n) | Logaritmická | 3 | 7 | 10 |
| O(n) | Lineární | 10 | 100 | 1 000 |
| O(n log n) | Linearitmická | 33 | 664 | 10 000 |
| O(n²) | Kvadratická | 100 | 10 000 | 1 000 000 |
| O(2ⁿ) | Exponenciální | 1024 | 10³⁰ | ∞ (nepraktické) |
| O(n!) | Faktoriální | 3628800 | ∞ | ∞ |

---

## Detailní příklady algoritmů

### O(1) — Konstantní
Čas **nezávisí** na velikosti vstupu.

```python
def get_first(arr):
    return arr[0]        # vždy 1 operace

def is_even(n):
    return n % 2 == 0    # vždy 1 operace
```
- Přístup k poli indexem: `arr[5]`
- Vložení/odebrání na konec hashovací tabulky
- Push/Pop zásobníku

---

### O(log n) — Logaritmická
S každým krokem se vstup **zmenší na polovinu**.

**Binární vyhledávání:**
```python
def binarni_hledani(arr, cil):
    levo, pravo = 0, len(arr) - 1
    while levo <= pravo:
        stred = (levo + pravo) // 2
        if arr[stred] == cil:
            return stred
        elif arr[stred] < cil:
            levo = stred + 1    # zahodíme levou půlku
        else:
            pravo = stred - 1   # zahodíme pravou půlku
    return -1
```
**Proč log n?** Pro n=1000: 1000 → 500 → 250 → 125 → ... → 1 (cca 10 kroků = log₂(1000))

- Binární vyhledávání v seřazeném poli
- Prohledávání BST (vyvážený)
- Mocnění rychlým algoritmem (fast power)

---

### O(n) — Lineární
Algoritmus **projde každý prvek jednou**.

**Lineární vyhledávání:**
```python
def hledani(arr, cil):
    for prvek in arr:       # n iterací
        if prvek == cil:
            return True
    return False
```

**Součet pole:**
```python
def soucet(arr):
    total = 0
    for x in arr:           # n iterací, každá O(1)
        total += x
    return total
```
- Procházení pole/seznamu
- Nalezení maxima/minima
- Kopírování pole

---

### O(n log n) — Linearitmická
Typická pro **efektivní řadící algoritmy** — rozděluj a panuj.

**Merge Sort** (sloučení seřazených polovin):
```
mergeSort([5,3,8,1,4]):
  ├── mergeSort([5,3,8])
  │     ├── mergeSort([5])    → [5]
  │     └── mergeSort([3,8])
  │           ├── mergeSort([3]) → [3]
  │           └── mergeSort([8]) → [8]
  │           merge([3],[8])   → [3,8]
  │     merge([5],[3,8])       → [3,5,8]
  └── mergeSort([1,4])         → [1,4]
  merge([3,5,8],[1,4])         → [1,3,4,5,8]
```
**Proč n log n?** log n úrovní rekurze × n práce na každé úrovni (merge).

| Algoritmus | Nejlepší | Průměr | Nejhorší |
|-----------|----------|--------|----------|
| Merge Sort | O(n log n) | O(n log n) | O(n log n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) — špatný pivot |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) |

---

### O(n²) — Kvadratická
Typické pro **dva vnořené cykly**.

**Bubble Sort:**
```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):           # vnější: n
        for j in range(n-i-1):  # vnitřní: n-1, n-2, ...
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
```
**Proč n²?** Celkem operací: (n-1) + (n-2) + ... + 1 = n(n-1)/2 ≈ n²

**Selection Sort, Insertion Sort** — stejná složitost O(n²).

**Nalezení duplikátů (naivně):**
```python
def ma_duplikat(arr):
    for i in range(len(arr)):          # n
        for j in range(i+1, len(arr)): # n
            if arr[i] == arr[j]:
                return True
    return False
# Lepší verze: O(n) pomocí množiny
def ma_duplikat_rychle(arr):
    return len(arr) != len(set(arr))
```

---

### O(2ⁿ) — Exponenciální
Každý krok **zdvojí** počet podproblémů.

**Fibonacci (rekurzivní, bez memoizace):**
```python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)  # 2 volání pro každé n
```
```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2) ...
│   │   └── fib(1)
│   └── fib(2) ...    ← DUPLICITNÍ výpočet!
└── fib(3) ...        ← DUPLICITNÍ výpočet!
```
**Oprava — memoizace → O(n):**
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)  # každé n jen jednou
```

**Brute force podmnožiny:** Pro n prvků existuje 2ⁿ podmnožin.

---

### O(n!) — Faktoriální
**Permutace** všech prvků.

**Cestující obchodník (brute force):**
- 5 měst → 5! = 120 tras
- 10 měst → 10! = 3 628 800 tras
- 20 měst → 20! ≈ 2,4 × 10¹⁸ tras (nepraktické)

---

## Pravidla pro určení složitosti z kódu

1. **Konstanty se ignorují:** O(3n + 7) = O(n)
2. **Dominantní člen vyhrává:** O(n² + n + 1) = O(n²)
3. **Vnořené cykly → násobení:**
   ```
   for i in range(n):         # n
       for j in range(n):     # n
           ...                # → O(n²)
   ```
4. **Sekvenční bloky → sčítání (pak dominantní):**
   ```
   for i in range(n): ...     # O(n)
   for i in range(n):         # O(n²)
       for j in range(n): ...
   # Celkem: O(n) + O(n²) = O(n²)
   ```
5. **Větvení → maximum:**
   ```
   if podminka:
       # O(n)
   else:
       # O(n²)
   # → O(n²)
   ```
6. **Rekurze — Master theorem:**
   - T(n) = 2·T(n/2) + O(n) → O(n log n) (Merge Sort)
   - T(n) = T(n/2) + O(1) → O(log n) (binární vyhledávání)
   - T(n) = 2·T(n-1) + O(1) → O(2ⁿ) (naivní Fibonacci)

---

## Paměťová složitost

Kolik **extra paměti** algoritmus potřebuje (kromě vstupu).

| Algoritmus | Časová | Paměťová | Proč |
|-----------|--------|----------|------|
| Bubble Sort | O(n²) | O(1) | In-place, jen temp proměnná |
| Merge Sort | O(n log n) | O(n) | Potřebuje pomocné pole stejné délky |
| Quick Sort | O(n log n) | O(log n) | Zásobník rekurze (hloubka stromu) |
| Rekurzivní Fibonacci | O(2ⁿ) | O(n) | Hloubka zásobníku volání |
| Memoizovaný Fibonacci | O(n) | O(n) | Cache výsledků |
| BFS | O(V+E) | O(V) | Fronta může obsahovat všechny vrcholy |
| DFS | O(V+E) | O(V) | Zásobník/rekurze do hloubky grafu |
| Hash tabulka | O(1) průměr | O(n) | Ukládá všechny prvky |

---

## Amortizovaná složitost

Průměrná složitost **jedné operace** přes sérii operací — i když občas je operace drahá.

**Příklad: dynamické pole (ArrayList/List)**
- Při přidání prvku: obvykle O(1)
- Ale když je pole plné → zdvojení kapacity = zkopírování všech prvků = O(n)
- **Amortizovaně:** 1+1+1+1+...+n operací na n vložení = O(1) průměr

```
vložení 1:  O(1)   kapacita: 1→2
vložení 2:  O(2)   zdvojení, kopírování
vložení 3:  O(1)
vložení 4:  O(4)   zdvojení, kopírování
...
Průměr: O(1) amortizovaně
```

---

## Space-Time Tradeoff

Lze **vyměnit paměť za čas** a naopak.

| Technika | Čas (bez) | Čas (s) | Paměť (s) |
|----------|-----------|---------|-----------|
| Memoizace (Fibonacci) | O(2ⁿ) | O(n) | O(n) |
| Hash tabulka (hledání) | O(n) | O(1) | O(n) |
| Předpočítané prefixy | O(n) na dotaz | O(1) na dotaz | O(n) |
| Komprimovaný text | O(1) čtení | O(k) dekomprese | menší |

---

## Porovnání řadících algoritmů

| Algoritmus | Nejlepší | Průměr | Nejhorší | Paměť | Stabilní? |
|-----------|----------|--------|----------|-------|-----------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) | ✅ |

> **Stabilní** = prvky se stejnou hodnotou zachovají původní pořadí.
