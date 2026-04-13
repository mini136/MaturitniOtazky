# Maturitni otazky - backend (MySQL)

Tento backend poskytuje sdilene komentare pro vsechny otazky.

## 1) Priprava databaze

1. Spust MySQL server.
2. Importuj schema:

```sql
SOURCE schema.sql;
```

Nebo z terminalu:

```powershell
mysql -u root -p < schema.sql
```

## 2) Konfigurace

1. V adresari `backend` vytvor soubor `.env` podle `.env.example`.
2. Vypln prihlaseni do MySQL.

## 3) Instalace a spusteni

```powershell
cd backend
npm install
npm start
```

Backend poběží na `http://localhost:3000` a servíruje i statické HTML soubory z nadřazené složky.

## 4) Pouziti

- Otevri `http://localhost:3000/index.html`
- Vyber otázku a použij sekci `Komentare k otazce`.
- Komentáře budou sdílené pro všechny, kdo používají stejný backend a DB.

## API

- `GET /api/health`
- `GET /api/comments?question=<path>`
- `POST /api/comments`

### POST payload

```json
{
  "questionPath": "maturitniOtazkyPv_html/01_Sprava_pameti.html",
  "nick": "Pepa",
  "email": "pepa@example.com",
  "kind": "chyba",
  "message": "V casti X chybi priklad"
}
```
