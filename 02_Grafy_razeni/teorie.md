# Algoritmizace — Grafy, Prohledávání stavového prostoru, Řazení

## Grafy

### Definice
Graf G = (V, E) kde V je množina vrcholů a E množina hran.

### Typy grafů:
- **Orientovaný** — hrany mají směr (A → B ≠ B → A)
- **Neorientovaný** — hrany bez směru
- **Ohodnocený** — hrany mají váhu (vzdálenost, cena)
- **Acyklický** — neobsahuje cykly (DAG = Directed Acyclic Graph)

### Reprezentace:
```
Matice sousednosti:       Seznam sousednosti:
    A  B  C               A: [B, C]
A [ 0, 1, 1 ]            B: [C]
B [ 0, 0, 1 ]            C: []
C [ 0, 0, 0 ]
```

| Reprezentace | Paměť | Zjistit hranu | Sousedi |
|-------------|-------|--------------|---------|
| Matice | O(V²) | O(1) | O(V) |
| Seznam | O(V+E) | O(stupeň) | O(stupeň) |

## Prohledávání grafů

### BFS (Breadth-First Search) — do šířky
- Používá **frontu** (FIFO)
- Najde **nejkratší cestu** (v neohodnoceném grafu)
- Časová složitost: O(V + E)

### DFS (Depth-First Search) — do hloubky
- Používá **zásobník** (nebo rekurzi)
- Vhodné pro detekci cyklů, topologické řazení
- Časová složitost: O(V + E)

### Dijkstrův algoritmus
- Najde nejkratší cestu v **ohodnoceném** grafu (nezáporné váhy)
- Používá prioritní frontu
- Složitost: O((V + E) log V)

## Prohledávání stavového prostoru
- Stav = konfigurace problému (např. pozice v bludišti)
- Stavový prostor = graf všech možných stavů
- BFS/DFS lze použít k prohledávání stavového prostoru
- Příklad: řešení hlavolamů, hledání cesty, šachy

## Řadicí algoritmy

| Algoritmus | Průměr | Nejhorší | Stabilní | In-place |
|-----------|--------|----------|----------|----------|
| Bubble Sort | O(n²) | O(n²) | ✓ | ✓ |
| Selection Sort | O(n²) | O(n²) | ✗ | ✓ |
| Insertion Sort | O(n²) | O(n²) | ✓ | ✓ |
| Merge Sort | O(n log n) | O(n log n) | ✓ | ✗ |
| Quick Sort | O(n log n) | O(n²) | ✗ | ✓ |
| Heap Sort | O(n log n) | O(n log n) | ✗ | ✓ |

### Stabilní řazení
Zachovává relativní pořadí prvků se stejným klíčem.

### In-place řazení
Nepotřebuje dodatečnou paměť (O(1) extra).
