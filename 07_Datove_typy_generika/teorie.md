# Datové typy, Generika, Výčtové typy, Struktury, Anotace, Operátory

## Datové typy

### Hodnotové (Value types)
Ukládají přímo hodnotu. V C#: `int, float, double, bool, char, struct, enum`

### Referenční (Reference types)
Ukládají odkaz na objekt na heapu. V C#: `class, string, array, interface, delegate`

### Primitivní typy:
| Typ | C# | Java | Python |
|-----|-----|------|--------|
| Celé číslo | `int` (32b), `long` (64b) | `int`, `long` | `int` (neomezené) |
| Desetinné | `float` (32b), `double` (64b) | `float`, `double` | `float` (64b) |
| Znak | `char` | `char` | `str` (1 znak) |
| Logická | `bool` | `boolean` | `bool` |
| Text | `string` | `String` | `str` |

## Generika (Generics)

Parametrizované typy — umožňují psát kód pro **libovolný typ**.

```csharp
// C#
class Seznam<T> {
    private T[] items;
    public void Pridej(T item) { ... }
}
var cisla = new Seznam<int>();
var texty = new Seznam<string>();
```

```java
// Java
class Box<T> {
    private T value;
    public T get() { return value; }
}
Box<Integer> box = new Box<>();
```

### Výhody:
- Typová bezpečnost v compile-time
- Bez nutnosti castování
- Znovupoužitelnost kódu

### Omezení generik (Constraints):
```csharp
class Repo<T> where T : class, ICloneable, new() { }
```

## Výčtové typy (Enum)

Pojmenované konstanty:

```csharp
enum Den { Pondeli, Utery, Streda, Ctvrtek, Patek, Sobota, Nedele }
```

```java
enum Barva { CERVENA, ZELENA, MODRA }
```

```python
from enum import Enum
class Barva(Enum):
    CERVENA = 1
    ZELENA = 2
```

## Struktury (Struct) — C#

- Value type (na stacku)
- Lehčí než class, vhodné pro malé datové kontejnery
- Nemůže dědit z jiné struct/class

```csharp
struct Bod { public int X, Y; }
```

## Anotace / Atributy

Metadata přidaná ke kódu:

- **Java:** `@Override, @Deprecated, @SuppressWarnings`
- **C#:** `[Obsolete], [Serializable], [HttpGet]`
- **Python:** Dekorátor `@staticmethod, @property` + type hints `def f(x: int) -> str`

## Operátory

### Typy:
- **Aritmetické:** `+, -, *, /, %, **`
- **Porovnávací:** `==, !=, <, >, <=, >=`
- **Logické:** `&&/and, ||/or, !/not`
- **Bitové:** `&, |, ^, ~, <<, >>`
- **Přiřazovací:** `=, +=, -=, *=`
- **Ternární:** `podminka ? ano : ne` (C#/Java), `ano if podminka else ne` (Python)
- **Null-check:** `?.` `??` `??=` (C#), `Optional` (Java)

### Přetěžování operátorů:
- C#: `public static Bod operator +(Bod a, Bod b)`
- Python: `__add__`, `__eq__`, `__lt__` (magické metody)
- Java: nepodporuje přetěžování operátorů
