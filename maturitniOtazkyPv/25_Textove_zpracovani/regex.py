"""
Zpracovani textu a regularni vyrazy
"""
import re

# ============================================================
#  ZAKLADNI OPERACE S RETEZCI
# ============================================================
print("=== Zakladni operace ===")

text = "  Hello, World! Python je super jazyk.  "

print(f"  strip():     '{text.strip()}'")
print(f"  upper():     '{text.strip().upper()}'")
print(f"  lower():     '{text.strip().lower()}'")
print(f"  replace():   '{text.strip().replace('Python', 'Java')}'")
print(f"  split():     {text.strip().split()}")
print(f"  find('World'): {text.find('World')}")
print(f"  count('o'):  {text.count('o')}")
print(f"  startswith: {text.strip().startswith('Hello')}")

# Join
slova = ["Python", "je", "super"]
print(f"  join():      '{' '.join(slova)}'")

# F-string formatovani
jmeno, vek = "Alice", 20
print(f"  f-string:    '{jmeno} ma {vek} let'")
print(f"  zarovnani:   '{jmeno:>10}' '{vek:<5}'")
print(f"  cislo:       '{3.14159:.2f}'")


# ============================================================
#  REGULARNI VYRAZY - ZAKLADY
# ============================================================
print("\n=== Regularni vyrazy - zaklady ===")

text = "Muj email je alice@example.com a telefonni cislo 123-456-789"

# re.search - prvni vyskyt
match = re.search(r'\d{3}-\d{3}-\d{3}', text)
if match:
    print(f"  Telefon: {match.group()} (pozice {match.start()}-{match.end()})")

# re.findall - vsechny vyskyty
cisla = re.findall(r'\d+', text)
print(f"  Vsechna cisla: {cisla}")

# re.match - od zacatku
print(f"  match('Muj'): {bool(re.match(r'Muj', text))}")
print(f"  match('email'): {bool(re.match(r'email', text))}")  # False - neni na zacatku


# ============================================================
#  RE.SUB - NAHRAZOVANI
# ============================================================
print("\n=== re.sub - nahrazovani ===")

# Cenzura cisel
text = "Moje heslo je 12345 a PIN 9876"
cenzurovany = re.sub(r'\d', '*', text)
print(f"  Cenzura: {cenzurovany}")

# Formatovani data
datum = "2024-01-15"
cesky = re.sub(r'(\d{4})-(\d{2})-(\d{2})', r'\3.\2.\1', datum)
print(f"  Datum: {datum} -> {cesky}")

# Odstraneni HTML tagu
html = "<h1>Nadpis</h1><p>Text <b>tucny</b></p>"
cisty = re.sub(r'<[^>]+>', '', html)
print(f"  HTML: {html}")
print(f"  Cisty: {cisty}")


# ============================================================
#  SKUPINY (GROUPS)
# ============================================================
print("\n=== Skupiny ===")

# Pojmenovane skupiny
text = "Jan Novak, narozen 15.03.1995, bydliste Praha"
pattern = r'(?P<jmeno>\w+ \w+), narozen (?P<datum>\d{2}\.\d{2}\.\d{4}), bydliste (?P<mesto>\w+)'

match = re.search(pattern, text)
if match:
    print(f"  Jmeno: {match.group('jmeno')}")
    print(f"  Datum: {match.group('datum')}")
    print(f"  Mesto: {match.group('mesto')}")
    print(f"  Vsechny skupiny: {match.groupdict()}")


# ============================================================
#  VALIDACE
# ============================================================
print("\n=== Validace pomoci regex ===")

def validuj_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validuj_telefon(telefon):
    pattern = r'^(\+420\s?)?(\d{3}[\s-]?){3}$'
    return bool(re.match(pattern, telefon))

def validuj_heslo(heslo):
    """Min 8 znaku, velke pismeno, male pismeno, cislo, specialni znak"""
    checks = [
        (len(heslo) >= 8, "min 8 znaku"),
        (bool(re.search(r'[A-Z]', heslo)), "velke pismeno"),
        (bool(re.search(r'[a-z]', heslo)), "male pismeno"),
        (bool(re.search(r'\d', heslo)), "cislo"),
        (bool(re.search(r'[!@#$%^&*]', heslo)), "specialni znak"),
    ]
    chyby = [msg for ok, msg in checks if not ok]
    return len(chyby) == 0, chyby

# Emaily
emaily = ["alice@example.com", "bob@", "test@test.cz", "@invalid", "a.b+c@d.co"]
for email in emaily:
    ok = validuj_email(email)
    print(f"  Email '{email}': {'OK' if ok else 'NEPLATNY'}")

