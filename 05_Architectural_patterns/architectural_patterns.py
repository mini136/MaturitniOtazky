"""
Architectural Patterns - jednoduche ukazky MVC a Client/Server
"""

# ============================================================
#  MVC PATTERN
# ============================================================
print("=== MVC Pattern - Spravce studentu ===\n")

# --- MODEL ---
class StudentModel:
    """Spravuje data - business logika"""
    def __init__(self):
        self._studenti = {}

    def pridej(self, id, jmeno, znamka):
        self._studenti[id] = {"jmeno": jmeno, "znamka": znamka}

    def odeber(self, id):
        return self._studenti.pop(id, None)

    def najdi(self, id):
        return self._studenti.get(id)

    def vsichni(self):
        return dict(self._studenti)

    def prumer(self):
        if not self._studenti:
            return 0
        return sum(s["znamka"] for s in self._studenti.values()) / len(self._studenti)


# --- VIEW ---
class StudentView:
    """Zobrazuje data uzivateli"""
    def zobraz_studenta(self, id, data):
        print(f"  [{id}] {data['jmeno']} - znamka: {data['znamka']}")

    def zobraz_vsechny(self, studenti):
        if not studenti:
            print("  Zadni studenti")
            return
        for id, data in studenti.items():
            self.zobraz_studenta(id, data)

    def zobraz_prumer(self, prumer):
        print(f"  Prumerny prospech: {prumer:.2f}")

    def zobraz_zpravu(self, zprava):
        print(f"  >> {zprava}")


# --- CONTROLLER ---
class StudentController:
    """Zpracovava vstupy, propojuje Model a View"""
    def __init__(self, model, view):
        self.model = model
        self.view = view

    def pridej_studenta(self, id, jmeno, znamka):
        self.model.pridej(id, jmeno, znamka)
        self.view.zobraz_zpravu(f"Student {jmeno} pridan")

    def odeber_studenta(self, id):
        data = self.model.odeber(id)
        if data:
            self.view.zobraz_zpravu(f"Student {data['jmeno']} odebran")
        else:
            self.view.zobraz_zpravu(f"Student {id} nenalezen")

    def zobraz_vsechny(self):
        studenti = self.model.vsichni()
        self.view.zobraz_vsechny(studenti)

    def zobraz_prumer(self):
        self.view.zobraz_prumer(self.model.prumer())


# Pouziti MVC
model = StudentModel()
view = StudentView()
ctrl = StudentController(model, view)

ctrl.pridej_studenta(1, "Alice", 1)
ctrl.pridej_studenta(2, "Bob", 3)
ctrl.pridej_studenta(3, "Charlie", 2)

print("\nVsichni studenti:")
ctrl.zobraz_vsechny()
ctrl.zobraz_prumer()

ctrl.odeber_studenta(2)
print("\nPo odebreani:")
ctrl.zobraz_vsechny()


# ============================================================
#  CLIENT / SERVER (jednoducha simulace)
# ============================================================
print("\n\n=== Client/Server simulace ===\n")

import threading
import socket
import time

def server_func():
    """Jednoduchy TCP server"""
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(('127.0.0.1', 65432))
    srv.listen(1)
    srv.settimeout(5)
    print("[Server] Cekam na spojeni...")

    try:
        conn, addr = srv.accept()
        print(f"[Server] Klient pripojen: {addr}")
        data = conn.recv(1024).decode()
        print(f"[Server] Prijato: {data}")
        odpoved = f"Echo: {data.upper()}"
        conn.sendall(odpoved.encode())
        conn.close()
    except socket.timeout:
        print("[Server] Timeout")
    finally:
        srv.close()

def client_func():
    """Jednoduchy TCP klient"""
    time.sleep(0.5)
    klient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    klient.connect(('127.0.0.1', 65432))
    zprava = "Ahoj servere!"
    print(f"[Klient] Odesilam: {zprava}")
    klient.sendall(zprava.encode())
    odpoved = klient.recv(1024).decode()
    print(f"[Klient] Odpoved: {odpoved}")
    klient.close()

# Spustime server a klient v ruznych vlaknech
t_srv = threading.Thread(target=server_func)
t_cli = threading.Thread(target=client_func)

t_srv.start()
t_cli.start()

t_srv.join()
t_cli.join()
print("Hotovo!")
