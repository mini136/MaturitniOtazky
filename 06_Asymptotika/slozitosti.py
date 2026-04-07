"""
Asymptotické složitosti - měření a porovnání
"""
import time

def zmer_cas(f, *args):
    """Zmeri cas vykonavani funkce v milisekundach"""
    start = time.perf_counter()
    vysledek = f(*args)
    konec = time.perf_counter()
    return (konec - start) * 1000, vysledek

# ============================================================
#  UKAZKY RUZNYCH SLOZITOSTI
# ============================================================

# O(1) - konstantni
def pristup_indexem(pole, index):
    return pole[index]

# O(log n) - logaritmicka
def binarni_vyhledavani(pole, hodnota):
    low, high = 0, len(pole) - 1
    while low <= high:
        mid = (low + high) // 2
        if pole[mid] == hodnota:
            return mid
        elif pole[mid] < hodnota:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# O(n) - linearni
def linearni_vyhledavani(pole, hodnota):
    for i, v in enumerate(pole):
        if v == hodnota:
            return i
    return -1

# O(n log n) - linearitmicka
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
            vysledek.append(leva[i]); i += 1
        else:
            vysledek.append(prava[j]); j += 1
    vysledek.extend(leva[i:])
    vysledek.extend(prava[j:])
    return vysledek

# O(n^2) - kvadraticka
def bubble_sort(pole):
    pole = pole.copy()
    n = len(pole)
    for i in range(n):
        for j in range(0, n - i - 1):
            if pole[j] > pole[j + 1]:
                pole[j], pole[j + 1] = pole[j + 1], pole[j]
    return pole

# O(2^n) - exponencialni
def fibonacci_exp(n):
    if n <= 1:
        return n
    return fibonacci_exp(n-1) + fibonacci_exp(n-2)

# O(n) s O(n) pameti - memoizace
def fibonacci_memo(n, cache={}):
    if n in cache: return cache[n]
    if n <= 1: return n
    cache[n] = fibonacci_memo(n-1, cache) + fibonacci_memo(n-2, cache)
    return cache[n]


# ============================================================
#  MERENI A POROVNANI
# ============================================================
import random

print("=== Porovnani casovych slozitosti ===\n")

# Priprava dat
sizes = [1000, 5000, 10000]

for n in sizes:
    pole = sorted(random.sample(range(n * 10), n))  # setridene pole
    hledana = pole[-1]  # nejhorsi pripad pro linearni

    cas_bin, _ = zmer_cas(binarni_vyhledavani, pole, hledana)
    cas_lin, _ = zmer_cas(linearni_vyhledavani, pole, hledana)

    print(f"n = {n:>6}:")
    print(f"  Binarni vyhledavani O(log n): {cas_bin:.4f} ms")
    print(f"  Linearni vyhledavani O(n):    {cas_lin:.4f} ms")

print()

# Razeni
for n in [1000, 3000, 5000]:
    pole = [random.randint(0, 10000) for _ in range(n)]

    cas_merge, _ = zmer_cas(merge_sort, pole)
    cas_bubble, _ = zmer_cas(bubble_sort, pole)

    print(f"Razeni n = {n:>5}:")
    print(f"  Merge Sort  O(n log n): {cas_merge:.2f} ms")
    print(f"  Bubble Sort O(n^2):     {cas_bubble:.2f} ms")
    print(f"  Pomer:                  {cas_bubble/cas_merge:.1f}x pomalejsi")
    print()

# Fibonacci
print("=== Fibonacci - exponencialni vs memoizace ===")
for n in [10, 20, 30]:
    if n <= 30:
        cas_exp, vysl = zmer_cas(fibonacci_exp, n)
        print(f"fib({n}) O(2^n):  {cas_exp:.2f} ms  = {vysl}")
    fibonacci_memo_cache = {}
    cas_mem, vysl = zmer_cas(fibonacci_memo, n)
    print(f"fib({n}) O(n):    {cas_mem:.4f} ms  = {vysl}")
    print()

# ============================================================
#  PAMETOVA SLOZITOST
# ============================================================
import sys

print("=== Pametova slozitost ===")
print(f"int:         {sys.getsizeof(42)} B")
print(f"float:       {sys.getsizeof(3.14)} B")
print(f"str 'hello': {sys.getsizeof('hello')} B")
print(f"list [1..100]:  {sys.getsizeof(list(range(100)))} B")
print(f"list [1..1000]: {sys.getsizeof(list(range(1000)))} B")
print(f"dict 100 polozek: {sys.getsizeof({i: i for i in range(100)})} B")
print(f"set 100 polozek:  {sys.getsizeof(set(range(100)))} B")
