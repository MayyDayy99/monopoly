---
name: loricatus-physics-assets
description: Az eszközök (assets) kezeléséért és a fizikai mozgás motorjáért felelős skill a Loricatus-opoly játékban. Használd ezt a skillt a bábuk mozgása, az SVG asset könyvtár kezelése és a hardveresen gyorsított animációk implementálása során.
---

# Loricatus Fizikai Motor és Asset Kezelés

Ez a skill a "Loricatus-opoly" játék bábunival (tokenjeivel) és azok mozgásával kapcsolatos szigorú iparági standardokat rögzíti.

## Alapelvek

1. **Asset Library**: Szeparált SVG komponensek a renderelési ciklus hatékonyságáért.
2. **Overlay Architecture**: Láthatatlan réteg (#tokens-layer) a tábla felett a mozgáshoz.
3. **Hardveres Gyorsítás**: Kizárólag `transform: translate()` használata a mozgáshoz.
4. **Reszponzivitás**: Window resize események kezelése és automatikus újraszámolás.

## Munkafolyamat

Minden fizikai vagy asset jellegű fejlesztésnél kövesd az alábbi lépéseket:

1. **Asset Elhelyezés**: Ellenőrizd, hogy a bábu önálló komponens-e az `src/components/tokens/` mappában.
2. **Koordináta Számítás**: Használd a `getBoundingClientRect()` metódust a célmező középpontjának meghatározásához.
3. **Animáció Implementáció**: Alkalmazz cubic-bezier átmeneteket a sima mozgásért.

## Részletes Útmutatók

- **[Asset Pipeline és Library](references/assets.md)**: Komponensek szeparációja és felépítése.
- **[Fizikai Motor és Mozgás](references/movement.md)**: Koordináta-logika, Overlay réteg és hardveres gyorsítás.
- **[Eseménykezelés és Collision](references/physics.md)**: Resize kezelés és ütközéselkerülési eltolások.

## Védőkorlátok

- Tilos a `top` és `left` tulajdonságok animálása (Layout Thrashing elkerülése).
- Tilos az SVG kódokat közvetlenül a `Board` komponensbe ömleszteni.
- Mindig biztosíts automatikus újraszámolást ablak átméretezésekor.
