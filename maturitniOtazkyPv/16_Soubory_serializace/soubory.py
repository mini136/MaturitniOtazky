"""
Soubory a serializace - JSON, CSV, XML, pickle, textove soubory
"""
import json
import csv
import xml.etree.ElementTree as ET
import pickle
import os
import tempfile

# Pracovni adresar pro docasne soubory
WORK_DIR = tempfile.mkdtemp()
print(f"Pracovni adresar: {WORK_DIR}\n")

# ============================================================
#  TEXTOVY SOUBOR
# ============================================================
print("=== Textovy soubor ===")

cesta = os.path.join(WORK_DIR, "poznamky.txt")

# Zapis
with open(cesta, 'w', encoding='utf-8') as f:
    f.write("Prvni radek\n")
    f.write("Druhy radek\n")
    f.writelines(["Treti\n", "Ctvrty\n"])

# Cteni - cele
with open(cesta, 'r', encoding='utf-8') as f:
    obsah = f.read()
    print(f"Cely soubor:\n{obsah}")

# Cteni - po radcich
with open(cesta, 'r', encoding='utf-8') as f:
    for i, radek in enumerate(f, 1):
        print(f"  Radek {i}: {radek.strip()}")

# Pripojeni (append)
with open(cesta, 'a', encoding='utf-8') as f:
    f.write("Paty radek (append)\n")


# ============================================================
#  JSON
# ============================================================
print("\n=== JSON ===")

studenti = [
    {"jmeno": "Alice", "vek": 20, "znamky": [1, 2, 1, 3]},
    {"jmeno": "Bob", "vek": 22, "znamky": [2, 3, 2, 2]},
    {"jmeno": "Charlie", "vek": 19, "znamky": [1, 1, 1, 2]},
]

# Serializace do JSON
json_cesta = os.path.join(WORK_DIR, "studenti.json")
with open(json_cesta, 'w', encoding='utf-8') as f:
    json.dump(studenti, f, indent=2, ensure_ascii=False)
print(f"JSON ulozen do {json_cesta}")

# Deserializace z JSON
with open(json_cesta, 'r', encoding='utf-8') as f:
    nacteni = json.load(f)

for s in nacteni:
    prumer = sum(s['znamky']) / len(s['znamky'])
    print(f"  {s['jmeno']}: vek={s['vek']}, prumer={prumer:.1f}")

# JSON string
json_str = json.dumps({"klic": "hodnota", "cislo": 42}, indent=2)
print(f"\nJSON string:\n{json_str}")

obj = json.loads(json_str)
print(f"Deserializovano: {obj}")


# ============================================================
#  CSV
# ============================================================
print("\n=== CSV ===")

csv_cesta = os.path.join(WORK_DIR, "studenti.csv")

# Zapis CSV
with open(csv_cesta, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["jmeno", "vek", "obor"])
    writer.writerow(["Alice", 20, "IT"])
    writer.writerow(["Bob", 22, "Design"])
    writer.writerow(["Charlie", 19, "IT"])

# Cteni CSV
with open(csv_cesta, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"  {row['jmeno']}, vek: {row['vek']}, obor: {row['obor']}")


# ============================================================
#  XML
# ============================================================
print("\n=== XML ===")

# Vytvoreni XML
root = ET.Element("skola")
root.set("nazev", "SPSE Jecna")

for jmeno, vek, obor in [("Alice", "20", "IT"), ("Bob", "22", "Design")]:
    student = ET.SubElement(root, "student")
    ET.SubElement(student, "jmeno").text = jmeno
    ET.SubElement(student, "vek").text = vek
    ET.SubElement(student, "obor").text = obor

# Ulozeni XML
xml_cesta = os.path.join(WORK_DIR, "studenti.xml")
tree = ET.ElementTree(root)
tree.write(xml_cesta, encoding='unicode', xml_declaration=True)

# Cteni XML
tree = ET.parse(xml_cesta)
root = tree.getroot()
print(f"Skola: {root.get('nazev')}")
for student in root.findall('student'):
    jmeno = student.find('jmeno').text
    vek = student.find('vek').text
    obor = student.find('obor').text
    print(f"  {jmeno}, vek: {vek}, obor: {obor}")


# ============================================================
#  PICKLE (binarni serializace - Python specificke)
# ============================================================
print("\n=== Pickle (binarni serializace) ===")

class Student:
    def __init__(self, jmeno, vek, znamky):
        self.jmeno = jmeno
        self.vek = vek
        self.znamky = znamky

    def __repr__(self):
        return f"Student('{self.jmeno}', {self.vek}, {self.znamky})"

studenti_obj = [
    Student("Alice", 20, [1, 2, 1]),
    Student("Bob", 22, [2, 3, 2]),
]

# Serializace
pkl_cesta = os.path.join(WORK_DIR, "studenti.pkl")
with open(pkl_cesta, 'wb') as f:
    pickle.dump(studenti_obj, f)
print(f"Pickle ulozen ({os.path.getsize(pkl_cesta)} B)")

# Deserializace
with open(pkl_cesta, 'rb') as f:
    nacteni = pickle.load(f)
print(f"Nacteno: {nacteni}")

print("\n⚠️  POZOR: pickle.load() na neduveryhodna data je NEBEZPECNE!")
print("   Muze provest libovolny kod. Pro externi data pouzijte JSON.")


# ============================================================
#  BINARNI SOUBORE
# ============================================================
print("\n=== Binarni soubor ===")

bin_cesta = os.path.join(WORK_DIR, "data.bin")

# Zapis binarnich dat
import struct
with open(bin_cesta, 'wb') as f:
    # struct.pack - baleni dat do binarnich formatu
    f.write(struct.pack('i', 42))          # int (4 bajty)
    f.write(struct.pack('f', 3.14))        # float (4 bajty)
    f.write(struct.pack('10s', b'Hello'))   # string (10 bajtu)

# Cteni binarnich dat
with open(bin_cesta, 'rb') as f:
    cislo = struct.unpack('i', f.read(4))[0]
    desetinne = struct.unpack('f', f.read(4))[0]
    text = struct.unpack('10s', f.read(10))[0].decode().strip('\x00')

print(f"  int: {cislo}")
print(f"  float: {desetinne:.2f}")
print(f"  string: '{text}'")
print(f"  Velikost souboru: {os.path.getsize(bin_cesta)} B")

# Uklid
import shutil
shutil.rmtree(WORK_DIR)
print(f"\nDocasne soubory smazany.")
