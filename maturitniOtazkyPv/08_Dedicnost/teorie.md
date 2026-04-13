# Dědičnost, Method Overriding, Function Overloading

## Dědičnost (Inheritance)

Mechanismus, kdy třída (potomek/child) **přebírá vlastnosti a metody** z jiné třídy (rodič/parent).

```
       [Zivocich]          ← rodičovská třída (base/super)
       /         \
  [Pes]         [Kocka]    ← potomci (derived/sub)
    |
 [Husky]                   ← víceúrovňová dědičnost
```

### Typy dědičnosti:
- **Jednoúrovňová** — Child dědí z Parent
- **Víceúrovňová** — Child → Parent → Grandparent
- **Hierarchická** — více potomků z jednoho rodiče
- **Vícenásobná** — dědí z více rodičů (Python ano, Java/C# ne → používají interfaces)

### Klíčová slova:
| | C# | Java | Python |
|-|-----|------|--------|
| Dědičnost | `: Base` | `extends Base` | `class Child(Base):` |
| Volání rodiče | `base.Metoda()` | `super.metoda()` | `super().metoda()` |
| Zákaz dědění | `sealed class` | `final class` | — |

## Method Overriding (přepisování metod)

Potomek **přepíše** implementaci metody rodiče. Stejný název, stejné parametry.

```java
class Zivocich {
    void zvuk() { System.out.println("..."); }
}
class Pes extends Zivocich {
    @Override
    void zvuk() { System.out.println("Haf!"); }  // override
}
```

### Pravidla:
- Metoda musí mít **stejnou signaturu** (název + parametry)
- V C#: rodičovská metoda musí být `virtual`, potomek `override`
- V Java: anotace `@Override`
- **Polymorfismus:** volá se metoda podle skutečného typu objektu (runtime)

```csharp
Zivocich z = new Pes();  // deklarovaný typ: Zivocich, skutečný: Pes
z.Zvuk();                // volá se Pes.Zvuk() — polymorfismus!
```

## Function Overloading (přetěžování metod)

Více metod se **stejným názvem** ale **různými parametry** (počet, typy).

```java
class Kalkulacka {
    int secti(int a, int b) { return a + b; }
    double secti(double a, double b) { return a + b; }
    int secti(int a, int b, int c) { return a + b + c; }
}
```

### Pravidla:
- Musí se lišit **počtem nebo typem** parametrů
- Návratový typ sám o sobě nestačí k rozlišení
- Rozhoduje se v **compile-time** (statický polymorfismus)
- Python nepodporuje nativně (lze simulovat `*args`)

## Overriding vs Overloading

| | Overriding | Overloading |
|-|-----------|-------------|
| Co | Stejná signatura, jiná implementace | Stejný název, jiné parametry |
| Kde | Dědičnost (potomek) | Stejná třída |
| Kdy | Runtime (dynamický polymorfismus) | Compile-time (statický) |
| Klíčová slova | virtual/override, @Override | — |

## Abstraktní třídy a rozhraní

- **Abstraktní třída:** nelze vytvořit instanci, může mít abstraktní metody (bez implementace)
- **Interface:** pouze deklarace metod, žádná implementace (C# 8+ může mít default)
- Třída může implementovat **více interfaces** ale dědit jen z **jedné třídy**