# Hesla
print()
hesla = ["abc", "Password1!", "short1!", "NoSpecial1"]
for heslo in hesla:
    ok, chyby = validuj_heslo(heslo)
    status = "OK" if ok else f"CHYBI: {', '.join(chyby)}"
    print(f"  Heslo '{heslo}': {status}")


# ============================================================
#  GREEDY vs LAZY
# ============================================================
print("\n=== Greedy vs Lazy ===")

html = "<b>tucny</b> a <i>kurziva</i>"

greedy = re.findall(r'<.*>', html)
lazy = re.findall(r'<.*?>', html)

print(f"  Text: {html}")
print(f"  Greedy <.*>:  {greedy}")
print(f"  Lazy <.*?>:   {lazy}")


# ============================================================
#  TOKENIZER
# ============================================================
print("\n=== Jednoduchy tokenizer ===")

def tokenizuj(kod):
    """Jednoduchy tokenizer pro aritmeticke vyrazy"""
    token_vzory = [
        ('NUMBER',  r'\d+(\.\d+)?'),
        ('PLUS',    r'\+'),
        ('MINUS',   r'-'),
        ('STAR',    r'\*'),
        ('SLASH',   r'/'),
        ('LPAREN',  r'\('),
        ('RPAREN',  r'\)'),
        ('SPACE',   r'\s+'),
        ('IDENT',   r'[a-zA-Z_]\w*'),
    ]

    # Spojeni vsech vzoru do jednoho
    master = '|'.join(f'(?P<{nazev}>{vzor})' for nazev, vzor in token_vzory)
    tokeny = []

    for match in re.finditer(master, kod):
        typ = match.lastgroup
        hodnota = match.group()
        if typ != 'SPACE':
            tokeny.append((typ, hodnota))

    return tokeny

vyraz = "x + 3.14 * (y - 2)"
print(f"  Vyraz: '{vyraz}'")
print(f"  Tokeny:")
for typ, hodnota in tokenizuj(vyraz):
    print(f"    {typ:8s}: '{hodnota}'")


# ============================================================
#  PARSOVANI LOGU
# ============================================================
print("\n=== Parsovani logu ===")

logy = """
2024-01-15 10:23:45 [INFO] Server started on port 8080
2024-01-15 10:24:01 [WARNING] Connection timeout from 192.168.1.100
2024-01-15 10:24:15 [ERROR] Database connection failed: timeout
2024-01-15 10:25:00 [INFO] User 'alice' logged in from 10.0.0.1
2024-01-15 10:25:30 [ERROR] File not found: /data/report.csv
"""

pattern = r'(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)'

print("  Analyza logu:")
statistiky = {}
for match in re.finditer(pattern, logy):
    datum, cas, uroven, zprava = match.groups()
    statistiky[uroven] = statistiky.get(uroven, 0) + 1

    if uroven in ("ERROR", "WARNING"):
        print(f"    [{uroven}] {cas}: {zprava}")

print(f"\n  Statistiky: {dict(statistiky)}")

# Extrakce IP adres
ip_adresy = re.findall(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', logy)
print(f"  IP adresy v logu: {ip_adresy}")


# ============================================================
#  KOMPILACE VZORU (PERFORMANCE)
# ============================================================
print("\n=== Kompilovany regex ===")

# Pro opeatovane pouziti - kompilovat!
email_re = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

emaily_test = ["a@b.com", "invalid", "test@x.cz"]
for e in emaily_test:
    print(f"  {e}: {bool(email_re.match(e))}")


# ============================================================
#  RE.SPLIT
# ============================================================
print("\n=== re.split ===")

text = "alice,bob;charlie  diana:eva"
# Rozdeleni podle vice oddelovacu najednou
vysledek = re.split(r'[,;\s:]+', text)
print(f"  Text: '{text}'")
print(f"  Split: {vysledek}")

# Rozdeleni vety na slova (bez interpunkce)
veta = "Ahoj, jak se mas? Ja se mam dobre!"
slova = re.findall(r'\b\w+\b', veta)
print(f"  Slova: {slova}")


# ============================================================
#  LOOKAHEAD A LOOKBEHIND
# ============================================================
print("\n=== Lookahead / Lookbehind ===")

text = "cena: 100 Kc, sleva: 20%, DPH 21%"

# Positive lookahead: cislo PRED '%'
procenta = re.findall(r'\d+(?=%)', text)
print(f"  Cisla pred %: {procenta}")

# Positive lookbehind: cislo ZA 'cena: '
cena = re.search(r'(?<=cena: )\d+', text)
print(f"  Cena: {cena.group() if cena else 'nenalezeno'}")

# Negative lookahead: cislo NENASLEDOVANE '%'
ne_procenta = re.findall(r'\d+(?![\d%])', text)
print(f"  Cisla bez %: {ne_procenta}")
