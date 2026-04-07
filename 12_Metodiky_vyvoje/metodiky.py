"""
Metodiky vyvoje - simulace Scrum sprintu a Kanban tabule
(Tato otazka je prevazne teoreticka, ale ukazeme jednoduchy simulator)
"""
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import random

# ============================================================
#  KANBAN TABULE
# ============================================================
print("=== Kanban Tabule ===\n")

class Stav(Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    REVIEW = "Review"
    DONE = "Done"

@dataclass
class Ukol:
    nazev: str
    priorita: int  # 1=nejvyssi
    stav: Stav = Stav.TODO
    prirazeno: str = ""

class KanbanTabule:
    def __init__(self, wip_limit=3):
        self.ukoly = []
        self.wip_limit = wip_limit  # max rozpracovanych

    def pridej_ukol(self, nazev, priorita):
        self.ukoly.append(Ukol(nazev=nazev, priorita=priorita))

    def presun(self, nazev, novy_stav, osoba=""):
        # WIP limit kontrola
        if novy_stav == Stav.IN_PROGRESS:
            wip = sum(1 for u in self.ukoly if u.stav == Stav.IN_PROGRESS)
            if wip >= self.wip_limit:
                print(f"  ! WIP limit ({self.wip_limit}) dosezen, nelze vzit dalsi ukol!")
                return

        for u in self.ukoly:
            if u.nazev == nazev:
                u.stav = novy_stav
                u.prirazeno = osoba
                print(f"  '{nazev}' -> {novy_stav.value}" + (f" ({osoba})" if osoba else ""))
                return

    def zobraz(self):
        print("\n┌─────────────────────────────────────────────────────┐")
        print("│                  KANBAN TABULE                      │")
        print("├────────────┬────────────┬──────────┬────────────────┤")
        print("│  To Do     │ In Progress│  Review  │     Done       │")
        print("├────────────┼────────────┼──────────┼────────────────┤")

        for stav in Stav:
            ukoly_ve_stavu = [u for u in self.ukoly if u.stav == stav]
            if ukoly_ve_stavu:
                for u in ukoly_ve_stavu:
                    print(f"  [{stav.value}] {u.nazev} (P{u.priorita})" +
                          (f" - {u.prirazeno}" if u.prirazeno else ""))
        print("└─────────────────────────────────────────────────────┘")


tabule = KanbanTabule(wip_limit=2)
tabule.pridej_ukol("Login formular", 1)
tabule.pridej_ukol("REST API", 1)
tabule.pridej_ukol("Unit testy", 2)
tabule.pridej_ukol("Dokumentace", 3)
tabule.pridej_ukol("CI/CD pipeline", 2)

print("Pocatecni stav:")
tabule.zobraz()

print("\nPrubeh prace:")
tabule.presun("Login formular", Stav.IN_PROGRESS, "Alice")
tabule.presun("REST API", Stav.IN_PROGRESS, "Bob")
tabule.presun("Unit testy", Stav.IN_PROGRESS, "Charlie")  # WIP limit!
tabule.presun("Login formular", Stav.REVIEW, "Alice")
tabule.presun("Unit testy", Stav.IN_PROGRESS, "Charlie")  # ted uz jde
tabule.presun("Login formular", Stav.DONE)
tabule.presun("REST API", Stav.REVIEW, "Bob")

tabule.zobraz()


# ============================================================
#  SCRUM SPRINT SIMULACE
# ============================================================
print("\n\n=== Scrum Sprint Simulace ===\n")

@dataclass
class UserStory:
    nazev: str
    story_points: int
    hotovo: bool = False

@dataclass
class Sprint:
    cislo: int
    kapacita: int  # story pointu
    stories: list = field(default_factory=list)

    @property
    def celkem_bodu(self):
        return sum(s.story_points for s in self.stories)

    @property
    def hotovo_bodu(self):
        return sum(s.story_points for s in self.stories if s.hotovo)

    def pridej_story(self, story):
        if self.celkem_bodu + story.story_points <= self.kapacita:
            self.stories.append(story)
            return True
        return False

# Product Backlog
backlog = [
    UserStory("Jako uzivatel chci se prihlasit", 5),
    UserStory("Jako uzivatel chci videt profil", 3),
    UserStory("Jako admin chci spravovat uzivatele", 8),
    UserStory("Jako uzivatel chci resetovat heslo", 3),
    UserStory("Jako uzivatel chci vyhledavat", 5),
    UserStory("Jako admin chci videt statistiky", 8),
    UserStory("Jako uzivatel chci filtrovat vysledky", 3),
]

print("Product Backlog:")
for i, s in enumerate(backlog, 1):
    print(f"  {i}. [{s.story_points}SP] {s.nazev}")

# Sprint planning
sprint = Sprint(cislo=1, kapacita=15)
print(f"\nSprint {sprint.cislo} (kapacita: {sprint.kapacita} SP)")
print("Sprint Planning:")

zbyvajici = list(backlog)
for story in zbyvajici[:]:
    if sprint.pridej_story(story):
        print(f"  + Pridano: {story.nazev} ({story.story_points}SP)")
        zbyvajici.remove(story)
    else:
        print(f"  - Nevejde se: {story.nazev} ({story.story_points}SP)")

# Simulace sprintu
print(f"\nSprint {sprint.cislo} probiha...")
for story in sprint.stories:
    # Simulace - nahodne dokonceni
    if random.random() < 0.8:
        story.hotovo = True
        print(f"  ✓ Dokonceno: {story.nazev}")
    else:
        print(f"  ✗ Nedokonceno: {story.nazev}")

# Sprint Review
print(f"\n--- Sprint {sprint.cislo} Review ---")
print(f"Velocity: {sprint.hotovo_bodu}/{sprint.celkem_bodu} SP")
print(f"Dokonceni: {sprint.hotovo_bodu/sprint.celkem_bodu*100:.0f}%")

nedokoncene = [s for s in sprint.stories if not s.hotovo]
if nedokoncene:
    print("Nedokoncene stories se vraci do backlogu:")
    for s in nedokoncene:
        print(f"  - {s.nazev}")
