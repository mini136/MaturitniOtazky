"""
ML Priprava dat - cisteni, transformace, rozdeleni datasetu
BEZ externich knihoven (zadne pandas, sklearn) - ciste Python
"""
import csv
import math
import random
import os
import tempfile

# ============================================================
#  VYTVORENI TESTOVACICH DAT (simulace)
# ============================================================
print("=== Generovani ukazkoveho datasetu ===")

random.seed(42)

# Hlavicka: jmeno, vek, plat, mesto, hodnoceni
hlavicka = ["jmeno", "vek", "plat", "mesto", "hodnoceni"]
data = []
jmena = ["Alice", "Bob", "Charlie", "Diana", "Eva", "Filip", "Gita", "Hana",
         "Ivan", "Jana", "Karel", "Lucie", "Martin", "Nina", "Ondrej"]

for jmeno in jmena:
    vek = random.randint(20, 60)
    plat = random.randint(25000, 80000)
    mesto = random.choice(["Praha", "Brno", "Ostrava", "praha", "BRNO"])  # nekonzistentni
    hodnoceni = round(random.uniform(1.0, 5.0), 1)
    data.append([jmeno, str(vek), str(plat), mesto, str(hodnoceni)])

# Pridame nejake problemy
data[2][1] = ""       # chybejici vek
data[5][2] = ""       # chybejici plat
data[8][4] = ""       # chybejici hodnoceni
data.append(["Alice", "20", "30000", "Praha", "3.5"])  # duplikat jmena
data[10][2] = "500000"  # outlier plat

