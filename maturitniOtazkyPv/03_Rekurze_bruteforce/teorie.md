# Algoritmizace — Rekurze, Brute Force, Heuristiky, Nedeterministické algoritmy

## Rekurze

Funkce, která **volá sama sebe**. Musí mít:
1. **Bázový případ** (base case) — zastaví rekurzi
2. **Rekurzivní krok** — zmenšuje problém

```
factorial(n):
    if n <= 1: return 1        ← bázový případ
    return n * factorial(n-1)  ← rekurzivní krok
```

### Typy rekurze:
- **Přímá** — funkce volá přímo sebe
- **Nepřímá** — A volá B, B volá A
- **Tail rekurze** — rekurzivní volání je poslední operace (lze optimalizovat na cyklus)
- **Stromová** — funkce se volá vícekrát (např. Fibonacci, merge sort)

### Zásobník volání (Call Stack)
Každé volání funkce vytvoří nový rámec (frame) na zásobníku → příliš hluboká rekurze = **Stack Overflow**.

## Brute Force (Hrubá síla)

- Vyzkouší **všechny možné kombinace**
- Vždy najde řešení (pokud existuje)
- Extrémně pomalé pro velké vstupy
- Složitost často exponenciální O(2^n) nebo faktoriální O(n!)

### Příklady:
- Prohledání všech podmnožin
- Řešení problému obchodního cestujícího zkoušením všech permutací
- Lámání hesla zkoušením všech kombinací

## Heuristiky

- **Přibližné** strategie, které nenajdou nutně optimální řešení
- Ale najdou **dostatečně dobré** řešení v rozumném čase
- Obětujeme přesnost za rychlost

### Typy:
- **Greedy (hladový)** — v každém kroku zvolíme lokálně nejlepší možnost
- **A\* algoritmus** — BFS + heuristická funkce (odhad vzdálenosti k cíli)
- **Hill climbing** — jdeme směrem zlepšení, riziko uvíznutí v lokálním optimu
- **Simulated annealing** — hill climbing + náhodné skoky (snižují se s časem)

### Greedy vs Optimální:
```
Mince: [1, 5, 6], částka: 10
Greedy: 6 + 1 + 1 + 1 + 1 = 5 mincí  ← suboptimální
Optimální: 5 + 5 = 2 mince
```

## Nedeterministické algoritmy

- Obsahují prvek **náhody** — při stejném vstupu mohou dát různé výsledky
- Třída problémů **NP** — řešení lze ověřit v polynomiálním čase, ale najít trvá exponenciálně

### Příklady:
- **Randomizované algoritmy** — Quick Sort s náhodným pivotem, Miller-Rabin test
- **Monte Carlo** — simulace s náhodnými vzorky, výsledek je přibližný
- **Las Vegas** — vždy správný výsledek, ale čas je náhodný (randomized quicksort)
- **Genetické algoritmy** — evoluce populace řešení (selekce, křížení, mutace)

### NP-úplné problémy:
- Problém obchodního cestujícího (TSP)
- SAT (splnitelnost booleovské formule)
- Problém batohu (Knapsack)
- Barvení grafu
