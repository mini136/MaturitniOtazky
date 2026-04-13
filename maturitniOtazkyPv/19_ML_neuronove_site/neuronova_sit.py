"""
Neuronova sit od nuly - bez externich knihoven
Klasifikace XOR problemu (nelze linearne separovat)
"""
import math
import random

random.seed(42)

# ============================================================
#  AKTIVACNI FUNKCE
# ============================================================

def sigmoid(x):
    x = max(-500, min(500, x))
    return 1 / (1 + math.exp(-x))

def sigmoid_derivace(x):
    """Derivace sigmoidu: s(x) * (1 - s(x))"""
    s = sigmoid(x)
    return s * (1 - s)

def relu(x):
    return max(0, x)

def relu_derivace(x):
    return 1 if x > 0 else 0

def tanh(x):
    return math.tanh(x)

def tanh_derivace(x):
    return 1 - math.tanh(x) ** 2

print("=== Aktivacni funkce ===")
for x in [-2, -1, 0, 1, 2]:
    print(f"  x={x:2d}: sigmoid={sigmoid(x):.3f}, relu={relu(x)}, tanh={tanh(x):.3f}")


# ============================================================
#  JEDNODUCHY PERCEPTRON (linearne separovatelne)
# ============================================================
print("\n=== Perceptron (AND gate) ===")

class Perceptron:
    def __init__(self, n_vstupu, lr=0.1):
        self.vahy = [random.uniform(-1, 1) for _ in range(n_vstupu)]
        self.bias = random.uniform(-1, 1)
        self.lr = lr

    def predikce(self, vstupy):
        z = sum(w * x for w, x in zip(self.vahy, vstupy)) + self.bias
        return 1 if z >= 0 else 0

    def trenuj(self, data, epochy=20):
        for epoch in range(epochy):
            chyby = 0
            for vstupy, ocekavany in data:
                predikce = self.predikce(vstupy)
                chyba = ocekavany - predikce
                if chyba != 0:
                    chyby += 1
                    for i in range(len(self.vahy)):
                        self.vahy[i] += self.lr * chyba * vstupy[i]
                    self.bias += self.lr * chyba
            if chyby == 0:
                print(f"  Konvergence po {epoch + 1} epochach")
                break

# AND gate
and_data = [([0, 0], 0), ([0, 1], 0), ([1, 0], 0), ([1, 1], 1)]
p = Perceptron(2)
p.trenuj(and_data)
print("  AND vysledky:")
for vstupy, _ in and_data:
    print(f"    {vstupy[0]} AND {vstupy[1]} = {p.predikce(vstupy)}")


# ============================================================
#  NEURONOVA SIT (multilayer - XOR)
# ============================================================
print("\n=== Neuronova sit - XOR ===")
print("XOR nelze resit jednim perceptronem - potrebujeme skrytou vrstvu\n")

class NeuralNetwork:
    """
    Sit: 2 vstupy -> 4 skryte neurony -> 1 vystup
    Aktivace: sigmoid
    """
    def __init__(self, lr=0.5):
        self.lr = lr

        # Vahy: vstup -> skryta vrstva (2x4)
        self.w_hidden = [[random.uniform(-1, 1) for _ in range(2)] for _ in range(4)]
        self.b_hidden = [random.uniform(-1, 1) for _ in range(4)]

        # Vahy: skryta vrstva -> vystup (4x1)
        self.w_output = [random.uniform(-1, 1) for _ in range(4)]
        self.b_output = random.uniform(-1, 1)

    def forward(self, vstupy):
        """Dopredny pruchod"""
        # Skryta vrstva
        self.hidden_z = []
        self.hidden_a = []
        for i in range(4):
            z = sum(w * x for w, x in zip(self.w_hidden[i], vstupy)) + self.b_hidden[i]
            self.hidden_z.append(z)
            self.hidden_a.append(sigmoid(z))

        # Vystupni vrstva
        self.output_z = sum(w * a for w, a in zip(self.w_output, self.hidden_a)) + self.b_output
        self.output_a = sigmoid(self.output_z)

        return self.output_a

    def backward(self, vstupy, ocekavany):
        """Zpetna propagace"""
        # Chyba vystupu
        output_error = self.output_a - ocekavany
        output_delta = output_error * sigmoid_derivace(self.output_z)

        # Chyby skryte vrstvy
        hidden_deltas = []
        for i in range(4):
            error = output_delta * self.w_output[i]
            delta = error * sigmoid_derivace(self.hidden_z[i])
            hidden_deltas.append(delta)

        # Aktualizace vah: vystupni vrstva
        for i in range(4):
            self.w_output[i] -= self.lr * output_delta * self.hidden_a[i]
        self.b_output -= self.lr * output_delta

        # Aktualizace vah: skryta vrstva
        for i in range(4):
            for j in range(2):
                self.w_hidden[i][j] -= self.lr * hidden_deltas[i] * vstupy[j]
            self.b_hidden[i] -= self.lr * hidden_deltas[i]

    def trenuj(self, data, epochy=5000):
        for epoch in range(epochy):
            total_loss = 0
            for vstupy, ocekavany in data:
                predikce = self.forward(vstupy)
                self.backward(vstupy, ocekavany)
                total_loss += (ocekavany - predikce) ** 2

            if epoch % 1000 == 0:
                print(f"  Epocha {epoch:5d}: loss={total_loss:.6f}")

