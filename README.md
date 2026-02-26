# Monopoly by Loricatus

> **"Digitalizáld a múltat, építsd a jövőt!"**

Magyar Műemlékek 3D Digitalizációs Társasjáték — A klasszikus Monopoly modern, cyberpunk arculattal, Loricatus branding-gel, 40 valódi magyar műemlékkel és drón/szkenner témájú tokenekkel.

---

## Játék Leírása

A **Monopoly by Loricatus** egy böngészőben játszható digitális Monopoly-adaptáció, amely:

- **40 valódi magyar helyszínt** dolgoz fel (Zsámbéki Romtemplom, Halászbástya, Lánchíd, Andrássy Út, stb.)
- **Loricatus arculatú** tokeneket használ (DJI Avata drón, Matrice 30, Leica 3D szkenner, Mavic drón)
- **Technológia-témájú** vasútállomásokat tartalmaz (Fotogrammetria, 3D Lézerszkennelés, RTK Bemérés, Drón Térképezés)
- **Firebase multiplayert** támogat valós idejű szinkronizációval
- **AI botokat** kínál heurisztikus döntési logikával

---

## Funkciók

| Funkció | Részlet |
|---------|---------|
| Játékosok | 2–4 (helyi vagy online multiplayer) |
| AI Bot | Igen – heurisztikus stratégiával |
| Multiplayer | Firebase Realtime DB alapú |
| Tokenek | 4 egyedi SVG drón/szkenner token |
| Animációk | Framer Motion (kockadobás, mozgás, kártya, győzelem) |
| Hangeffektek | Web Audio API kész |
| Akadálymentesség | Colorblind mód, ARIA live, billentyűnavigáció |
| Mentés | LocalStorage automatikus mentés |
| Házszabályok | 5 kapcsolható háziszabály |
| PWA | Telepíthető, landscape-optimalizált |

---

## Technikai Stack

```
React 19.2       — UI framework
TypeScript 5.9   — Strict típusbiztonság
TailwindCSS 4.2  — Utility-first stílus
Framer Motion    — Animációk
Firebase 12.9    — Auth + Realtime multiplayer
Vite 7.3         — Build tool
Vitest 4.0       — Unit tesztek
```

---

## Gyors Start

```bash
# Klónozás
git clone https://github.com/MayyDayy99/monopoly.git
cd monopoly

# Függőségek telepítése
npm install

# Fejlesztői szerver indítása
npm run dev

# Tesztek futtatása
npm run test

# Production build
npm run build
```

---

## Tábla Helyszínek

### Barnák (Legolcsóbb)
- Zsámbéki Romtemplom
- Somogyvári Apátság

### Világoskékek
- Szigligeti Vár · Cseszneki Vár · Kinizsi Vár

### Rózsaszínek
- Festetics-kastély · Esterházy-kastély · Grassalkovich-kastély

### Narancssárgák
- Vajdahunyad Vára · Halászbástya · Andrássy Út

### Pirosos
- Országház · Budavári Palota · Hősök Tere

### Sárgák
- Dóm Tér · Tisza-tó Kilátó · Városháza

### Zöldek
- Puskás Stadion · Széchenyi Fürdő · Petőfi Park

### Sötétkékek (Legdrágábbak)
- Szabadság Tér · Lánchíd

### Technológiai állomások (Vasút)
- Fotogrammetria · 3D Lézerszkennelés · RTK Bemérés · Drón Térképezés

### Közművek
- Műholdas Kapcsolat · Szerverpark Csomópont

---

## Háziszabályok

- **Ingyenes Parkoló Jackpot** — Az adók a középső mezőn gyűlnek, a parkolós játékos elveszi
- **Kétszeres GO** — START átlépésekor duplán jár a fizetés
- **Dinamikus Jövedelemadó** — 10% a vagyonból vs. fix 200k
- **Börtönből nem kell bérleti díjat fizetni** — Jail védi a játékost
- **Gyors mód** — 2 véletlen ingatlannal indul mindenki

---

## Debug Mód

Fejlesztéshez: `Ctrl + Shift + D` megnyitja a cheat panelt (pénz hozzáadás, pozíció teleport, stb.)

---

## Licence

© Loricatus — Minden jog fenntartva.

---

*A játék a [Loricatus](https://loricatus.hu) 3D digitalizációs technológiáit mutatja be szórakoztató formában.*
