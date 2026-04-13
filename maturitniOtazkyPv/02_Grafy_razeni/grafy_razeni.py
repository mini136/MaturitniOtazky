"""
Grafy - reprezentace, BFS, DFS, Dijkstra
Razeni - Bubble, Merge, Quick sort
"""
from collections import deque
import heapq

# ============================================================
#  GRAFY
# ============================================================

# Graf jako seznam sousednosti
graf = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}

#       A
#      / \
#     B   C
#    / \   \
#   D   E - F

# === BFS - prohledavani do sirky ===
def bfs(graf, start):
    navstivene = set()
    fronta = deque([start])
    poradi = []

    while fronta:
        vrchol = fronta.popleft()
        if vrchol not in navstivene:
            navstivene.add(vrchol)
            poradi.append(vrchol)
            for soused in graf[vrchol]:
                if soused not in navstivene:
                    fronta.append(soused)
    return poradi

print("=== BFS ===")
print(f"BFS z A: {bfs(graf, 'A')}")


# === DFS - prohledavani do hloubky ===
def dfs(graf, start):
    navstivene = set()
    zasobnik = [start]
    poradi = []

    while zasobnik:
        vrchol = zasobnik.pop()
        if vrchol not in navstivene:
            navstivene.add(vrchol)
            poradi.append(vrchol)
            for soused in reversed(graf[vrchol]):
                if soused not in navstivene:
                    zasobnik.append(soused)
    return poradi

print("\n=== DFS ===")
print(f"DFS z A: {dfs(graf, 'A')}")


# === DFS rekurzivni ===
def dfs_rekurze(graf, vrchol, navstivene=None):
    if navstivene is None:
        navstivene = set()
    navstivene.add(vrchol)
    print(vrchol, end=" ")
    for soused in graf[vrchol]:
        if soused not in navstivene:
            dfs_rekurze(graf, soused, navstivene)

print("\n\n=== DFS rekurzivni ===")
print("DFS z A: ", end="")
dfs_rekurze(graf, 'A')
print()


# === BFS - nejkratsi cesta ===
def bfs_cesta(graf, start, cil):
    fronta = deque([(start, [start])])
    navstivene = {start}

    while fronta:
        vrchol, cesta = fronta.popleft()
        if vrchol == cil:
            return cesta
        for soused in graf[vrchol]:
            if soused not in navstivene:
                navstivene.add(soused)
                fronta.append((soused, cesta + [soused]))
    return None

print(f"\nNejkratsi cesta A->F: {bfs_cesta(graf, 'A', 'F')}")


# === Dijkstra - ohodnoceny graf ===
ohodnoceny_graf = {
    'A': [('B', 4), ('C', 1)],
    'B': [('D', 1)],
    'C': [('B', 2), ('D', 5)],
    'D': []
}

def dijkstra(graf, start):
    vzdalenosti = {v: float('inf') for v in graf}
    vzdalenosti[start] = 0
    pq = [(0, start)]

    while pq:
        dist, vrchol = heapq.heappop(pq)
        if dist > vzdalenosti[vrchol]:
            continue
        for soused, vaha in graf[vrchol]:
            nova_dist = dist + vaha
            if nova_dist < vzdalenosti[soused]:
                vzdalenosti[soused] = nova_dist
                heapq.heappush(pq, (nova_dist, soused))

    return vzdalenosti

print("\n=== Dijkstra ===")
print(f"Vzdalenosti z A: {dijkstra(ohodnoceny_graf, 'A')}")


# ============================================================
#  RAZENI
# ============================================================

# === Bubble Sort ===
def bubble_sort(pole):
    n = len(pole)
    for i in range(n):
        for j in range(0, n - i - 1):
            if pole[j] > pole[j + 1]:
                pole[j], pole[j + 1] = pole[j + 1], pole[j]
    return pole

# === Merge Sort ===
def merge_sort(pole):
    if len(pole) <= 1:
        return pole
    stred = len(pole) // 2
    leva = merge_sort(pole[:stred])
    prava = merge_sort(pole[stred:])

    vysledek = []
    i = j = 0
    while i < len(leva) and j < len(prava):
        if leva[i] <= prava[j]:
            vysledek.append(leva[i])
            i += 1
        else:
            vysledek.append(prava[j])
            j += 1
    vysledek.extend(leva[i:])
    vysledek.extend(prava[j:])
    return vysledek

# === Quick Sort ===
def quick_sort(pole):
    if len(pole) <= 1:
        return pole
    pivot = pole[len(pole) // 2]
    mensi = [x for x in pole if x < pivot]
    stejne = [x for x in pole if x == pivot]
    vetsi = [x for x in pole if x > pivot]
    return quick_sort(mensi) + stejne + quick_sort(vetsi)


print("\n=== Razeni ===")
data = [64, 34, 25, 12, 22, 11, 90]
print(f"Puvodni:     {data}")
print(f"Bubble Sort: {bubble_sort(data.copy())}")
print(f"Merge Sort:  {merge_sort(data.copy())}")
print(f"Quick Sort:  {quick_sort(data.copy())}")


# === Stavovy prostor - bludiste ===
print("\n=== Stavovy prostor - Bludiste (BFS) ===")
bludiste = [
    [0, 0, 1, 0],
    [1, 0, 1, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0]
]

def resi_bludiste(bludiste, start, cil):
    """BFS pro hledani cesty v bludisti (0=volno, 1=zed)"""
    rows, cols = len(bludiste), len(bludiste[0])
    fronta = deque([(start, [start])])
    navstivene = {start}

    while fronta:
        (r, c), cesta = fronta.popleft()
        if (r, c) == cil:
            return cesta
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and bludiste[nr][nc] == 0 and (nr, nc) not in navstivene:
                navstivene.add((nr, nc))
                fronta.append(((nr, nc), cesta + [(nr, nc)]))
    return None

cesta = resi_bludiste(bludiste, (0, 0), (3, 3))
print(f"Cesta bludistem: {cesta}")
