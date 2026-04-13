"""
Navrhove vzory - Python ukazky: Singleton, Factory, Observer, Strategy, Decorator, Builder
"""
from abc import ABC, abstractmethod

# ============================================================
#  SINGLETON
# ============================================================
print("=== Singleton ===")

class Konfigurace:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.nastaveni = {}
        return cls._instance

    def set(self, klic, hodnota):
        self.nastaveni[klic] = hodnota

    def get(self, klic, default=None):
        return self.nastaveni.get(klic, default)

# Test - obe promenne odkazuji na stejny objekt
k1 = Konfigurace()
k1.set("jazyk", "cs")
k2 = Konfigurace()
print(f"k1 is k2: {k1 is k2}")
print(f"k2.get('jazyk'): {k2.get('jazyk')}")


# ============================================================
#  FACTORY METHOD
# ============================================================
print("\n=== Factory Method ===")

class Notifikace(ABC):
    @abstractmethod
    def odesli(self, zprava): pass

class EmailNotifikace(Notifikace):
    def odesli(self, zprava):
        print(f"  📧 Email: {zprava}")

class SMSNotifikace(Notifikace):
    def odesli(self, zprava):
        print(f"  📱 SMS: {zprava}")

class PushNotifikace(Notifikace):
    def odesli(self, zprava):
        print(f"  🔔 Push: {zprava}")

class NotifikaceFactory:
    """Factory - vytvari objekty podle typu"""
    _typy = {
        "email": EmailNotifikace,
        "sms": SMSNotifikace,
        "push": PushNotifikace
    }

    @staticmethod
    def vytvor(typ):
        trida = NotifikaceFactory._typy.get(typ)
        if trida is None:
            raise ValueError(f"Neznamy typ: {typ}")
        return trida()

for typ in ["email", "sms", "push"]:
    n = NotifikaceFactory.vytvor(typ)
    n.odesli(f"Ahoj z {typ}!")


# ============================================================
#  BUILDER
# ============================================================
print("\n=== Builder ===")

class Pizza:
    def __init__(self):
        self.testo = ""
        self.omacka = ""
        self.syr = ""
        self.priklohy = []

    def __str__(self):
        return f"Pizza({self.testo}, {self.omacka}, {self.syr}, {self.priklohy})"

class PizzaBuilder:
    def __init__(self):
        self._pizza = Pizza()

    def testo(self, typ):
        self._pizza.testo = typ
        return self  # umoznuje retezeni

    def omacka(self, typ):
        self._pizza.omacka = typ
        return self

    def syr(self, typ):
        self._pizza.syr = typ
        return self

    def pridej(self, priloha):
        self._pizza.priklohy.append(priloha)
        return self

    def build(self):
        return self._pizza

pizza = (PizzaBuilder()
    .testo("tenke")
    .omacka("rajcatova")
    .syr("mozzarella")
    .pridej("sunka")
    .pridej("olivy")
    .build())
print(f"  {pizza}")


# ============================================================
#  OBSERVER
# ============================================================
print("\n=== Observer ===")

class Udalost:
    """Subject - spravuje pozorovatele"""
    def __init__(self):
        self._pozorovatele = []

    def prihlasit(self, pozorovatel):
        self._pozorovatele.append(pozorovatel)

    def odhlasit(self, pozorovatel):
        self._pozorovatele.remove(pozorovatel)

    def notifikuj(self, data):
        for p in self._pozorovatele:
            p.aktualizuj(data)

class EmailLogger:
    def aktualizuj(self, data):
        print(f"  [EmailLogger] Novy uzivatel: {data}")

class StatistikaPocitadlo:
    def __init__(self):
        self.pocet = 0
    def aktualizuj(self, data):
        self.pocet += 1
        print(f"  [Statistika] Registrace #{self.pocet}")

class UvitaciZprava:
    def aktualizuj(self, data):
        print(f"  [Uvitaci] Vitej, {data}!")

# Pouziti
registrace = Udalost()
registrace.prihlasit(EmailLogger())
registrace.prihlasit(StatistikaPocitadlo())
registrace.prihlasit(UvitaciZprava())

registrace.notifikuj("Alice")
registrace.notifikuj("Bob")


# ============================================================
#  STRATEGY
# ============================================================
print("\n=== Strategy ===")

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data): pass

class BubbleSortStrategy(SortStrategy):
    def sort(self, data):
        d = data.copy()
        n = len(d)
        for i in range(n):
            for j in range(0, n-i-1):
                if d[j] > d[j+1]:
                    d[j], d[j+1] = d[j+1], d[j]
        print(f"  Bubble Sort: {d}")
        return d

class QuickSortStrategy(SortStrategy):
    def sort(self, data):
        if len(data) <= 1:
            return data
        pivot = data[len(data)//2]
        result = (self.sort([x for x in data if x < pivot]) +
                  [x for x in data if x == pivot] +
                  self.sort([x for x in data if x > pivot]))
        return result

class Sorter:
    def __init__(self, strategie):
        self._strategie = strategie

    def set_strategie(self, strategie):
        self._strategie = strategie

    def setrid(self, data):
        return self._strategie.sort(data)

data = [64, 34, 25, 12, 22]
sorter = Sorter(BubbleSortStrategy())
sorter.setrid(data)

sorter.set_strategie(QuickSortStrategy())
vysledek = sorter.setrid(data)
print(f"  Quick Sort: {vysledek}")


# ============================================================
#  DECORATOR
# ============================================================
print("\n=== Decorator ===")

class Napoj(ABC):
    @abstractmethod
    def popis(self): pass
    @abstractmethod
    def cena(self): pass

class Kava(Napoj):
    def popis(self): return "Kava"
    def cena(self): return 50

class NapojDekorator(Napoj):
    def __init__(self, napoj):
        self._napoj = napoj

class SMlekem(NapojDekorator):
    def popis(self): return self._napoj.popis() + " + mleko"
    def cena(self): return self._napoj.cena() + 10

class SSlehankou(NapojDekorator):
    def popis(self): return self._napoj.popis() + " + slehacka"
    def cena(self): return self._napoj.cena() + 15

class SCokoladou(NapojDekorator):
    def popis(self): return self._napoj.popis() + " + cokolada"
    def cena(self): return self._napoj.cena() + 20

# Postupne pridavame funkce (dekorace)
napoj = Kava()
print(f"  {napoj.popis()}: {napoj.cena()} Kc")

napoj = SMlekem(napoj)
print(f"  {napoj.popis()}: {napoj.cena()} Kc")

napoj = SSlehankou(napoj)
print(f"  {napoj.popis()}: {napoj.cena()} Kc")

napoj = SCokoladou(napoj)
print(f"  {napoj.popis()}: {napoj.cena()} Kc")
