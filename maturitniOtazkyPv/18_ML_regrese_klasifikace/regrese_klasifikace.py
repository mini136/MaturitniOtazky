"""
ML Regrese a klasifikace - implementace od nuly (bez sklearn)
Linearni regrese, logisticka regrese, KNN, rozhodovaci strom
"""
import math
import random

random.seed(42)

# ============================================================
#  LINEARNI REGRESE (gradient descent)
# ============================================================
print("=== Linearni regrese ===")
print("Predikce ceny bytu podle velikosti (m2)")

# Generujeme data: cena = 3000 * m2 + 500000 + sum
train_data = []
for _ in range(50):
    m2 = random.uniform(30, 120)
    cena = 3000 * m2 + 500000 + random.gauss(0, 50000)
    train_data.append((m2, cena))

# Normalizace vstupu
x_data = [d[0] for d in train_data]
y_data = [d[1] for d in train_data]
x_min, x_max = min(x_data), max(x_data)
y_min, y_max = min(y_data), max(y_data)

x_norm = [(x - x_min) / (x_max - x_min) for x in x_data]
y_norm = [(y - y_min) / (y_max - y_min) for y in y_data]

# Gradient descent
w = 0.0  # vaha
b = 0.0  # bias
lr = 0.1  # learning rate
epochy = 100

for epoch in range(epochy):
    # Predikce
    predikce = [w * x + b for x in x_norm]

    # MSE
    mse = sum((p - y) ** 2 for p, y in zip(predikce, y_norm)) / len(y_norm)

    # Gradienty
    dw = sum(2 * (p - y) * x for p, y, x in zip(predikce, y_norm, x_norm)) / len(y_norm)
    db = sum(2 * (p - y) for p, y in zip(predikce, y_norm)) / len(y_norm)

    # Update vah
    w -= lr * dw
    b -= lr * db

    if epoch % 25 == 0:
        print(f"  Epocha {epoch:3d}: MSE={mse:.6f}, w={w:.4f}, b={b:.4f}")

# Test predikce
test_m2 = 75
test_norm = (test_m2 - x_min) / (x_max - x_min)
pred_norm = w * test_norm + b
pred_cena = pred_norm * (y_max - y_min) + y_min
print(f"\n  Predikce pro {test_m2} m2: {pred_cena:,.0f} Kc")
print(f"  Skutecna zavislost: {3000 * test_m2 + 500000:,.0f} Kc")


# ============================================================
#  LOGISTICKA REGRESE (binarni klasifikace)
# ============================================================
print("\n=== Logisticka regrese ===")
print("Klasifikace: projde/neprojde zkousku (podle hodin uceni a spani)")

def sigmoid(z):
    z = max(-500, min(500, z))  # ochrana proti overflow
    return 1 / (1 + math.exp(-z))

# Data: [hodiny_uceni, hodiny_spanku] -> 1=projde, 0=neprojde
data_klasifikace = [
    ([1, 4], 0), ([2, 5], 0), ([3, 3], 0), ([2, 4], 0), ([1, 6], 0),
    ([5, 7], 1), ([6, 8], 1), ([7, 6], 1), ([8, 7], 1), ([6, 6], 1),
    ([4, 5], 0), ([4, 7], 1), ([5, 5], 1), ([3, 8], 0), ([7, 5], 1),
    ([8, 8], 1), ([9, 6], 1), ([3, 6], 0), ([5, 8], 1), ([2, 7], 0),
]

# Inicializace
w1, w2, bias = 0.0, 0.0, 0.0
lr = 0.1

for epoch in range(200):
    total_loss = 0
    for features, label in data_klasifikace:
        # Forward
        z = w1 * features[0] + w2 * features[1] + bias
        pred = sigmoid(z)

        # Binary cross-entropy loss
        eps = 1e-7
        loss = -(label * math.log(pred + eps) + (1 - label) * math.log(1 - pred + eps))
        total_loss += loss

        # Gradient
        error = pred - label
        w1 -= lr * error * features[0]
        w2 -= lr * error * features[1]
        bias -= lr * error

    if epoch % 50 == 0:
        avg_loss = total_loss / len(data_klasifikace)
        print(f"  Epocha {epoch:3d}: loss={avg_loss:.4f}")

# Testovani
print("\n  Predikce:")
testy = [(3, 4), (7, 7), (5, 6), (1, 5)]
for h_uceni, h_spanek in testy:
    z = w1 * h_uceni + w2 * h_spanek + bias
    prob = sigmoid(z)
    vysledek = "PROJDE" if prob >= 0.5 else "NEPROJDE"
    print(f"    Uceni={h_uceni}h, Spanek={h_spanek}h -> P={prob:.2f} -> {vysledek}")


# ============================================================
#  K-NEAREST NEIGHBORS (KNN)
# ============================================================
print("\n=== KNN Klasifikace ===")

def vzdalenost(a, b):
    return math.sqrt(sum((ai - bi) ** 2 for ai, bi in zip(a, b)))

def knn_predict(train, novy_bod, k=3):
    """Najde K nejblizsich sousedu a vrati majoritni tridu"""
    # Vzdalenosti ke vsem trenovacim bodum
    vzdalenosti = []
    for features, label in train:
        d = vzdalenost(features, novy_bod)
        vzdalenosti.append((d, label))

    # Seradit, vzit K nejblizsich
    vzdalenosti.sort(key=lambda x: x[0])
    k_nejblizsich = vzdalenosti[:k]

    # Hlasovani
    hlasy = {}
    for _, label in k_nejblizsich:
        hlasy[label] = hlasy.get(label, 0) + 1

    return max(hlasy, key=hlasy.get)