# XOR data
xor_data = [([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)]

nn = NeuralNetwork(lr=1.0)
nn.trenuj(xor_data, epochy=5001)

print("\n  XOR vysledky:")
for vstupy, ocekavany in xor_data:
    predikce = nn.forward(vstupy)
    zaokrouhleno = round(predikce)
    status = "✓" if zaokrouhleno == ocekavany else "✗"
    print(f"    {vstupy[0]} XOR {vstupy[1]} = {predikce:.4f} (zaokrouhleno: {zaokrouhleno}) {status}")


# ============================================================
#  MNIST-LIKE KLASIFIKACE (zjednodusena)
# ============================================================
print("\n=== Klasifikace cislic (zjednodusena) ===")
print("3x3 pixelovy 'obrazek' -> cislo 0-3\n")

class SimpleClassifier:
    """Sit: 9 vstupu (3x3) -> 8 skrytych -> 4 vystupy (softmax)"""

    def __init__(self, n_in, n_hidden, n_out, lr=0.1):
        self.lr = lr
        self.n_in = n_in
        self.n_hidden = n_hidden
        self.n_out = n_out

        # Random init
        self.w1 = [[random.gauss(0, 0.5) for _ in range(n_in)] for _ in range(n_hidden)]
        self.b1 = [0.0] * n_hidden
        self.w2 = [[random.gauss(0, 0.5) for _ in range(n_hidden)] for _ in range(n_out)]
        self.b2 = [0.0] * n_out

    def softmax(self, z):
        max_z = max(z)
        exp_z = [math.exp(zi - max_z) for zi in z]
        suma = sum(exp_z)
        return [e / suma for e in exp_z]

    def forward(self, x):
        # Skryta vrstva (ReLU)
        self.h_z = [sum(self.w1[i][j] * x[j] for j in range(self.n_in)) + self.b1[i]
                     for i in range(self.n_hidden)]
        self.h_a = [relu(z) for z in self.h_z]

        # Vystup (softmax)
        self.o_z = [sum(self.w2[i][j] * self.h_a[j] for j in range(self.n_hidden)) + self.b2[i]
                     for i in range(self.n_out)]
        self.o_a = self.softmax(self.o_z)
        return self.o_a

    def predict(self, x):
        probs = self.forward(x)
        return probs.index(max(probs))

# Jednoduche 3x3 vzory cislic
vzory = {
    0: [1,1,1, 1,0,1, 1,1,1],  # obdelnik
    1: [0,1,0, 0,1,0, 0,1,0],  # svisla cara
    2: [1,1,1, 0,1,0, 1,1,1],  # esovity vzor
    3: [1,1,1, 0,1,1, 1,1,1],  # trojka
}

# Vizualizace vzoru
for cislo, pixely in vzory.items():
    radky = [pixely[i:i+3] for i in range(0, 9, 3)]
    vizual = "  ".join("".join("█" if p else "·" for p in r) for r in radky)
    print(f"  Cislo {cislo}: {vizual}")

# Trenovani (jednoduche, bez backprop - pouzijeme numericke gradienty)
clf = SimpleClassifier(9, 8, 4, lr=0.01)

print("\n  Trenovani...")
for epoch in range(500):
    total_loss = 0
    for cislo, pixely in vzory.items():
        probs = clf.forward(pixely)
        # Cross-entropy loss
        total_loss -= math.log(probs[cislo] + 1e-7)

        # Jednoduchy gradient update (approximate)
        target = [0] * 4
        target[cislo] = 1

        for i in range(clf.n_out):
            error = probs[i] - target[i]
            for j in range(clf.n_hidden):
                clf.w2[i][j] -= clf.lr * error * clf.h_a[j]
            clf.b2[i] -= clf.lr * error

        for i in range(clf.n_hidden):
            upstream = sum((probs[k] - target[k]) * clf.w2[k][i] for k in range(clf.n_out))
            d_relu = relu_derivace(clf.h_z[i])
            for j in range(clf.n_in):
                clf.w1[i][j] -= clf.lr * upstream * d_relu * pixely[j]
            clf.b1[i] -= clf.lr * upstream * d_relu

    if epoch % 100 == 0:
        print(f"    Epocha {epoch}: loss={total_loss:.4f}")

print("\n  Predikce:")
for cislo, pixely in vzory.items():
    pred = clf.predict(pixely)
    probs = clf.forward(pixely)
    conf = max(probs) * 100
    status = "✓" if pred == cislo else "✗"
    print(f"    Vstup cislo {cislo} -> predikce: {pred} ({conf:.1f}%) {status}")
