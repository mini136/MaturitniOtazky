"""
Srovnani programovacich jazyku - PYTHON verze
Ukazka dynamickeho typovani, interpretace, duck typing
"""

# ============================================================
#  DYNAMICKE TYPOVANI
# ============================================================
print("=== Dynamicke typovani (Python) ===")

# Promenna muze menit typ za behu
x = 42
print(f"x = {x}, typ: {type(x).__name__}")

x = "ahoj"
print(f"x = {x}, typ: {type(x).__name__}")

x = [1, 2, 3]
print(f"x = {x}, typ: {type(x).__name__}")

# Type hints (od Python 3.5) - POUZE napoveda, ne vynuceni
def secti(a: int, b: int) -> int:
    return a + b

print(f"secti(3, 5) = {secti(3, 5)}")
print(f"secti('a', 'b') = {secti('a', 'b')}")  # funguje! Python nevynucuje

# ============================================================
#  DUCK TYPING
# ============================================================
print("\n=== Duck Typing ===")
# "If it walks like a duck and quacks like a duck, it IS a duck"

class Pes:
    def zvuk(self): return "Haf!"

class Kocka:
    def zvuk(self): return "Mnau!"

class Robot:
    def zvuk(self): return "Beep!"

# Neni zadny interface - staci mit metodu zvuk()
def udelej_zvuk(objekt):
    print(f"  {type(objekt).__name__}: {objekt.zvuk()}")

for o in [Pes(), Kocka(), Robot()]:
    udelej_zvuk(o)

# ============================================================
#  PYTHON SPECIFICKE VLASTNOSTI
# ============================================================
print("\n=== Python specificke vlastnosti ===")

# List comprehension
ctverec = [x**2 for x in range(10)]
print(f"List comprehension: {ctverec}")

# Generator (lazy evaluation)
def fibonacci_gen():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci_gen()
fib = [next(gen) for _ in range(10)]
print(f"Generator fibonacci: {fib}")

# Decorator
def pocitadlo(func):
    def wrapper(*args, **kwargs):
        wrapper.volani += 1
        return func(*args, **kwargs)
    wrapper.volani = 0
    return wrapper

@pocitadlo
def pozdrav(jmeno):
    return f"Ahoj {jmeno}!"

pozdrav("Alice")
pozdrav("Bob")
print(f"Pocet volani pozdrav: {pozdrav.volani}")

# Multiple return values (tuple unpacking)
def min_max(data):
    return min(data), max(data)

mi, ma = min_max([3, 1, 4, 1, 5, 9])
print(f"min={mi}, max={ma}")

# Context manager
print("\n=== With statement ===")
class Timer:
    import time
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self
    def __exit__(self, *args):
        import time
        elapsed = time.perf_counter() - self.start
        print(f"  Cas: {elapsed*1000:.2f} ms")

with Timer():
    total = sum(range(1_000_000))
    print(f"  Soucet 0..999999 = {total}")

# ============================================================
#  KOMPILACE vs INTERPRETACE - bytecode
# ============================================================
print("\n=== Python bytecode ===")
import dis

def jednoducha_funkce(a, b):
    return a + b * 2

print("Disassembled bytecode:")
dis.dis(jednoducha_funkce)
