"""
Komunikace s databazovym systemem - SQLite ukazka
CRUD operace, transakce, jednoduchy ORM pattern
"""
import sqlite3
from dataclasses import dataclass

# ============================================================
#  ZAKLADNI PRIPOJENI A CRUD
# ============================================================
print("=== SQLite - zakladni CRUD ===\n")

# Pripojeni (in-memory databaze)
conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row  # pristup k sloupcum podle jmena

# Vytvoreni tabulky
conn.execute("""
    CREATE TABLE studenti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jmeno TEXT NOT NULL,
        vek INTEGER CHECK(vek > 0),
        obor TEXT DEFAULT 'IT'
    )
""")

# CREATE - vlozeni dat (parametrizovany dotaz!)
studenti_data = [
    ("Alice", 20, "IT"),
    ("Bob", 22, "Kybernetika"),
    ("Charlie", 19, "IT"),
    ("Diana", 21, "Grafika"),
]
conn.executemany(
    "INSERT INTO studenti (jmeno, vek, obor) VALUES (?, ?, ?)",
    studenti_data
)
conn.commit()
print(f"Vlozeno {len(studenti_data)} studentu")

# READ - nacteni dat
print("\nVsichni studenti:")
for row in conn.execute("SELECT * FROM studenti"):
    print(f"  [{row['id']}] {row['jmeno']}, vek={row['vek']}, obor={row['obor']}")

# Filtrovani
print("\nStudenti IT:")
for row in conn.execute("SELECT * FROM studenti WHERE obor = ?", ("IT",)):
    print(f"  {row['jmeno']}")

# Agregace
result = conn.execute("SELECT AVG(vek) as prumer, COUNT(*) as pocet FROM studenti").fetchone()
print(f"\nPrumerny vek: {result['prumer']:.1f}, pocet: {result['pocet']}")

# UPDATE
conn.execute("UPDATE studenti SET vek = ? WHERE jmeno = ?", (23, "Bob"))
conn.commit()
print("\nBob aktualizovan na vek 23")

# DELETE
conn.execute("DELETE FROM studenti WHERE jmeno = ?", ("Diana",))
conn.commit()
print("Diana smazana")

print("\nPo zmenach:")
for row in conn.execute("SELECT * FROM studenti"):
    print(f"  [{row['id']}] {row['jmeno']}, vek={row['vek']}")


# ============================================================
#  TRANSAKCE
# ============================================================
print("\n=== Transakce ===")

conn.execute("""
    CREATE TABLE ucty (
        id INTEGER PRIMARY KEY,
        jmeno TEXT,
        zustatek REAL
    )
""")
conn.execute("INSERT INTO ucty VALUES (1, 'Alice', 1000)")
conn.execute("INSERT INTO ucty VALUES (2, 'Bob', 500)")
conn.commit()

def prevod(conn, od, komu, castka):
    """Atomicky prevod penez mezi ucty"""
    try:
        # Kontrola zustatku
        row = conn.execute("SELECT zustatek FROM ucty WHERE id = ?", (od,)).fetchone()
        if row['zustatek'] < castka:
            raise ValueError("Nedostatek prostredku!")

        conn.execute("UPDATE ucty SET zustatek = zustatek - ? WHERE id = ?", (castka, od))
        conn.execute("UPDATE ucty SET zustatek = zustatek + ? WHERE id = ?", (castka, komu))
        conn.commit()
        print(f"  Prevod {castka} Kc: ucet {od} -> ucet {komu} OK")
    except Exception as e:
        conn.rollback()
        print(f"  Prevod selhal: {e}")

prevod(conn, 1, 2, 300)
prevod(conn, 2, 1, 2000)  # selze - nedostatek

for row in conn.execute("SELECT * FROM ucty"):
    print(f"  {row['jmeno']}: {row['zustatek']} Kc")


# ============================================================
#  JEDNODUCHY ORM PATTERN
# ============================================================
print("\n=== Jednoduchy ORM ===")

@dataclass
class Student:
    id: int = None
    jmeno: str = ""
    vek: int = 0
    obor: str = "IT"

class StudentRepository:
    """Repository pattern - mapovani Student <-> tabulka"""

    def __init__(self, conn):
        self.conn = conn

    def najdi_vsechny(self):
        rows = self.conn.execute("SELECT * FROM studenti").fetchall()
        return [Student(id=r['id'], jmeno=r['jmeno'], vek=r['vek'], obor=r['obor']) for r in rows]

    def najdi_podle_id(self, id):
        row = self.conn.execute("SELECT * FROM studenti WHERE id = ?", (id,)).fetchone()
        if row:
            return Student(id=row['id'], jmeno=row['jmeno'], vek=row['vek'], obor=row['obor'])
        return None

    def uloz(self, student):
        if student.id is None:
            cursor = self.conn.execute(
                "INSERT INTO studenti (jmeno, vek, obor) VALUES (?, ?, ?)",
                (student.jmeno, student.vek, student.obor)
            )
            student.id = cursor.lastrowid
        else:
            self.conn.execute(
                "UPDATE studenti SET jmeno=?, vek=?, obor=? WHERE id=?",
                (student.jmeno, student.vek, student.obor, student.id)
            )
        self.conn.commit()
        return student

    def smaz(self, id):
        self.conn.execute("DELETE FROM studenti WHERE id = ?", (id,))
        self.conn.commit()

# Pouziti ORM
repo = StudentRepository(conn)

# Nacteni
vsichni = repo.najdi_vsechny()
print("Vsichni studenti (ORM):")
for s in vsichni:
    print(f"  {s}")

# Pridani noveho
novy = Student(jmeno="Eva", vek=20, obor="Design")
repo.uloz(novy)
print(f"\nNovy student: {novy}")

# Aktualizace
student = repo.najdi_podle_id(1)
if student:
    student.vek = 21
    repo.uloz(student)
    print(f"Aktualizovan: {student}")

# Smazani
repo.smaz(3)
print("Student id=3 smazan")

print("\nFinalni stav:")
for s in repo.najdi_vsechny():
    print(f"  {s}")

conn.close()
