"""
Principy OOP - zapouzdreni, dedicnost, polymorfismus, abstrakce
Agregace vs Kompozice
"""
from abc import ABC, abstractmethod

# ============================================================
#  ZAPOUZDRENI (ENCAPSULATION)
# ============================================================
print("=== Zapouzdreni ===")

class BankovniUcet:
    def __init__(self, majitel, pocatecni_zustatek=0):
        self.majitel = majitel          # public
        self._cislo_uctu = "CZ123456"  # protected (konvence)
        self.__zustatek = pocatecni_zustatek  # private (name mangling)

    @property
    def zustatek(self):
        """Getter - read-only pristup k zustatku"""
        return self.__zustatek

    def vloz(self, castka):
        if castka <= 0:
            raise ValueError("Castka musi byt kladna")
        self.__zustatek += castka
        print(f"  Vlozeno {castka} Kc. Zustatek: {self.__zustatek} Kc")

    def vyber(self, castka):
        if castka > self.__zustatek:
            raise ValueError("Nedostatek prostredku!")
        self.__zustatek -= castka
        print(f"  Vybrano {castka} Kc. Zustatek: {self.__zustatek} Kc")

ucet = BankovniUcet("Alice", 1000)
ucet.vloz(500)
ucet.vyber(200)
print(f"  Zustatek (property): {ucet.zustatek}")
# ucet.__zustatek  # AttributeError - private!


# ============================================================
#  DEDICNOST + POLYMORFISMUS
# ============================================================
print("\n=== Dedicnost a Polymorfismus ===")

class Zivocich(ABC):
    def __init__(self, jmeno, vek):
        self.jmeno = jmeno
        self.vek = vek

    @abstractmethod
    def zvuk(self):
        pass

    @abstractmethod
    def pohyb(self):
        pass

    def __str__(self):
        return f"{self.__class__.__name__}('{self.jmeno}', {self.vek})"

class Pes(Zivocich):
    def __init__(self, jmeno, vek, rasa):
        super().__init__(jmeno, vek)  # volani konstruktoru rodice
        self.rasa = rasa

    def zvuk(self):
        return "Haf haf!"

    def pohyb(self):
        return "bezi"

    def aport(self):
        return f"{self.jmeno} prinasi micek"

class Kocka(Zivocich):
    def zvuk(self):
        return "Mnau!"

    def pohyb(self):
        return "plizi se"

class Ptak(Zivocich):
    def zvuk(self):
        return "Pip pip!"

    def pohyb(self):
        return "leti"

# Polymorfismus - stejne rozhrani, ruzne chovani
zvířata = [Pes("Rex", 5, "Labrador"), Kocka("Micka", 3), Ptak("Kiki", 1)]

for z in zvířata:
    print(f"  {z}: {z.zvuk()} - {z.pohyb()}")

# isinstance kontrola
pes = zvířata[0]
if isinstance(pes, Pes):
    print(f"  {pes.aport()}")


# ============================================================
#  AGREGACE vs KOMPOZICE
# ============================================================
print("\n=== Agregace vs Kompozice ===")

# --- AGREGACE (slaba vazba) ---
# Student existuje nezavisle na tride
class Student:
    def __init__(self, jmeno):
        self.jmeno = jmeno

    def __repr__(self):
        return f"Student('{self.jmeno}')"

class Trida:
    """AGREGACE - trida obsahuje studenty, ale nevlastni je"""
    def __init__(self, nazev):
        self.nazev = nazev
        self.studenti = []  # reference na existujici studenty

    def pridej(self, student):
        self.studenti.append(student)

    def __repr__(self):
        return f"Trida('{self.nazev}', {self.studenti})"

# Studenti existuji nezavisle
alice = Student("Alice")
bob = Student("Bob")

trida = Trida("4.A")
trida.pridej(alice)
trida.pridej(bob)
print(f"  Agregace: {trida}")

del trida  # smazeme tridu
print(f"  Po smazani tridy - Alice stale existuje: {alice}")  # studenti prezili!


# --- KOMPOZICE (silna vazba) ---
class Polozka:
    """Polozka neexistuje bez objednavky"""
    def __init__(self, nazev, cena):
        self.nazev = nazev
        self.cena = cena

    def __repr__(self):
        return f"{self.nazev}({self.cena} Kc)"

class Objednavka:
    """KOMPOZICE - objednavka vlastni polozky, polozky bez ni nemaji smysl"""
    _counter = 0

    def __init__(self, zakaznik):
        Objednavka._counter += 1
        self.cislo = Objednavka._counter
        self.zakaznik = zakaznik
        self._polozky = []  # polozky jsou vytvoreny a vlastneny objednavkou

    def pridej_polozku(self, nazev, cena):
        """Polozka se vytvari UVNITR objednavky - kompozice"""
        self._polozky.append(Polozka(nazev, cena))

    @property
    def celkova_cena(self):
        return sum(p.cena for p in self._polozky)

    def __repr__(self):
        return f"Objednavka #{self.cislo} ({self.zakaznik}): {self._polozky} = {self.celkova_cena} Kc"

    def __del__(self):
        print(f"  Objednavka #{self.cislo} zrusena - polozky smazany")

obj = Objednavka("Alice")
obj.pridej_polozku("Pizza", 200)
obj.pridej_polozku("Cola", 50)
obj.pridej_polozku("Tiramisu", 120)
print(f"  Kompozice: {obj}")

del obj  # smazani objednavky smaze i polozky


# ============================================================
#  SOLID - ukazky
# ============================================================
print("\n=== SOLID principy ===")

# S - Single Responsibility
class Validator:
    """Zodpoveda POUZE za validaci"""
    @staticmethod
    def validuj_email(email):
        return "@" in email and "." in email

class EmailSender:
    """Zodpoveda POUZE za odesilani"""
    @staticmethod
    def odesli(email, zprava):
        print(f"  Odesilam '{zprava}' na {email}")

# O - Open/Closed (rozsireni bez modifikace)
class Sleva(ABC):
    @abstractmethod
    def vypocitej(self, cena): pass

class ProcentualniSleva(Sleva):
    def __init__(self, procent):
        self.procent = procent
    def vypocitej(self, cena):
        return cena * (1 - self.procent / 100)

class PevnaSleva(Sleva):
    def __init__(self, castka):
        self.castka = castka
    def vypocitej(self, cena):
        return max(0, cena - self.castka)

# Muzeme pridavat nove slevy bez zmeny existujiciho kodu
cena = 1000
print(f"  Puvodni cena: {cena}")
print(f"  20% sleva: {ProcentualniSleva(20).vypocitej(cena)}")
print(f"  Pevna 150: {PevnaSleva(150).vypocitej(cena)}")

# D - Dependency Inversion
class Platba(ABC):
    @abstractmethod
    def zaplat(self, castka): pass

class KartouPlatba(Platba):
    def zaplat(self, castka):
        print(f"  Placeno kartou: {castka} Kc")

class HotovostPlatba(Platba):
    def zaplat(self, castka):
        print(f"  Placeno hotove: {castka} Kc")

class Pokladna:
    def __init__(self, platebni_metoda: Platba):  # zavislost na abstrakci
        self.platba = platebni_metoda

    def uctuj(self, castka):
        self.platba.zaplat(castka)

Pokladna(KartouPlatba()).uctuj(500)
Pokladna(HotovostPlatba()).uctuj(300)
