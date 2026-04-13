"""
Vyjimky, aserce a debugovani v Pythonu
"""
import logging
import traceback

# ============================================================
#  ZAKLADNI TRY-EXCEPT
# ============================================================
print("=== Zakladni try-except ===")

# Zachyceni konkretni vyjimky
try:
    vysledek = 10 / 0
except ZeroDivisionError as e:
    print(f"  Chyba: {e}")

# Vice except bloku
try:
    seznam = [1, 2, 3]
    print(seznam[10])
except IndexError:
    print("  IndexError: Index mimo rozsah")
except TypeError:
    print("  TypeError: Spatny typ")

# Else a finally
print("\n=== try-except-else-finally ===")

def bezpecne_deleni(a, b):
    try:
        vysledek = a / b
    except ZeroDivisionError:
        print(f"  CHYBA: {a}/{b} - deleni nulou!")
        return None
    except TypeError as e:
        print(f"  CHYBA: Spatny typ - {e}")
        return None
    else:
        # Provede se JEN kdyz NEBYLA vyjimka
        print(f"  OK: {a}/{b} = {vysledek}")
        return vysledek
    finally:
        # Provede se VZDY (uklid)
        print(f"  FINALLY: operace {a}/{b} dokoncena")

bezpecne_deleni(10, 3)
bezpecne_deleni(10, 0)
bezpecne_deleni("a", 2)


# ============================================================
#  VLASTNI VYJIMKY
# ============================================================
print("\n=== Vlastni vyjimky ===")

class ValidacniChyba(Exception):
    """Zakladni validacni chyba"""
    pass

class VekChyba(ValidacniChyba):
    """Neplatny vek"""
    def __init__(self, vek, zprava=None):
        self.vek = vek
        self.zprava = zprava or f"Neplatny vek: {vek}"
        super().__init__(self.zprava)

class JmenoChyba(ValidacniChyba):
    """Neplatne jmeno"""
    pass

class Student:
    def __init__(self, jmeno, vek):
        if not jmeno or not jmeno.strip():
            raise JmenoChyba("Jmeno nesmi byt prazdne")
        if not isinstance(vek, int):
            raise TypeError(f"Vek musi byt int, ne {type(vek).__name__}")
        if vek < 15 or vek > 100:
            raise VekChyba(vek)
        self.jmeno = jmeno.strip()
        self.vek = vek

# Zachyceni hierarchie vyjimek
test_data = [("Alice", 20), ("", 20), ("Bob", 10), ("Charlie", "dvacet")]
for jmeno, vek in test_data:
    try:
        s = Student(jmeno, vek)
        print(f"  Vytvoreno: {s.jmeno}, {s.vek}")
    except ValidacniChyba as e:
        # Chyti JmenoChyba i VekChyba (rodic)
        print(f"  Validace: {e}")
    except TypeError as e:
        print(f"  Typ: {e}")


# ============================================================
#  RETEZENI VYJIMEK (Exception Chaining)
# ============================================================
print("\n=== Retezeni vyjimek ===")

def nacti_konfiguraci(nazev):
    try:
        with open(nazev, 'r') as f:
            return f.read()
    except FileNotFoundError as e:
        raise RuntimeError(f"Konfigurace '{nazev}' nenalezena") from e

try:
    nacti_konfiguraci("neexistujici.cfg")
except RuntimeError as e:
    print(f"  {e}")
    print(f"  Puvodni pricina: {e.__cause__}")


# ============================================================
#  ASERCE (ASSERTIONS)
# ============================================================
print("\n=== Aserce ===")

def faktorial(n):
    """Faktorial s kontrolou preCondition a postCondition"""
    # Precondition - kontrola vstupu
    assert isinstance(n, int), f"n musi byt int, dostal jsem {type(n)}"
    assert n >= 0, f"n musi byt nezaporne, dostal jsem {n}"

    vysledek = 1
    for i in range(2, n + 1):
        vysledek *= i

    # Postcondition - kontrola vystupu
    assert vysledek >= 1, "Faktorial musi byt kladny"
    return vysledek

