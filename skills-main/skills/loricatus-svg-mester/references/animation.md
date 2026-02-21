# Animációs Szabályok

Az animációknak jelentéssel kell bírniuk (**Meaningful Motion**).

## Beépített SVG Animáció (SMIL)
Folyamatos háttéranimációkhoz használd a natív tageket:
- `<animate>`: Attribútumok változtatása.
- `<animateTransform>`: Forgatás, skálázás (pl. pörgő propeller).
- `<animateMotion>`: Útvonal menti mozgás.

## CSS Keyframes
Interakciókhoz (kattintás, ugrás):
- Generálj CSS osztályokat az SVG manipulálásához.
- Használj `@keyframes`-t a komplexebb mozgásokhoz.

## Minőség
- **Smoothness**: Mindig használj `ease-in-out` időzítést.
- **Teljesítmény**: Ne terheld túl a böngészőt túl sok szimultán animációval.
- **Vizuális visszajelzés**: A pörgő propeller, villogó LED vagy pásztázó lézer reprezentálja a működést.
