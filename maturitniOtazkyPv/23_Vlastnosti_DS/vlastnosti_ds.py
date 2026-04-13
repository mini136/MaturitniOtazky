"""
Vlastnosti datovych struktur - indexovani, hashovani, razeni, benchmarking
"""
import time
import random
import sys

random.seed(42)

# ============================================================
#  INDEXOVANI - srovnani pristupu
# ============================================================
print("=== Indexovani - srovnani ===")

# Array - O(1) pristup
pole = list(range(100000))

start = time.perf_counter()
for _ in range(10000):
    _ = pole[50000]  # primy pristup
cas_pole = time.perf_counter() - start

# Linked List - O(n) pristup
class Uzel:
    __slots__ = ['data', 'next']
    def __init__(self, data):
        self.data = data
        self.next = None

# Vytvoreni linked listu
hlava = Uzel(0)
aktualni = hlava
for i in range(1, 1000):  # mensi pro demonstraci
    aktualni.next = Uzel(i)
    aktualni = aktualni.next

start = time.perf_counter()
for _ in range(100):
    node = hlava
    for _ in range(500):  # pristup na pozici 500
        node = node.next
cas_ll = time.perf_counter() - start

print(f"  Pole [50000] x10000: {cas_pole*1000:.2f} ms (O(1))")
print(f"  LinkedList[500] x100: {cas_ll*1000:.2f} ms (O(n))")


# ============================================================
#  HASHOVANI
# ============================================================
print("\n=== Hashovani ===")

# Jednoduche hash funkce
def hash_jednoducha(klic, velikost):
    """Hash pomoci souctu ASCII hodnot"""
    return sum(ord(c) for c in str(klic)) % velikost

def hash_lepsi(klic, velikost):
    """Hash s polynomialnim rozptylem (jako Java String.hashCode)"""
    h = 0
    for c in str(klic):
        h = (h * 31 + ord(c)) % velikost
    return h

# Demonstrace kolizi
print("  Distribuce hash funkci (velikost=10):")
slova = ["alice", "bob", "charlie", "diana", "eva", "filip",
         "gita", "hana", "ivan", "jana", "karel", "lucie"]

print("\n  Jednoducha hash (sum mod):")
buckets_jednoducha = [0] * 10
for slovo in slova:
    h = hash_jednoducha(slovo, 10)
    buckets_jednoducha[h] += 1
    print(f"    '{slovo:10s}' -> bucket {h}")
print(f"    Distribuce: {buckets_jednoducha}")
kolize1 = sum(1 for b in buckets_jednoducha if b > 1)

print("\n  Lepsi hash (polynomial):")
buckets_lepsi = [0] * 10
for slovo in slova:
    h = hash_lepsi(slovo, 10)
    buckets_lepsi[h] += 1
    print(f"    '{slovo:10s}' -> bucket {h}")
print(f"    Distribuce: {buckets_lepsi}")
kolize2 = sum(1 for b in buckets_lepsi if b > 1)
print(f"    Buckety s kolizemi: jednoducha={kolize1}, lepsi={kolize2}")


# ============================================================
#  HASH TABULKA - Open Addressing vs Chaining
# ============================================================
print("\n=== Hash tabulka - Chaining vs Open Addressing ===")

class HashChaining:
    """Hash tabulka s retezenim"""
    def __init__(self, velikost=7):
        self.velikost = velikost
        self.tabulka = [[] for _ in range(velikost)]
        self.pocet = 0

    def _hash(self, klic):
        h = 0
        for c in str(klic):
            h = (h * 31 + ord(c)) % self.velikost
        return h

    def vloz(self, klic, hodnota):
        idx = self._hash(klic)
        for i, (k, v) in enumerate(self.tabulka[idx]):
            if k == klic:
                self.tabulka[idx][i] = (klic, hodnota)
                return
        self.tabulka[idx].append((klic, hodnota))
        self.pocet += 1

    def load_factor(self):
        return self.pocet / self.velikost


class HashOpenAddressing:
    """Hash tabulka s linearnim probingem"""
    def __init__(self, velikost=7):
        self.velikost = velikost
        self.klice = [None] * velikost
        self.hodnoty = [None] * velikost
        self.pocet = 0

    def _hash(self, klic):
        h = 0
        for c in str(klic):
            h = (h * 31 + ord(c)) % self.velikost
        return h

    def vloz(self, klic, hodnota):
        idx = self._hash(klic)
        pokusy = 0
        while self.klice[idx] is not None and self.klice[idx] != klic:
            idx = (idx + 1) % self.velikost  # linearni probing
            pokusy += 1
            if pokusy >= self.velikost:
                raise OverflowError("Tabulka je plna")
        if self.klice[idx] is None:
            self.pocet += 1
        self.klice[idx] = klic
        self.hodnoty[idx] = hodnota
        return pokusy

    def load_factor(self):
        return self.pocet / self.velikost