print(f"  5! = {faktorial(5)}")
print(f"  0! = {faktorial(0)}")

# Assert selze
for test in [(-1,), (3.5,)]:
    try:
        faktorial(test[0])
    except AssertionError as e:
        print(f"  AssertionError pro {test[0]}: {e}")
    except (AssertionError, Exception) as e:
        print(f"  {type(e).__name__} pro {test[0]}: {e}")


# Invariant
print("\n  Invariant - serazeny seznam:")
class SerazenyBuffer:
    def __init__(self):
        self._data = []

    def vloz(self, hodnota):
        # Vlozeni se zachovanim poradi
        import bisect
        bisect.insort(self._data, hodnota)
        # Invariant: _data je vzdy serazeny
        assert self._data == sorted(self._data), "Invariant porusen!"

    def __repr__(self):
        return str(self._data)

buf = SerazenyBuffer()
for x in [5, 3, 8, 1, 9, 2]:
    buf.vloz(x)
print(f"  {buf} (vzdy serazeny)")


# ============================================================
#  TRACEBACK A DIAGNOSTIKA
# ============================================================
print("\n=== Traceback ===")

def funkce_a():
    return funkce_b()

def funkce_b():
    return funkce_c()

def funkce_c():
    raise ValueError("Neco se pokazilo hluboko v kodu")

try:
    funkce_a()
except ValueError:
    print("  Zachycena vyjimka, traceback:")
    tb = traceback.format_exc()
    for line in tb.strip().split('\n'):
        print(f"    {line}")


# ============================================================
#  LOGOVANI
# ============================================================
print("\n=== Logovani ===")

# Konfigurace
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)

logger = logging.getLogger(__name__)

# Urovne logovani (od nejmene zavazne)
logger.debug("Detailni info pro debugovani")
logger.info("Informacni zprava")
logger.warning("Varovani - neco muze byt spatne")
logger.error("Chyba - neco selhalo")
logger.critical("Kriticka chyba - aplikace padne")

# Logovani vyjimek
try:
    hodnota = int("abc")
except ValueError:
    logger.exception("Chyba pri konverzi:")


# ============================================================
#  CONTEXT MANAGER PRO CLEANUP
# ============================================================
print("\n=== Context manager (with) ===")

class Databaze:
    """Simulace DB pripojeni s automatickym uklizenim"""

    def __init__(self, nazev):
        self.nazev = nazev

    def __enter__(self):
        print(f"  Pripojuji se k '{self.nazev}'...")
        self.pripojeno = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"  Odpojuji se od '{self.nazev}'")
        self.pripojeno = False
        if exc_type:
            print(f"  Zachycena vyjimka v with bloku: {exc_val}")
            return True  # vyjimka zpracovana (nepropaguje se)
        return False

# Normalni pouziti
with Databaze("studenti.db") as db:
    print(f"  Pracuji s DB... (pripojeno={db.pripojeno})")

# S vyjimkou uvnitr
with Databaze("test.db") as db:
    raise RuntimeError("Neco selhalo")
    # __exit__ se zavola i pri vyjimce!

print("  Program pokracuje (vyjimka byla zpracovana v __exit__)")


# ============================================================
#  DEBUGGING TIPY
# ============================================================
print("\n=== Debugging tipy ===")

# breakpoint() - vstup do interaktivniho debuggeru (pdb)
# breakpoint()  # <- odkomentovat pro aktivaci

# Conditional logging
data = {"uzivatel": "Alice", "akce": "login", "status": "ok"}
logger.debug("Request: %s", data)  # lazy evaluation - neformatuje pokud neni DEBUG

# f-string debugging (Python 3.8+)
x = 42
y = "hello"
print(f"  {x=}, {y=}")  # vypise: x=42, y='hello'

# Assert s uzitecnou zpravou
cisla = [1, 2, 3, 4, 5]
assert len(cisla) == 5, f"Ocekavano 5 cisel, mam {len(cisla)}: {cisla}"
print(f"  Assert OK: {cisla}")
