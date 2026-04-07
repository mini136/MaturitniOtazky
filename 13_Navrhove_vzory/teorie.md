# Návrhové vzory — Creational, Structural, Behavioral

## Co je návrhový vzor?
Opakovaně použitelné řešení běžného problému v návrhu softwaru. Nejsou hotový kód, ale šablona.

## Creational Patterns (Vytvářecí)

### Singleton
Zajišťuje, že třída má **pouze jednu instanci**.
```
Použití: konfigurace, logger, DB connection pool
```

### Factory Method
Vytváření objektů **bez specifikace přesné třídy**. Rozhoduje se za běhu.
```
interface Tvar { void kresli(); }
class TvarFactory {
    static Tvar vytvor(String typ) { ... }
}
```

### Abstract Factory
Factory pro rodiny souvisejících objektů (např. Windows vs Mac UI komponenty).

### Builder
Postupné skládání složitého objektu krok za krokem.
```
Pizza p = new Pizza.Builder()
    .testo("tenke").syr("mozzarella").build();
```

### Prototype
Vytváření nových objektů klonováním existujícího (deep copy).

## Structural Patterns (Strukturální)

### Adapter
Převádí rozhraní jedné třídy na jiné, které klient očekává.
```
[Klient] → [Adapter] → [Starý systém]
```

### Decorator
**Dynamicky přidává** funkcionalitu objektu (bez dědičnosti).
```
Stream → BufferedStream → EncryptedStream
```

### Facade
Zjednodušené rozhraní pro složitý subsystém.
```
[Klient] → [Facade] → [SubsystémA, SubsystémB, SubsystémC]
```

### Proxy
Zástupce/prostředník k jinému objektu (cache, lazy loading, přístupová kontrola).

### Composite
Stromová struktura objektů (část-celek). Složené objekty se chovají stejně jako jednoduché.

## Behavioral Patterns (Vzory chování)

### Observer (Pozorovatel)
Jeden-k-mnoha závislost. Když se změní stav subjektu, notifikuje všechny pozorovatele.
```
[Subject] ── notify() ──→ [Observer1, Observer2, ...]
```

### Strategy
Definuje rodinu algoritmů a umožňuje je **zaměňovat** za běhu.
```
context.setStrategy(new BubbleSort())
context.setStrategy(new QuickSort())
```

### Command
Zapouzdřuje požadavek jako objekt → umožňuje undo, frontování, logování.

### Iterator
Sekvenční přístup k prvkům kolekce **bez odhalení vnitřní struktury**.

### State
Objekt mění chování podle svého **vnitřního stavu** (jako stavový automat).

### Template Method
Definuje kostru algoritmu v rodičovské třídě, detaily implementují potomci.

## Přehled

| Vzor | Kategorie | Klíčová myšlenka |
|------|-----------|-------------------|
| Singleton | Creational | Jedna instance |
| Factory | Creational | Vytváření bez specifikace třídy |
| Builder | Creational | Postupné skládání |
| Adapter | Structural | Převod rozhraní |
| Decorator | Structural | Přidání funkcionality |
| Facade | Structural | Zjednodušení |
| Observer | Behavioral | Notifikace změn |
| Strategy | Behavioral | Záměnné algoritmy |
| Iterator | Behavioral | Procházení kolekce |
