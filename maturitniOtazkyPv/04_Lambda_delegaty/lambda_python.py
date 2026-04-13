"""
Lambda, magicke metody, staticke metody v Pythonu
"""

# ============================================================
#  LAMBDA VYRAZY
# ============================================================
print("=== Lambda vyrazy ===")

# Zakladni lambda
square = lambda x: x ** 2
print(f"square(5) = {square(5)}")

# Lambda s map, filter, sorted
cisla = [3, 1, 4, 1, 5, 9, 2, 6]
print(f"Puvodni: {cisla}")
print(f"Dvojnasobek: {list(map(lambda x: x * 2, cisla))}")
print(f"Suda:        {list(filter(lambda x: x % 2 == 0, cisla))}")
print(f"Setridena:   {sorted(cisla, key=lambda x: -x)}")  # sestupne

# Lambda jako argument
def aplikuj(f, hodnota):
    return f(hodnota)

print(f"aplikuj(x->x+10, 5) = {aplikuj(lambda x: x + 10, 5)}")


# ============================================================
#  MAGICKE (SPECIALNI) METODY
# ============================================================
print("\n=== Magicke metody ===")

class Vektor:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        """Pro print() a str()"""
        return f"Vektor({self.x}, {self.y})"

    def __repr__(self):
        """Pro debug a repr()"""
        return f"Vektor(x={self.x}, y={self.y})"

    def __add__(self, other):
        """Operator +"""
        return Vektor(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        """Operator -"""
        return Vektor(self.x - other.x, self.y - other.y)

    def __mul__(self, skalar):
        """Operator * (nasobeni skalarem)"""
        return Vektor(self.x * skalar, self.y * skalar)

    def __eq__(self, other):
        """Operator =="""
        return self.x == other.x and self.y == other.y

    def __len__(self):
        """len() - vrati velikost (zaokrouhleno)"""
        import math
        return int(math.sqrt(self.x**2 + self.y**2))

    def __getitem__(self, index):
        """Indexovani: v[0], v[1]"""
        if index == 0: return self.x
        if index == 1: return self.y
        raise IndexError("Vektor ma jen 2 slozky")

    def __call__(self, skalar):
        """Volatelny objekt: v(3)"""
        return self * skalar

    def __iter__(self):
        """Iterace: for slov in v:"""
        yield self.x
        yield self.y

v1 = Vektor(3, 4)
v2 = Vektor(1, 2)

print(f"v1 = {v1}")
print(f"v1 + v2 = {v1 + v2}")
print(f"v1 - v2 = {v1 - v2}")
print(f"v1 * 3 = {v1 * 3}")
print(f"v1 == v2: {v1 == v2}")
print(f"len(v1) = {len(v1)}")
print(f"v1[0] = {v1[0]}, v1[1] = {v1[1]}")
print(f"v1(5) = {v1(5)}")  # __call__
print(f"list(v1) = {list(v1)}")  # __iter__


# === Context Manager (__enter__, __exit__) ===
print("\n=== Context Manager ===")

class MujSoubor:
    def __init__(self, jmeno, mod):
        self.jmeno = jmeno
        self.mod = mod

    def __enter__(self):
        print(f"Otviram {self.jmeno}")
        self.soubor = open(self.jmeno, self.mod)
        return self.soubor

    def __exit__(self, typ, hodnota, traceback):
        print(f"Zaviram {self.jmeno}")
        self.soubor.close()
        return False  # nepotlacujeme vyjimky

# with MujSoubor("test.txt", "w") as f:
#     f.write("Hello")
print("(Context manager pripraven - otevira/zavira soubor)")


# ============================================================
#  STATICKE A CLASSMETHOD
# ============================================================
print("\n=== Staticke metody ===")

class Kalkulacka:
    nazev = "SuperCalc"

    @staticmethod
    def secti(a, b):
        """Nema pristup k self ani cls"""
        return a + b

    @classmethod
    def info(cls):
        """Ma pristup ke tride (cls)"""
        return f"Kalkulacka: {cls.nazev}"

    def nasobeni(self, a, b):
        """Instancni metoda - ma pristup k self"""
        return a * b

print(f"Static: {Kalkulacka.secti(3, 5)}")
print(f"Classmethod: {Kalkulacka.info()}")
k = Kalkulacka()
print(f"Instancni: {k.nasobeni(3, 5)}")


# ============================================================
#  HIGHER-ORDER FUNKCE (ukazatel na funkci)
# ============================================================
print("\n=== Higher-order funkce ===")

def soucet(a, b): return a + b
def soucin(a, b): return a * b

def proved_operaci(operace, a, b):
    """Prijima funkci jako parametr (analogie delegatu)"""
    return operace(a, b)

print(f"proved_operaci(soucet, 3, 4) = {proved_operaci(soucet, 3, 4)}")
print(f"proved_operaci(soucin, 3, 4) = {proved_operaci(soucin, 3, 4)}")
print(f"proved_operaci(lambda, 3, 4) = {proved_operaci(lambda a, b: a ** b, 3, 4)}")

# Funkce jako navratova hodnota (closure)
def nasobicka(n):
    return lambda x: x * n

dvoj = nasobicka(2)
troj = nasobicka(3)
print(f"dvoj(5) = {dvoj(5)}")
print(f"troj(5) = {troj(5)}")
