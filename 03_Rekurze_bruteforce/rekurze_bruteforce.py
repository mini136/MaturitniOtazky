"""
Rekurze, Brute Force, Heuristiky, Nedeterministicke algoritmy
"""
import random
import itertools
import math

# ============================================================
#  REKURZE
# ============================================================

# === Faktorial ===
def faktorial(n):
    if n <= 1:
        return 1
    return n * faktorial(n - 1)

print("=== Rekurze ===")
print(f"5! = {faktorial(5)}")

# === Fibonacci (stromova rekurze) ===
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10) = {fibonacci(10)}")

# === Fibonacci s memoizaci (dynamicke programovani) ===
def fibonacci_memo(n, cache={}):
    if n in cache:
        return cache[n]
    if n <= 1:
        return n
    cache[n] = fibonacci_memo(n - 1) + fibonacci_memo(n - 2)
    return cache[n]

print(f"Fibonacci(30) s memo = {fibonacci_memo(30)}")

# === Hanojske veze ===
def hanoj(n, z, na, pres):
    if n == 1:
        print(f"  Presun disk 1 z {z} na {na}")
        return
    hanoj(n - 1, z, pres, na)
    print(f"  Presun disk {n} z {z} na {na}")
    hanoj(n - 1, pres, na, z)

print("\nHanojske veze (3 disky):")
hanoj(3, 'A', 'C', 'B')


# ============================================================
#  BRUTE FORCE
# ============================================================
print("\n=== Brute Force ===")

# === Problem batohu (Knapsack) - brute force ===
def batoh_bruteforce(predmety, kapacita):
    """
    predmety = [(vaha, hodnota), ...]
    Zkusi vsechny podmnoziny a vybere nejlepsi.
    """
    nejlepsi_hodnota = 0
    nejlepsi_vyber = []

    n = len(predmety)
    for i in range(2**n):  # vsechny podmnoziny
        vyber = []
        celkova_vaha = 0
        celkova_hodnota = 0
        for j in range(n):
            if i & (1 << j):  # bit j je nastaven
                vaha, hodnota = predmety[j]
                celkova_vaha += vaha
                celkova_hodnota += hodnota
                vyber.append(j)
        if celkova_vaha <= kapacita and celkova_hodnota > nejlepsi_hodnota:
            nejlepsi_hodnota = celkova_hodnota
            nejlepsi_vyber = vyber

    return nejlepsi_hodnota, nejlepsi_vyber

predmety = [(2, 3), (3, 4), (4, 5), (5, 8), (1, 1)]  # (vaha, hodnota)
kapacita = 7
hodnota, vyber = batoh_bruteforce(predmety, kapacita)
print(f"Batoh (kapacita {kapacita}): hodnota={hodnota}, predmety={vyber}")

# === TSP brute force (male instance) ===
def tsp_bruteforce(mesta, vzdalenosti):
    """Zkusi vsechny permutace a najde nejkratsi okruh."""
    nejlepsi = float('inf')
    nejlepsi_cesta = None

    for perm in itertools.permutations(mesta[1:]):
        cesta = [mesta[0]] + list(perm) + [mesta[0]]
        delka = sum(vzdalenosti[cesta[i]][cesta[i+1]] for i in range(len(cesta)-1))
        if delka < nejlepsi:
            nejlepsi = delka
            nejlepsi_cesta = cesta

    return nejlepsi, nejlepsi_cesta

mesta = ['A', 'B', 'C', 'D']
vzdalenosti = {
    'A': {'B': 10, 'C': 15, 'D': 20},
    'B': {'A': 10, 'C': 35, 'D': 25},
    'C': {'A': 15, 'C': 0, 'B': 35, 'D': 30},
    'D': {'A': 20, 'B': 25, 'C': 30}
}
delka, cesta = tsp_bruteforce(mesta, vzdalenosti)
print(f"TSP: delka={delka}, cesta={cesta}")