# Ulozit CSV
work_dir = tempfile.mkdtemp()
csv_cesta = os.path.join(work_dir, "data.csv")
with open(csv_cesta, 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(hlavicka)
    w.writerows(data)
print(f"Dataset ulozen: {len(data)} zaznamu\n")


# ============================================================
#  NACTENI DAT
# ============================================================
print("=== Nacteni dat ===")

with open(csv_cesta, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    dataset = list(reader)

print(f"Nacteno {len(dataset)} zaznamu")
print(f"Sloupce: {list(dataset[0].keys())}")
print(f"Prvni 3 zaznamy:")
for d in dataset[:3]:
    print(f"  {dict(d)}")


# ============================================================
#  CISTENI DAT
# ============================================================
print("\n=== 1. Detekce chybejicich hodnot ===")

for sloupec in hlavicka:
    chybejici = sum(1 for row in dataset if row[sloupec].strip() == "")
    if chybejici > 0:
        print(f"  '{sloupec}': {chybejici} chybejicich hodnot")

# Imputace - nahrazeni chybejicich hodnot prumerem (numericke sloupce)
print("\n  Imputace prumerem pro numericke sloupce...")
for sloupec in ["vek", "plat", "hodnoceni"]:
    hodnoty = [float(row[sloupec]) for row in dataset if row[sloupec].strip() != ""]
    prumer = sum(hodnoty) / len(hodnoty)
    for row in dataset:
        if row[sloupec].strip() == "":
            row[sloupec] = str(round(prumer, 1))
            print(f"    {row['jmeno']}: {sloupec} nahrazeno prumerem {prumer:.1f}")


# ============================================================
print("\n=== 2. Konzistence dat ===")
# Normalizace textu - sjednoceni velikosti pismen
for row in dataset:
    puvodni = row['mesto']
    row['mesto'] = row['mesto'].strip().title()
    if puvodni != row['mesto']:
        print(f"  '{puvodni}' -> '{row['mesto']}'")


# ============================================================
print("\n=== 3. Detekce duplicit ===")
videno = set()
duplicity = []
unikatni = []
for row in dataset:
    klic = row['jmeno']
    if klic in videno:
        duplicity.append(row)
        print(f"  Duplicita: {row['jmeno']}")
    else:
        videno.add(klic)
        unikatni.append(row)

dataset = unikatni
print(f"  Odebrano {len(duplicity)} duplicitnich zaznamu, zbyva {len(dataset)}")


# ============================================================
print("\n=== 4. Detekce outlieru (IQR metoda) ===")

def detekuj_outliers_iqr(hodnoty, nasobek=1.5):
    """IQR metoda: outlier je mimo [Q1 - 1.5*IQR, Q3 + 1.5*IQR]"""
    serazene = sorted(hodnoty)
    n = len(serazene)
    q1 = serazene[n // 4]
    q3 = serazene[3 * n // 4]
    iqr = q3 - q1
    dolni = q1 - nasobek * iqr
    horni = q3 + nasobek * iqr
    return dolni, horni

platy = [float(row['plat']) for row in dataset]
dolni, horni = detekuj_outliers_iqr(platy)
print(f"  Plat - IQR hranice: [{dolni:.0f}, {horni:.0f}]")

for row in dataset:
    plat = float(row['plat'])
    if plat < dolni or plat > horni:
        print(f"  ⚠ Outlier: {row['jmeno']} plat={plat:.0f}")
        # Nahradime medianem
        median_plat = sorted(platy)[len(platy) // 2]
        row['plat'] = str(int(median_plat))
        print(f"    Nahrazeno medianem: {median_plat:.0f}")


# ============================================================
#  TRANSFORMACE DAT
# ============================================================
print("\n=== 5. Normalizace (Min-Max scaling) ===")

def min_max_normalizace(hodnoty):
    """Skalouje hodnoty na rozsah [0, 1]"""
    mi, ma = min(hodnoty), max(hodnoty)
    if mi == ma:
        return [0.5] * len(hodnoty)
    return [(x - mi) / (ma - mi) for x in hodnoty]

veky = [float(row['vek']) for row in dataset]
veky_norm = min_max_normalizace(veky)
print(f"  Vek pred:  min={min(veky):.0f}, max={max(veky):.0f}")
print(f"  Vek po:    min={min(veky_norm):.2f}, max={max(veky_norm):.2f}")
for i, row in enumerate(dataset[:5]):
    print(f"    {row['jmeno']}: {veky[i]:.0f} -> {veky_norm[i]:.3f}")


print("\n=== 6. Standardizace (Z-score) ===")

def standardizace(hodnoty):
    """Z-score: (x - prumer) / smerodatna_odchylka"""
    n = len(hodnoty)
    prumer = sum(hodnoty) / n
    rozptyl = sum((x - prumer) ** 2 for x in hodnoty) / n
    std = math.sqrt(rozptyl)
    if std == 0:
        return [0.0] * n
    return [(x - prumer) / std for x in hodnoty]

platy = [float(row['plat']) for row in dataset]
platy_std = standardizace(platy)
print(f"  Plat pred: prumer={sum(platy)/len(platy):.0f}")
prumer_po = sum(platy_std) / len(platy_std)
std_po = math.sqrt(sum((x - prumer_po)**2 for x in platy_std) / len(platy_std))
print(f"  Plat po:   prumer={prumer_po:.4f}, std={std_po:.4f}")


print("\n=== 7. One-Hot Encoding (kategoricke data) ===")

mesta = list(set(row['mesto'] for row in dataset))
mesta.sort()
print(f"  Unikatni mesta: {mesta}")

for row in dataset[:5]:
    one_hot = [1 if row['mesto'] == m else 0 for m in mesta]
    print(f"  {row['jmeno']:10s} {row['mesto']:10s} -> {one_hot}")


# ============================================================
#  ROZDELENI DAT
# ============================================================
print("\n=== 8. Rozdeleni na train/test ===")

def rozdel_data(data, pomer_train=0.8, seed=42):
    """Rozdeleni dat na trenovaci a testovaci sadu"""
    kopie = data.copy()
    random.seed(seed)
    random.shuffle(kopie)
    hranice = int(len(kopie) * pomer_train)
    return kopie[:hranice], kopie[hranice:]

train, test = rozdel_data(dataset, pomer_train=0.8)
print(f"  Celkem: {len(dataset)}")
print(f"  Train:  {len(train)} ({len(train)/len(dataset)*100:.0f}%)")
print(f"  Test:   {len(test)} ({len(test)/len(dataset)*100:.0f}%)")


# ============================================================
#  KORELACE
# ============================================================
print("\n=== 9. Korelacni analyza ===")

def korelace(x, y):
    """Pearsonuv korelacni koeficient"""
    n = len(x)
    prumer_x = sum(x) / n
    prumer_y = sum(y) / n
    citatel = sum((xi - prumer_x) * (yi - prumer_y) for xi, yi in zip(x, y))
    jmenovatel_x = math.sqrt(sum((xi - prumer_x)**2 for xi in x))
    jmenovatel_y = math.sqrt(sum((yi - prumer_y)**2 for yi in y))
    if jmenovatel_x == 0 or jmenovatel_y == 0:
        return 0
    return citatel / (jmenovatel_x * jmenovatel_y)

veky = [float(row['vek']) for row in dataset]
platy = [float(row['plat']) for row in dataset]
hodnoceni = [float(row['hodnoceni']) for row in dataset]

print(f"  Korelace vek-plat:      {korelace(veky, platy):.3f}")
print(f"  Korelace vek-hodnoceni: {korelace(veky, hodnoceni):.3f}")
print(f"  Korelace plat-hodnoceni:{korelace(platy, hodnoceni):.3f}")
print("  (blizko 0 = neni korelace, blizko ±1 = silna korelace)")

# Uklid
import shutil
shutil.rmtree(work_dir)
print(f"\nDocasne soubory smazany.")
