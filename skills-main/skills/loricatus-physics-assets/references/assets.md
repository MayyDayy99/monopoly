# Asset Pipeline és Library

## Szeparáció (Separation of Concerns)
A bábuk kódját szigorúan le kell választani a játéktábla logikájáról.

### Könyvtárszerkezet
- Hely: `src/components/tokens/` vagy moduláris token fájl.
- Minden bábu (Drón, Szkenner, Robotkutya) független React komponens legyen.

### Komponens Szabályok
- Tartalmazza a belső SMIL/CSS animációkat (pl. pörgő propeller, villogó LED).
- **TILOS**: Nem tartalmazhat pozicionálási logikát (abszolút koordinátákat, eltolásokat).
- Legyen rugalmas a méretezése (props: `size`).
