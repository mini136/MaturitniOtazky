# Principy OOP, Agregace a Kompozice

## 4 pilíře OOP

### 1. Zapouzdření (Encapsulation)
- Skrytí vnitřního stavu objektu, přístup přes **metody**
- Modifikátory přístupu: `private`, `protected`, `public`
- Getter/Setter, Properties (C#)

```python
class Ucet:
    def __init__(self):
        self.__zustatek = 0  # private
    
    @property
    def zustatek(self):
        return self.__zustatek
    
    def vloz(self, castka):
        if castka > 0:
            self.__zustatek += castka
```

### 2. Dědičnost (Inheritance)
- Potomek přebírá vlastnosti a metody rodiče
- `class Pes(Zivocich):` / `class Pes extends Zivocich`
- Hierarchie tříd, znovupoužitelnost kódu

### 3. Polymorfismus
- Stejné rozhraní, **různé chování**
- Overriding — runtime polymorfismus (virtuální metody)
- Overloading — compile-time polymorfismus

```python
zvířata = [Pes(), Kocka(), Ptak()]
for z in zvířata:
    z.zvuk()  # každý má jiný zvuk
```

### 4. Abstrakce
- Skrytí složitosti, zobrazení jen relevantních informací
- Abstraktní třídy a rozhraní (interface)
- Uživatel nemusí znát implementaci

## Vztahy mezi objekty

### Asociace
Obecný vztah „zná" / „používá". Objekty existují nezávisle.
```
Ucitel ──── Student  (Učitel učí studenta)
```

### Agregace (has-a, slabá)
Celek **obsahuje** část, ale část může **existovat samostatně**.
```
Třída ◇── Student    (Student může existovat bez třídy)
Auto ◇── Motor       (Motor lze vymontovat)
```

### Kompozice (has-a, silná)
Celek **vlastní** část, část **nemůže existovat** bez celku.
```
Dům ◆── Místnost     (Místnost nemá smysl bez domu)
Objednávka ◆── Položka
```

### Porovnání:
| | Agregace | Kompozice |
|-|----------|-----------|
| Síla vazby | Slabá | Silná |
| Životní cyklus | Nezávislý | Závislý na celku |
| Zničení celku | Části přežijí | Části se zničí |
| Příklad | Auto ◇ Cestující | Auto ◆ Motor |

## SOLID principy

| Princip | Popis |
|---------|-------|
| **S** — Single Responsibility | Třída má jen jednu zodpovědnost |
| **O** — Open/Closed | Otevřená pro rozšíření, uzavřená pro modifikaci |
| **L** — Liskov Substitution | Potomek musí být použitelný místo rodiče |
| **I** — Interface Segregation | Mnoho malých rozhraní > jedno velké |
| **D** — Dependency Inversion | Závislost na abstrakci, ne na konkrétní třídě |

## Další koncepty

### Třída vs Objekt
- **Třída** = šablona/plán (blueprint)
- **Objekt** = instance třídy (konkrétní výskyt)

### Konstruktor a Destruktor
- Konstruktor: `__init__` (Python), `public MyClass()` (C#/Java)
- Destruktor: `__del__` (Python), `~MyClass()` (C#), finalizer (Java)
