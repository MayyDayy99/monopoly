# Integrációs Protokoll

## Általános szabályok
- **Reszponzivitás**: Kötelező `viewBox="0 0 X Y"`.
- **Rugalmasság**: `width` és `height` legyen CSS-ből vezérelhető.

## React Környezet
- Alakítsd át az SVG-t újrahasznosítható komponenssé.
- Példa:
  ```jsx
  const DroneIcon = ({ size = "2rem", color = "#c7fe1b", isAnimating = false }) => (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {/* SVG tartalom */}
    </svg>
  );
  ```

## HTML/JS Környezet
- Biztosíts tiszta HTML blokkot.
- Írd meg a JS logikát a pozicionáláshoz (pl. transzformációk X-Y koordinátákra).

## Izoláció
- Használj `position: absolute` vagy wrapper DIV-eket a tokenekhez.
- Az SVG beillesztése soha nem törheti meg a meglévő elrendezést (flex/grid).
