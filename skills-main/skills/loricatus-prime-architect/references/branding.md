# Branding és UI/UX Irányelvek

## Színpaletta (Dark Tech Mode)
- **Háttér**: Mélyfekete (`#0a0a0a`) vagy sötét antracit (`#111827`).
- **Rácsok/Keretek**: Halvány szürke (`#1f2937`).
- **Fő Akcentus / Neon**: Szigorúan a `#c7fe1b` színt használd:
  - `text-[#c7fe1b]`
  - `bg-[#c7fe1b]`
  - `border-[#c7fe1b]`
  - Glow effektekhez is ezt használd.

## Játékélmény (Game Feel)
1. **Célirányos Mozgás**: A bábuk teleportálása tilos. Használj `transform: translate` átmeneteket (min. 0.3s).
2. **Lebegő Tranzakciók**: Egyenlegváltozásnál zöld (+X) vagy piros (-X) szöveg száll fel a karakter fölött (1s fade out).
3. **Feszültségkeltés**: Kockadobásnál 600ms mesterséges késleltetés, amíg a kocka "pörög".
4. **3D Tér**: Kártyahúzásnál `rotateY(180deg)` CSS átfordulás a modal ablakokban.
5. **Bábuk**: Animált SVG grafikák (Drón, Szkenner, Robotkutya), NEM egyszerű körök.
