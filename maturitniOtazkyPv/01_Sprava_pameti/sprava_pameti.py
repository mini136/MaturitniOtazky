"""
Sprava pameti v Pythonu - reference counting a garbage collector
"""
import sys
import gc

# === Reference counting ===
print("=== Reference Counting ===")
a = [1, 2, 3]
print(f"Pocet referenci na 'a': {sys.getrefcount(a)}")  # +1 kvuli getrefcount

b = a  # nova reference na stejny objekt
print(f"Po 'b = a': {sys.getrefcount(a)}")

del b  # smazeme referenci
print(f"Po 'del b': {sys.getrefcount(a)}")

# === id() - adresa objektu v pameti ===
print("\n=== Adresy objektu (id) ===")
x = 42
y = 42
print(f"id(x) = {id(x)}, id(y) = {id(y)}")
print(f"x is y: {x is y}")  # True — Python cachuje male integery (-5 az 256)

s1 = "hello"
s2 = "hello"
print(f"id(s1) = {id(s1)}, id(s2) = {id(s2)}")
print(f"s1 is s2: {s1 is s2}")  # True — string interning

# === Mutable vs Immutable ===
print("\n=== Mutable vs Immutable ===")

# Immutable (int) - kopie hodnoty
a = 10
b = a
b = 20
print(f"a = {a}, b = {b}")  # a=10, b=20

# Mutable (list) - sdilena reference
a = [1, 2, 3]
b = a       # reference na stejny seznam!
b.append(4)
print(f"a = {a}")  # [1, 2, 3, 4] — zmeneno!
print(f"b = {b}")  # [1, 2, 3, 4]

# Spravna kopie
import copy
a = [1, 2, [3, 4]]
b = copy.deepcopy(a)  # hloubkova kopie
b[2].append(5)
print(f"\nDeep copy: a = {a}, b = {b}")  # a nezmeneno

# === Cyklicke reference a GC ===
print("\n=== Cyklicke reference ===")

class Uzel:
    def __init__(self, jmeno):
        self.jmeno = jmeno
        self.soused = None
    def __del__(self):
        print(f"  Uzel '{self.jmeno}' uvolnen")

# Vytvorime cyklickou referenci
u1 = Uzel("A")
u2 = Uzel("B")
u1.soused = u2
u2.soused = u1  # cyklus!

print(f"Ref count u1: {sys.getrefcount(u1)}")

del u1
del u2
# Reference counting je nestaci — cyklus stale existuje

print("Spoustime gc.collect()...")
collected = gc.collect()
print(f"GC uvolnil {collected} objektu")

# === GC statistiky ===
print(f"\nGC prahy: {gc.get_threshold()}")
print(f"GC pocty: {gc.get_count()}")