# ============================================================
#  HEURISTIKY
# ============================================================
print("\n=== Heuristiky ===")

# === Greedy - problem minci ===
def greedy_mince(mince, castka):
    mince_sorted = sorted(mince, reverse=True)
    vysledek = []
    for m in mince_sorted:
        while castka >= m:
            vysledek.append(m)
            castka -= m
    return vysledek

print(f"Greedy mince [1,5,10,25] pro 67: {greedy_mince([1, 5, 10, 25], 67)}")
print(f"Greedy mince [1,5,6] pro 10: {greedy_mince([1, 5, 6], 10)} (suboptimalni!)")

# === Hill Climbing ===
def hill_climbing(f, start, krok=0.1, max_iter=1000):
    """Najde lokalni maximum funkce f."""
    x = start
    for _ in range(max_iter):
        levy = f(x - krok)
        pravy = f(x + krok)
        aktualni = f(x)
        if levy > aktualni:
            x -= krok
        elif pravy > aktualni:
            x += krok
        else:
            break  # lokalni maximum
    return x, f(x)

# Hledame maximum funkce -x^2 + 4x + 5
f = lambda x: -(x**2) + 4*x + 5
x, y = hill_climbing(f, start=0)
print(f"Hill Climbing: max f(x)=-x²+4x+5 pri x={x:.1f}, f(x)={y:.1f}")


# ============================================================
#  NEDETERMINISTICKE ALGORITMY
# ============================================================
print("\n=== Nedeterministicke algoritmy ===")

# === Randomized Quick Sort ===
def random_quicksort(pole):
    if len(pole) <= 1:
        return pole
    pivot = random.choice(pole)  # nahodny pivot!
    mensi = [x for x in pole if x < pivot]
    stejne = [x for x in pole if x == pivot]
    vetsi = [x for x in pole if x > pivot]
    return random_quicksort(mensi) + stejne + random_quicksort(vetsi)

data = [3, 6, 8, 10, 1, 2, 1]
print(f"Randomized QSort: {random_quicksort(data)}")

# === Monte Carlo - odhad cisla Pi ===
def monte_carlo_pi(pocet_bodu):
    uvnitr = 0
    for _ in range(pocet_bodu):
        x = random.random()
        y = random.random()
        if x**2 + y**2 <= 1:
            uvnitr += 1
    return 4 * uvnitr / pocet_bodu

odhad = monte_carlo_pi(100000)
print(f"Monte Carlo Pi (100k bodu): {odhad:.4f} (skutecne: {math.pi:.4f})")

# === Jednoduchy geneticky algoritmus ===
def geneticky_algoritmus():
    """Hledame maximum funkce f(x) = -x^2 + 10x na intervalu [0, 10]"""
    f = lambda x: -(x**2) + 10*x

    # Inicializace populace
    populace = [random.uniform(0, 10) for _ in range(20)]

    for generace in range(50):
        # Ohodnoceni (fitness)
        ohodnoceni = [(x, f(x)) for x in populace]
        ohodnoceni.sort(key=lambda p: p[1], reverse=True)

        # Selekce - vybereme lepsi polovinu
        rodice = [x for x, _ in ohodnoceni[:10]]

        # Krizeni a mutace
        nova_populace = rodice[:]
        while len(nova_populace) < 20:
            r1, r2 = random.sample(rodice, 2)
            dite = (r1 + r2) / 2  # krizeni (prumer)
            dite += random.gauss(0, 0.5)  # mutace
            dite = max(0, min(10, dite))  # omezeni na interval
            nova_populace.append(dite)

        populace = nova_populace

    nejlepsi = max(populace, key=f)
    print(f"Geneticky alg: max f(x)=-x²+10x pri x={nejlepsi:.2f}, f(x)={f(nejlepsi):.2f}")
    print(f"  (Optimum je x=5, f(5)=25)")

geneticky_algoritmus()
