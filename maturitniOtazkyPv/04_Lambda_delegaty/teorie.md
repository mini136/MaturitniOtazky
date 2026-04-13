# Anonymní metody, speciální metody, statické metody, delegáty

## Lambda výrazy (anonymní metody)

Lambda = krátká anonymní funkce bez jména.

### Python:
```python
square = lambda x: x ** 2
nums = [1, 2, 3]
doubled = list(map(lambda x: x * 2, nums))
```

### C#:
```csharp
Func<int, int> square = x => x * x;
Action<string> print = s => Console.WriteLine(s);
list.Where(x => x > 5).Select(x => x * 2);
```

### Java:
```java
Function<Integer, Integer> square = x -> x * x;
list.stream().filter(x -> x > 5).map(x -> x * 2);
```

## Delegáty (C#)

Delegát = typově bezpečný **ukazatel na metodu**. Definuje signaturu metod, které může referencovat.

```csharp
delegate int Operace(int a, int b);
Operace soucet = (a, b) => a + b;
```

### Vestavěné delegáty:
- `Func<T, TResult>` — má návratovou hodnotu
- `Action<T>` — vrací void
- `Predicate<T>` — vrací bool

### Eventy
Eventy jsou postaveny nad delegáty — publisher/subscriber pattern.

## Speciální (magické) metody — Python

Metody s `__dvojitym_podtrzitkem__`:

| Metoda | Význam |
|--------|--------|
| `__init__` | Konstruktor |
| `__str__` | Konverze na string (pro uživatele) |
| `__repr__` | Konverze na string (pro programátora) |
| `__len__` | `len(obj)` |
| `__getitem__` | `obj[key]` |
| `__setitem__` | `obj[key] = val` |
| `__add__` | `obj + other` |
| `__eq__` | `obj == other` |
| `__lt__` | `obj < other` |
| `__iter__` | `for x in obj` |
| `__call__` | `obj()` — volatelný objekt |
| `__enter__/__exit__` | `with obj:` — context manager |

## Statické metody

- Patří **třídě**, ne instanci
- Nemají přístup k `self`/`this` (instanční data)
- Python: `@staticmethod`, `@classmethod`
- C#/Java: `static` keyword

```python
class Math:
    @staticmethod
    def add(a, b):
        return a + b

    @classmethod
    def info(cls):
        return cls.__name__
```
