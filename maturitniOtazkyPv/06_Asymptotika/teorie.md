# Asymptotické paměťové a časové složitosti

## Asymptotická notace

Popisuje **růst** časové/paměťové náročnosti algoritmu s velikostí vstupu n.

### O-notace (Big-O) — horní odhad
Nejhorší možný případ. „Algoritmus nebude pomalejší než..."

### Ω-notace (Omega) — dolní odhad
Nejlepší možný případ. „Algoritmus nebude rychlejší než..."

### Θ-notace (Theta) — přesný odhad
Přesná složitost. „Algoritmus roste přesně jako..."

## Časové složitosti (od nejlepší po nejhorší)

| Složitost | Název | Příklad |
|-----------|-------|---------|
| O(1) | Konstantní | Přístup k poli indexem |
| O(log n) | Logaritmická | Binární vyhledávání |
| O(n) | Lineární | Průchod polem |
| O(n log n) | Linearitmická | Merge sort, Quick sort |
| O(n²) | Kvadratická | Bubble sort, dva vnořené cykly |
| O(n³) | Kubická | Násobení matic (naivní) |
| O(2^n) | Exponenciální | Brute force podmnožiny |
| O(n!) | Faktoriální | Permutace, TSP brute force |

```
Růst pro n = 1000:
O(1)       → 1
O(log n)   → ~10
O(n)       → 1 000
O(n log n) → ~10 000
O(n²)      → 1 000 000
O(2^n)     → astronomické číslo
```

## Paměťová složitost

Kolik **extra paměti** algoritmus potřebuje (kromě vstupu).

| Algoritmus | Časová | Paměťová |
|-----------|--------|----------|
| Bubble Sort | O(n²) | O(1) — in-place |
| Merge Sort | O(n log n) | O(n) — potřebuje pomocné pole |
| Quick Sort | O(n log n) | O(log n) — rekurze |
| BFS | O(V+E) | O(V) — fronta |
| DFS | O(V+E) | O(V) — zásobník |
| Hash table | O(1) průměr | O(n) |

## Pravidla pro určení složitosti

1. **Konstanty se ignorují:** O(3n) = O(n)
2. **Dominantní člen:** O(n² + n) = O(n²)
3. **Vnořené cykly se násobí:** dva vnořené po n → O(n²)
4. **Sekvenční bloky se sčítají:** O(n) + O(n²) = O(n²)
5. **Větvení bere maximum:** if O(n) else O(n²) → O(n²)
6. **Logaritmický základ je irelevantní:** O(log₂ n) = O(log₁₀ n) = O(log n)

## Amortizovaná složitost

Průměrná složitost operace přes sérii operací.
- ArrayList/List append: O(1) amortizovaně (občas O(n) při rozšíření)
- Union-Find s kompresí: O(α(n)) ≈ O(1)

## Space-Time Tradeoff

Můžeme vyměnit paměť za čas a naopak:
- **Memoizace:** Fibonacci z O(2^n) na O(n) za cenu O(n) paměti
- **Hash tabulka:** O(1) vyhledávání za cenu O(n) paměti
- **Precomputation:** Předpočítat výsledky, uložit do tabulky
