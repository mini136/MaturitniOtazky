"""
Testovani - unittest framework, TDD, mocking
Spusteni: python -m unittest testovani.py -v
"""
import unittest
from unittest.mock import Mock, patch, MagicMock

# ============================================================
#  TESTOVANY KOD
# ============================================================

class Kalkulacka:
    """Jednoducha kalkulacka pro demonstraci unit testu"""

    def secti(self, a, b):
        return a + b

    def odecti(self, a, b):
        return a - b

    def vynasob(self, a, b):
        return a * b

    def vydel(self, a, b):
        if b == 0:
            raise ZeroDivisionError("Nelze delit nulou!")
        return a / b

    def faktorial(self, n):
        if not isinstance(n, int) or n < 0:
            raise ValueError("Faktorial je definovan jen pro nezaporna cela cisla")
        if n <= 1:
            return 1
        return n * self.faktorial(n - 1)


class StudentManager:
    """Sprava studentu - pouziva externi DB (budeme mockovat)"""

    def __init__(self, databaze):
        self.db = databaze

    def pridej_studenta(self, jmeno, vek):
        if not jmeno or not jmeno.strip():
            raise ValueError("Jmeno nesmi byt prazdne")
        if vek < 15 or vek > 100:
            raise ValueError("Neplatny vek")
        return self.db.vloz({"jmeno": jmeno.strip(), "vek": vek})

    def najdi_studenta(self, jmeno):
        return self.db.najdi(jmeno)

    def prumer_veku(self):
        studenti = self.db.vsichni()
        if not studenti:
            return 0
        return sum(s["vek"] for s in studenti) / len(studenti)


# ============================================================
#  UNIT TESTY
# ============================================================

class TestKalkulacka(unittest.TestCase):
    """Testy pro tridu Kalkulacka - zakladni AAA pattern"""

    def setUp(self):
        """Priprava pred KAZDYM testem"""
        self.calc = Kalkulacka()

    def tearDown(self):
        """Uklid po KAZDYM testu"""
        pass  # zde neni co uklizet

    # --- Testy scitani ---
    def test_secti_kladna_cisla(self):
        # Arrange (v setUp)
        # Act
        vysledek = self.calc.secti(3, 5)
        # Assert
        self.assertEqual(vysledek, 8)

    def test_secti_zaporna(self):
        self.assertEqual(self.calc.secti(-3, -5), -8)

    def test_secti_nuly(self):
        self.assertEqual(self.calc.secti(0, 0), 0)

    def test_secti_desetinna(self):
        self.assertAlmostEqual(self.calc.secti(0.1, 0.2), 0.3, places=7)

    # --- Testy deleni ---
    def test_vydel_zakladni(self):
        self.assertEqual(self.calc.vydel(10, 2), 5)

    def test_vydel_nulou_vyhodi_vyjimku(self):
        with self.assertRaises(ZeroDivisionError):
            self.calc.vydel(10, 0)

    def test_vydel_nulou_zprava(self):
        with self.assertRaisesRegex(ZeroDivisionError, "nulou"):
            self.calc.vydel(10, 0)

    # --- Testy faktorial ---
    def test_faktorial_zakladni(self):
        self.assertEqual(self.calc.faktorial(5), 120)

    def test_faktorial_nula(self):
        self.assertEqual(self.calc.faktorial(0), 1)

    def test_faktorial_jedna(self):
        self.assertEqual(self.calc.faktorial(1), 1)

    def test_faktorial_zaporne_vyhodi_vyjimku(self):
        with self.assertRaises(ValueError):
            self.calc.faktorial(-1)

    def test_faktorial_desetinne_vyhodi_vyjimku(self):
        with self.assertRaises(ValueError):
            self.calc.faktorial(3.5)


class TestKalkulackaParametrizovane(unittest.TestCase):
    """Parametrizovane testy - vice vstupu"""

    def test_scitani_vice_hodnot(self):
        calc = Kalkulacka()
        testovaci_data = [
            (1, 1, 2),
            (0, 0, 0),
            (-1, 1, 0),
            (100, 200, 300),
            (-50, -50, -100),
        ]
        for a, b, ocekavany in testovaci_data:
            with self.subTest(a=a, b=b):
                self.assertEqual(calc.secti(a, b), ocekavany)


# ============================================================
#  MOCKING
# ============================================================

class TestStudentManagerMock(unittest.TestCase):
    """Testy s mockem databaze"""

    def setUp(self):
        # Mock databaze - neni potreba skutecna DB
        self.mock_db = Mock()
        self.manager = StudentManager(self.mock_db)

    def test_pridej_studenta_vola_db(self):
        """Overime ze se zavola db.vloz s correct daty"""
        self.mock_db.vloz.return_value = True

        vysledek = self.manager.pridej_studenta("Alice", 20)

        self.assertTrue(vysledek)
        self.mock_db.vloz.assert_called_once_with({"jmeno": "Alice", "vek": 20})

    def test_pridej_prazdne_jmeno(self):
        with self.assertRaises(ValueError):
            self.manager.pridej_studenta("", 20)
        # DB by se NEMELA volat
        self.mock_db.vloz.assert_not_called()

    def test_pridej_neplatny_vek(self):
        with self.assertRaises(ValueError):
            self.manager.pridej_studenta("Alice", 10)
        self.mock_db.vloz.assert_not_called()

    def test_prumer_veku(self):
        self.mock_db.vsichni.return_value = [
            {"jmeno": "Alice", "vek": 20},
            {"jmeno": "Bob", "vek": 22},
            {"jmeno": "Charlie", "vek": 24},
        ]

        prumer = self.manager.prumer_veku()

        self.assertEqual(prumer, 22.0)
        self.mock_db.vsichni.assert_called_once()

    def test_prumer_prazdna_db(self):
        self.mock_db.vsichni.return_value = []
        self.assertEqual(self.manager.prumer_veku(), 0)

    def test_najdi_studenta(self):
        self.mock_db.najdi.return_value = {"jmeno": "Alice", "vek": 20}

        student = self.manager.najdi_studenta("Alice")

        self.assertEqual(student["jmeno"], "Alice")
        self.mock_db.najdi.assert_called_with("Alice")


# ============================================================
#  ASSERTIONS PREHLED
# ============================================================

class TestAssertionsPrehled(unittest.TestCase):
    """Ukazka ruznych typu assertions"""

    def test_assertEqual(self):
        self.assertEqual(1 + 1, 2)

    def test_assertNotEqual(self):
        self.assertNotEqual(1, 2)

    def test_assertTrue_assertFalse(self):
        self.assertTrue(10 > 5)
        self.assertFalse(10 < 5)

    def test_assertIs(self):
        a = None
        self.assertIsNone(a)
        self.assertIsNotNone("neco")

    def test_assertIn(self):
        self.assertIn(3, [1, 2, 3])
        self.assertNotIn(4, [1, 2, 3])

    def test_assertIsInstance(self):
        self.assertIsInstance("ahoj", str)
        self.assertIsInstance(42, int)

    def test_assertAlmostEqual(self):
        self.assertAlmostEqual(0.1 + 0.2, 0.3, places=5)

    def test_assertGreater(self):
        self.assertGreater(10, 5)
        self.assertGreaterEqual(5, 5)
        self.assertLess(3, 5)


# ============================================================
#  SPUSTENI
# ============================================================

if __name__ == '__main__':
    # Spusteni s verbose vystupem
    unittest.main(verbosity=2)
