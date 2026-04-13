"""
Integrita dat, bezpecnost, logovani, validace vstupu, zpracovani chyb
"""
import logging
import hashlib
import re
import os

# ============================================================
#  LOGOVANI
# ============================================================

# Konfigurace loggeru
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("MojeAplikace")

logger.debug("Toto je debug zprava")
logger.info("Aplikace spustena")
logger.warning("Nizky stav pameti")
logger.error("Soubor nenalezen")
logger.critical("Databaze nedostupna!")


# ============================================================
#  VALIDACE VSTUPU
# ============================================================
print("\n=== Validace vstupu ===")

class ValidacniChyba(Exception):
    pass

def validuj_email(email):
    """Validace emailu pomoci regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidacniChyba(f"Neplatny email: {email}")
    return True

def validuj_vek(vek):
    """Validace veku - rozsah"""
    if not isinstance(vek, int):
        raise ValidacniChyba(f"Vek musi byt cele cislo, dostal: {type(vek).__name__}")
    if vek < 0 or vek > 150:
        raise ValidacniChyba(f"Vek mimo rozsah (0-150): {vek}")
    return True

def validuj_heslo(heslo):
    """Validace sily hesla"""
    chyby = []
    if len(heslo) < 8:
        chyby.append("minimalne 8 znaku")
    if not re.search(r'[A-Z]', heslo):
        chyby.append("alespon 1 velke pismeno")
    if not re.search(r'[a-z]', heslo):
        chyby.append("alespon 1 male pismeno")
    if not re.search(r'[0-9]', heslo):
        chyby.append("alespon 1 cislo")
    if not re.search(r'[!@#$%^&*]', heslo):
        chyby.append("alespon 1 specialni znak (!@#$%^&*)")
    if chyby:
        raise ValidacniChyba(f"Slabe heslo: {', '.join(chyby)}")
    return True

# Testovani validace
testy = [
    ("validuj_email", validuj_email, "user@example.com"),
    ("validuj_email", validuj_email, "spatny-email"),
    ("validuj_vek", validuj_vek, 25),
    ("validuj_vek", validuj_vek, -5),
    ("validuj_heslo", validuj_heslo, "Silne@Heslo1"),
    ("validuj_heslo", validuj_heslo, "slabe"),
]

for nazev, funkce, hodnota in testy:
    try:
        funkce(hodnota)
        print(f"  OK: {nazev}({hodnota!r})")
    except ValidacniChyba as e:
        print(f"  CHYBA: {e}")


# ============================================================
#  BEZPECNOST - HASHOVANI HESEL
# ============================================================
print("\n=== Hashovani hesel ===")

def hash_heslo(heslo, salt=None):
    """Hashuje heslo s nahodnym salt pomoci SHA256"""
    if salt is None:
        salt = os.urandom(16)
    hash_obj = hashlib.pbkdf2_hmac('sha256', heslo.encode(), salt, 100000)
    return salt, hash_obj

def over_heslo(heslo, salt, ulozeny_hash):
    """Overi heslo proti ulozenemu hashi"""
    _, novy_hash = hash_heslo(heslo, salt)
    return novy_hash == ulozeny_hash

# Simulace registrace a prihlaseni
heslo = "MojeT4jne!Heslo"
salt, hash_val = hash_heslo(heslo)
print(f"Salt: {salt.hex()}")
print(f"Hash: {hash_val.hex()}")

print(f"Overeni spravneho hesla: {over_heslo(heslo, salt, hash_val)}")
print(f"Overeni spatneho hesla:  {over_heslo('spatne', salt, hash_val)}")


# ============================================================
#  SQL INJECTION PREVENCE
# ============================================================
print("\n=== SQL Injection prevence ===")

# SPATNE - zranitelne na SQL injection!
def spatny_dotaz(uzivatel):
    return f"SELECT * FROM users WHERE name = '{uzivatel}'"

# SPRAVNE - parametrizovany dotaz
import sqlite3

def bezpecny_dotaz(db, uzivatel):
    cursor = db.execute("SELECT * FROM users WHERE name = ?", (uzivatel,))
    return cursor.fetchall()

vstup_utocnika = "'; DROP TABLE users; --"
print(f"SPATNY dotaz: {spatny_dotaz(vstup_utocnika)}")
print(f"BEZPECNY dotaz: pouziva parametrizovany dotaz s '?'")

# Ukazka s realnou DB
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)")
db.execute("INSERT INTO users VALUES (1, 'Alice', 'alice@mail.cz')")
db.execute("INSERT INTO users VALUES (2, 'Bob', 'bob@mail.cz')")

vysledek = bezpecny_dotaz(db, "Alice")
print(f"Bezpecny vysledek: {vysledek}")

vysledek = bezpecny_dotaz(db, vstup_utocnika)
print(f"Pokus o injection: {vysledek}")  # prazdny - zadny uzivatel s timto jmenem

db.close()


# ============================================================
#  ZPRACOVANI CHYB
# ============================================================
print("\n=== Zpracovani chyb ===")

class Uzivatel:
    def __init__(self, jmeno, email, vek):
        # Validace v konstruktoru (fail fast)
        validuj_email(email)
        validuj_vek(vek)
        self.jmeno = jmeno
        self.email = email
        self.vek = vek

# Zpracovani s try/except/else/finally
def vytvor_uzivatele(jmeno, email, vek):
    try:
        u = Uzivatel(jmeno, email, vek)
    except ValidacniChyba as e:
        logger.error(f"Validace selhala: {e}")
        return None
    except Exception as e:
        logger.critical(f"Neocekavana chyba: {e}")
        raise
    else:
        logger.info(f"Uzivatel {jmeno} uspesne vytvoren")
        return u
    finally:
        logger.debug("Pokus o vytvoreni uzivatele dokoncen")

u1 = vytvor_uzivatele("Alice", "alice@mail.cz", 25)
u2 = vytvor_uzivatele("Bob", "spatny-email", 25)
u3 = vytvor_uzivatele("Charlie", "charlie@mail.cz", -5)

print(f"\nVytvoreni: u1={u1 is not None}, u2={u2 is not None}, u3={u3 is not None}")
