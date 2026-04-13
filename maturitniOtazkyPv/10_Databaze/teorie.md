# Komunikace s databázovým systémem

## Připojení k databázi

### Přístupy:
1. **Přímé SQL** — raw dotazy (sqlite3, psycopg2, JDBC)
2. **ORM (Object-Relational Mapping)** — mapování objektů na tabulky (Entity Framework, Hibernate, SQLAlchemy)
3. **Micro ORM** — kompromis (Dapper)

### Connection String
Obsahuje: server, databáze, uživatel, heslo, port
```
Server=localhost;Database=mydb;User=admin;Password=xxx;
```

### Connection Pooling
- Opakované vytváření spojení je drahé
- Pool udržuje otevřená spojení a recykluje je
- Konfigurace: min/max connections, timeout

## Ukládání a načítání dat

### CRUD operace:
| Operace | SQL | HTTP |
|---------|-----|------|
| Create | `INSERT INTO` | POST |
| Read | `SELECT` | GET |
| Update | `UPDATE` | PUT/PATCH |
| Delete | `DELETE` | DELETE |

### Parametrizované dotazy (prevence SQL Injection):
```python
# SPATNE:
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# SPRAVNE:
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```

### Transakce:
```python
conn.execute("BEGIN")
try:
    conn.execute("UPDATE ucty SET zustatek = zustatek - 100 WHERE id = 1")
    conn.execute("UPDATE ucty SET zustatek = zustatek + 100 WHERE id = 2")
    conn.commit()
except:
    conn.rollback()
```

## ORM — Mapování entit

### Princip:
```
Třída (Class)  ←→  Tabulka (Table)
Vlastnost      ←→  Sloupec (Column)
Instance       ←→  Řádek (Row)
List<Entity>   ←→  Relace (Relationship)
```

### Výhody ORM:
- Pracujeme s objekty místo SQL
- Databázová nezávislost
- Automatická migrace schématu
- Lazy/Eager loading relací

### Nevýhody:
- Overhead, pomalejší než raw SQL
- N+1 problém (příliš mnoho dotazů)
- Složité dotazy jsou obtížné

### Příklady ORM:
| Jazyk | ORM |
|-------|-----|
| Python | SQLAlchemy, Django ORM |
| Java | Hibernate, JPA |
| C# | Entity Framework |
