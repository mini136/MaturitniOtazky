"""
Sitova komunikace - TCP server a klient + UDP ukazka
Spustte nejprve server, pak klient (nebo pouzijte threading jak nize)
"""
import socket
import threading
import time
import json

# ============================================================
#  TCP CHAT SERVER / KLIENT
# ============================================================
print("=== TCP Echo Server + Klient ===\n")

PORT_TCP = 65433

def tcp_server():
    """Jednoduchy TCP server - prijima zpravy a odpovida"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('127.0.0.1', PORT_TCP))
    server.listen(5)
    server.settimeout(5)
    print("[TCP Server] Nasloucham na portu", PORT_TCP)

    try:
        conn, addr = server.accept()
        print(f"[TCP Server] Klient pripojen: {addr}")

        while True:
            data = conn.recv(1024)
            if not data:
                break
            zprava = data.decode('utf-8')
            print(f"[TCP Server] Prijato: {zprava}")

            # Odpoved
            odpoved = f"ECHO: {zprava.upper()}"
            conn.sendall(odpoved.encode('utf-8'))

        conn.close()
    except socket.timeout:
        print("[TCP Server] Timeout - zadny klient")
    finally:
        server.close()
        print("[TCP Server] Ukoncen")

def tcp_klient():
    """TCP klient - odesle zpravy a prijme odpovedi"""
    time.sleep(0.3)  # pockame na server
    klient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    klient.connect(('127.0.0.1', PORT_TCP))
    print("[TCP Klient] Pripojen k serveru")

    zpravy = ["Ahoj servere!", "Jak se mas?", "Nashledanou"]
    for zprava in zpravy:
        klient.sendall(zprava.encode('utf-8'))
        odpoved = klient.recv(1024).decode('utf-8')
        print(f"[TCP Klient] Odeslano: '{zprava}' -> Odpoved: '{odpoved}'")
        time.sleep(0.1)

    klient.close()
    print("[TCP Klient] Odpojen")

# Spustime server a klient v ruznych vlaknech
t1 = threading.Thread(target=tcp_server)
t2 = threading.Thread(target=tcp_klient)
t1.start(); t2.start()
t1.join(); t2.join()


# ============================================================
#  UDP
# ============================================================
print("\n\n=== UDP Datagram ===\n")

PORT_UDP = 65434

def udp_server():
    """UDP server - bezstavovy, prijima datagramy"""
    server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server.bind(('127.0.0.1', PORT_UDP))
    server.settimeout(3)
    print("[UDP Server] Nasloucham")

    try:
        for _ in range(3):
            data, addr = server.recvfrom(1024)
            zprava = data.decode('utf-8')
            print(f"[UDP Server] Od {addr}: {zprava}")
            # Odpoved (nepotrebujeme accept - neni spojeni)
            server.sendto(f"ACK: {zprava}".encode('utf-8'), addr)
    except socket.timeout:
        pass
    finally:
        server.close()

def udp_klient():
    """UDP klient - odesila datagramy"""
    time.sleep(0.3)
    klient = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    for i in range(3):
        zprava = f"UDP zprava {i+1}"
        klient.sendto(zprava.encode('utf-8'), ('127.0.0.1', PORT_UDP))
        data, _ = klient.recvfrom(1024)
        print(f"[UDP Klient] Odpoved: {data.decode('utf-8')}")
        time.sleep(0.1)

    klient.close()

t1 = threading.Thread(target=udp_server)
t2 = threading.Thread(target=udp_klient)
t1.start(); t2.start()
t1.join(); t2.join()


# ============================================================
#  HTTP POZADAVEK rucne pres socket
# ============================================================
print("\n\n=== HTTP pozadavek pres raw socket ===\n")

def http_get(host, cesta="/"):
    """Rucni HTTP GET pozadavek pres TCP socket"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    try:
        sock.connect((host, 80))
        pozadavek = f"GET {cesta} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n"
        sock.sendall(pozadavek.encode())

        odpoved = b""
        while True:
            chunk = sock.recv(4096)
            if not chunk:
                break
            odpoved += chunk

        text = odpoved.decode('utf-8', errors='replace')
        # Zobrazime jen hlavicky (prvnich par radku)
        radky = text.split('\r\n')
        print(f"HTTP odpoved od {host}:")
        for radek in radky[:8]:
            print(f"  {radek}")
        print(f"  ... (celkem {len(text)} znaku)")
    except Exception as e:
        print(f"Chyba: {e}")
    finally:
        sock.close()

http_get("example.com")
