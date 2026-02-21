# Fizikai Motor és Mozgás

## Overlay Architecture
A bábuk nem a tábla celláiban (DOM-ban) laknak.

1. **#tokens-layer**: Hozz létre egy láthatatlan réteget a tábla felett (magas Z-index).
2. **Abszolút Elhelyezés**: Minden bábu ebben a rétegben van, kezdetben `top: 0, left: 0` pozícióval.

## Koordináta Számítás
Amikor egy bábu új mezőre lép (index 0-39):
1. Keresd meg a célmező DOM elemét az index alapján (pl. `#space-{index}`).
2. Használd a `getBoundingClientRect()` metódust:
   ```javascript
   const rect = spaceElement.getBoundingClientRect();
   const centerX = rect.left + rect.width / 2;
   const centerY = rect.top + rect.height / 2;
   ```

## Hardveres Gyorsítás
A mozgáshoz KIZÁRÓLAG a CSS `transform` tulajdonságát használd:
- **Tilos**: `top`, `left` animálása.
- **Ajánlott**: `transform: translate(calcX, calcY)`.
- **Átmenet**: `transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)`.