print("Klasifikace ovoce podle vahy (g) a barvy (R hodnota):")
# Data: [vaha, cervena_slozka] -> ovoce
ovoce_data = [
    ([150, 255], "jablko"), ([160, 200], "jablko"), ([140, 220], "jablko"),
    ([120, 255], "rajce"), ([100, 240], "rajce"), ([110, 250], "rajce"),
    ([180, 50], "hruska"), ([200, 80], "hruska"), ([170, 60], "hruska"),
    ([130, 100], "kiwi"), ([120, 90], "kiwi"),
]

# Predikce
test_ovoce = [[155, 230], [190, 70], [115, 240], [125, 95]]
for bod in test_ovoce:
    vysledek = knn_predict(ovoce_data, bod, k=3)
    print(f"  Vaha={bod[0]}g, R={bod[1]} -> {vysledek}")


# ============================================================
#  ROZHODOVACI STROM (jednoduchy)
# ============================================================
print("\n=== Rozhodovaci strom ===")

def gini_impurity(skupiny, tridy):
    """Vypocet Gini impurity pro rozdeleni"""
    celkem = sum(len(s) for s in skupiny)
    gini = 0.0
    for skupina in skupiny:
        n = len(skupina)
        if n == 0:
            continue
        score = 0.0
        for trida in tridy:
            p = sum(1 for row in skupina if row[-1] == trida) / n
            score += p * p
        gini += (1.0 - score) * (n / celkem)
    return gini

def rozdeleni(data, index, prah):
    """Rozdeli data podle feature[index] < prah"""
    leva = [row for row in data if row[index] < prah]
    prava = [row for row in data if row[index] >= prah]
    return leva, prava

def najdi_nejlepsi_rozdeleni(data):
    """Najde nejlepsi feature a prah pro rozdeleni"""
    tridy = list(set(row[-1] for row in data))
    nejlepsi_gini = float('inf')
    nejlepsi = None

    for index in range(len(data[0]) - 1):  # vsechny features
        hodnoty = sorted(set(row[index] for row in data))
        for i in range(len(hodnoty) - 1):
            prah = (hodnoty[i] + hodnoty[i + 1]) / 2
            leva, prava = rozdeleni(data, index, prah)
            gini = gini_impurity([leva, prava], tridy)
            if gini < nejlepsi_gini:
                nejlepsi_gini = gini
                nejlepsi = (index, prah, leva, prava)

    return nejlepsi

def postav_strom(data, hloubka=0, max_hloubka=3):
    """Rekurzivne postavi rozhodovaci strom"""
    tridy = [row[-1] for row in data]

    # Ukoncovaci podminky
    if len(set(tridy)) == 1:
        return tridy[0]
    if hloubka >= max_hloubka:
        return max(set(tridy), key=tridy.count)

    vysl = najdi_nejlepsi_rozdeleni(data)
    if vysl is None:
        return max(set(tridy), key=tridy.count)

    index, prah, leva, prava = vysl
    return {
        'feature': index,
        'prah': prah,
        'leva': postav_strom(leva, hloubka + 1, max_hloubka),
        'prava': postav_strom(prava, hloubka + 1, max_hloubka),
    }

def predikuj_strom(strom, radek):
    """Predikce pomoci rozhodoaciho stromu"""
    if not isinstance(strom, dict):
        return strom
    if radek[strom['feature']] < strom['prah']:
        return predikuj_strom(strom['leva'], radek)
    else:
        return predikuj_strom(strom['prava'], radek)

def zobraz_strom(strom, odsazeni=0):
    """Zobrazeni stromu"""
    if not isinstance(strom, dict):
        print("  " * odsazeni + f"-> {strom}")
        return
    print("  " * odsazeni + f"Feature[{strom['feature']}] < {strom['prah']:.1f}?")
    print("  " * odsazeni + "Ano:")
    zobraz_strom(strom['leva'], odsazeni + 1)
    print("  " * odsazeni + "Ne:")
    zobraz_strom(strom['prava'], odsazeni + 1)

# Data: [hodiny_uceni, hodiny_spanku, vysledek]
strom_data = [
    [1, 4, "neprojde"], [2, 5, "neprojde"], [3, 3, "neprojde"],
    [5, 7, "projde"], [6, 8, "projde"], [7, 6, "projde"],
    [4, 5, "neprojde"], [4, 7, "projde"], [5, 5, "projde"],
    [8, 7, "projde"], [2, 7, "neprojde"], [6, 6, "projde"],
]

strom = postav_strom(strom_data, max_hloubka=3)
print("Struktura stromu:")
zobraz_strom(strom)

print("\nPredikce:")
testy_strom = [[3, 4], [7, 7], [5, 6], [1, 8]]
for t in testy_strom:
    pred = predikuj_strom(strom, t)
    print(f"  Uceni={t[0]}h, Spanek={t[1]}h -> {pred}")


# ============================================================
#  METRIKY
# ============================================================
print("\n=== Vyhodnoceni metrik ===")

y_true = [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1]
y_pred = [1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1]

# Confusion matrix
TP = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
FP = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
FN = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
TN = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)

accuracy = (TP + TN) / len(y_true)
precision = TP / (TP + FP) if (TP + FP) > 0 else 0
recall = TP / (TP + FN) if (TP + FN) > 0 else 0
f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

print(f"  Confusion Matrix: TP={TP}, FP={FP}, FN={FN}, TN={TN}")
print(f"  Accuracy:  {accuracy:.3f}")
print(f"  Precision: {precision:.3f}")
print(f"  Recall:    {recall:.3f}")
print(f"  F1-score:  {f1:.3f}")
