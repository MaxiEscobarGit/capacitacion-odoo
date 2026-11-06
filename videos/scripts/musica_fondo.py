"""Genera una pista instrumental suave (libre de derechos) para usar de fondo en los videos.

Uso: python3 musica_fondo.py salida.wav [segundos]
Progresión C - G - Am - F con pad, bajo y un arpegio tranquilo a ~92 BPM.
"""
import array
import math
import random
import sys
import wave

SR = 22050
out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 180.0
n = int(SR * dur)
buf = array.array("f", [0.0]) * n

BPM = 92
beat = 60 / BPM
bar = 4 * beat
note = lambda m: 440 * 2 ** ((m - 69) / 12)
# acordes (notas MIDI): C, G, Am, F
chords = [[60, 64, 67], [55, 59, 62, 67], [57, 60, 64], [53, 57, 60, 65]]
bass = [36, 43, 45, 41]


def add_tone(start, length, freq, amp, attack, release, harmonics=(1.0,), vibrato=0.0):
    s0 = int(start * SR)
    ln = int(length * SR)
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    ph = random.random() * 2 * math.pi
    for i in range(ln):
        k = s0 + i
        if k >= n:
            break
        if i < a:
            env = i / a
        elif i > ln - r:
            env = max(0.0, (ln - i) / r)
        else:
            env = 1.0
        t = i / SR
        f = freq * (1 + vibrato * math.sin(2 * math.pi * 4.5 * t))
        v = 0.0
        for h, ha in enumerate(harmonics, start=1):
            v += ha * math.sin(2 * math.pi * f * h * t + ph)
        buf[k] += amp * env * v


random.seed(7)
t = 0.0
i = 0
while t < dur:
    ch = chords[i % 4]
    # pad suave
    for m in ch:
        add_tone(t, bar + 0.6, note(m), 0.05, 1.2, 1.4, (1.0, 0.25), vibrato=0.002)
    # bajo
    add_tone(t, bar, note(bass[i % 4]), 0.09, 0.05, 0.6, (1.0, 0.3))
    # arpegio (corcheas) con caída rápida, tipo piano eléctrico
    arp = ch + [ch[1] + 12, ch[0] + 12, ch[2], ch[1], ch[0] + 12]
    for j in range(8):
        add_tone(t + j * beat / 2, beat * 1.2, note(arp[j % len(arp)] + 12), 0.035, 0.005, beat * 1.1, (1.0, 0.15, 0.05))
    t += bar
    i += 1

peak = max(abs(x) for x in buf) or 1.0
pcm = array.array("h", (int(max(-1, min(1, x / peak * 0.8)) * 32767) for x in buf))
with wave.open(out, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{out}: {dur:.0f}s")