# Demonstrace
hc = HashChaining(7)
ho = HashOpenAddressing(7)

print("  Vkladani prvku:")
for klic in ["Alice", "Bob", "Charlie", "Diana", "Eva"]:
    hc.vloz(klic, 1)
    pokusy = ho.vloz(klic, 1)
    print(f"    '{klic}': open addressing pokusu={pokusy}")

print(f"\n  Load factor: {hc.load_factor():.2f}")
print(f"  (doporuceno < 0.75, jinak rehashing)")


# ============================================================
#  RAZENI - srovnani stabilnich a nestabilnich
# ============================================================
print("\n=== Stabilni vs nestabilni razeni ===")

# Stabilni razeni zachovava poradi prvku se stejnym klicem
studenti = [
    ("Alice", 2), ("Bob", 1), ("Charlie", 2),
    ("Diana", 1), ("Eva", 3), ("Filip", 2)
]

print("  Puvodni:", [(s[0], s[1]) for s in studenti])

# Python sorted je stabilni (Timsort)
serazeni = sorted(studenti, key=lambda s: s[1])
print("  Stabilni (sorted):", [(s[0], s[1]) for s in serazeni])
print("  -> Alice pred Charliem pred Filipem (zachovano poradi)")


# ============================================================
#  BINARNI VYHLEDAVANI (setridene pole)
# ============================================================
print("\n=== Binarni vyhledavani ===")

def binarni_hledani(pole, hledana):
    """O(log n) hledani v setridenem poli"""
    leva, prava = 0, len(pole) - 1
    kroky = 0
    while leva <= prava:
        kroky += 1
        stred = (leva + prava) // 2
        if pole[stred] == hledana:
            return stred, kroky
        elif pole[stred] < hledana:
            leva = stred + 1
        else:
            prava = stred - 1
    return -1, kroky

def linearni_hledani(pole, hledana):
    """O(n) hledani"""
    for i, prvek in enumerate(pole):
        if prvek == hledana:
            return i, i + 1
    return -1, len(pole)

data = sorted(random.sample(range(100000), 10000))
hledana = data[7777]

pos_bin, kroky_bin = binarni_hledani(data, hledana)
pos_lin, kroky_lin = linearni_hledani(data, hledana)

print(f"  Hledani v 10000 prvcich:")
print(f"    Linearni: pozice={pos_lin}, kroky={kroky_lin}")
print(f"    Binarni:  pozice={pos_bin}, kroky={kroky_bin}")
print(f"    Teoreticky log2(10000) = {14}  (max kroky binarniho)")


# ============================================================
#  BENCHMARK - dict vs list vs set
# ============================================================
print("\n=== Benchmark: dict vs list vs set ===")

N = 100000
data_list = list(range(N))
data_set = set(range(N))
data_dict = {i: True for i in range(N)}

hledane = [random.randint(0, N-1) for _ in range(1000)]

# List lookup O(n)
start = time.perf_counter()
for h in hledane:
    _ = h in data_list
cas_list = time.perf_counter() - start

# Set lookup O(1)
start = time.perf_counter()
for h in hledane:
    _ = h in data_set
cas_set = time.perf_counter() - start

# Dict lookup O(1)
start = time.perf_counter()
for h in hledane:
    _ = h in data_dict
cas_dict = time.perf_counter() - start

print(f"  1000x 'in' operator (N={N}):")
print(f"    list: {cas_list*1000:.2f} ms  (O(n))")
print(f"    set:  {cas_set*1000:.2f} ms  (O(1))")
print(f"    dict: {cas_dict*1000:.2f} ms  (O(1))")
print(f"    set je {cas_list/cas_set:.0f}x rychlejsi nez list")


# ============================================================
#  PAMET - velikost struktur
# ============================================================
print("\n=== Pametova narocnost ===")

n = 1000
obj_list = list(range(n))
obj_tuple = tuple(range(n))
obj_set = set(range(n))
obj_dict = {i: i for i in range(n)}

print(f"  {n} prvku:")
print(f"    list:  {sys.getsizeof(obj_list):6d} B")
print(f"    tuple: {sys.getsizeof(obj_tuple):6d} B")
print(f"    set:   {sys.getsizeof(obj_set):6d} B")
print(f"    dict:  {sys.getsizeof(obj_dict):6d} B")
print(f"  (set a dict maji overhead kvuli hash tabulce)")
