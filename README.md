# Exámenes de Conducción - Ley 109 (Cuba)

> Aplicación web estática para practicar el examen teórico de conducción en Cuba, basada en la **Ley 109 - Código de Seguridad Vial**.

---

## 🚀 Demo

Abrir `index.html` directamente en cualquier navegador (funciona con `file://`).  
Sin servidor, sin dependencias, sin instalación.

---

## 📁 Estructura del proyecto

```
/
├── index.html              # Punto de entrada (3 pantallas + modal)
├── style.css               # Diseño minimalista
├── app.js                  # Lógica completa de la app
├── preguntas.js            # 376 preguntas situacionales normales
├── preguntas_combo.js      # 20 preguntas combo (conteo de infracciones)
├── preguntas.json          # Fuente original (no usada directamente)
└── README.md               # Este archivo
```

---

## 🧠 Arquitectura

### Flujo de la app

```
┌─────────────┐
│   INICIO    │  ← Título, descripción, botón Comenzar
└──────┬──────┘
       │ click en "Comenzar"
       ▼
┌─────────────┐
│   EXAMEN    │  ← 20 preguntas en 4 páginas (5 c/u)
│             │     Navegación « Anterior · Siguiente »
│             │     Botón "Evaluar" en la última página
│             │     Botón "✕ Cerrar" con confirmación
└──────┬──────┘
       │ click en "Evaluar"
       ▼
┌─────────────┐
│ RESULTADOS  │  ← Nota (X/100), Aprobado/Suspendido
│             │     Desglose correcta vs tu respuesta
│             │     Botón "Nuevo Examen"
└─────────────┘
```

### Pantallas

| Pantalla | ID | Función |
|---|---|---|
| Inicio | `#screen-home` | Presentación, botón comenzar |
| Examen | `#screen-exam` | Preguntas paginadas, navegación |
| Resultados | `#screen-results` | Nota + feedback detallado |
| Modal | `#modal-close` | Confirmación al cerrar el examen |

### Navegación entre pantallas

- `show('home')` → Muestra inicio, oculta examen y resultados
- `show('exam')` → Muestra examen
- `show('results')` → Muestra resultados

---

## 🎯 Reglas de negocio

| Regla | Valor |
|---|---|
| Preguntas por examen | 20 |
| Preguntas normales | 16 (de `preguntas.js`) |
| Preguntas combo | 4 (de `preguntas_combo.js`) |
| Opciones por pregunta | 3 (A, B, C) |
| Opciones barajadas | Sí, aleatoriamente cada examen |
| Puntuación por pregunta | 5 puntos |
| Puntuación máxima | 100 |
| Aprobado | 70 puntos o más |

### Distribución de preguntas normales

| Tema | Libro | Cantidad |
|---|---|---|
| Uso de las vías | III | 202 |
| Educación vial y licencia | V | 44 |
| Glosario | — | 36 |
| Control técnico y registro | IV | 28 |
| Vialidad | II | 22 |
| Infracciones | VI | 17 |
| Comisiones de seguridad vial | VII | 17 |
| Parte general | I | 10 |

### Preguntas combo

20 preguntas situacionales donde se deben **contar infracciones** múltiples en una misma escena. Ejemplo:

> "Un conductor estaciona su auto en un puente, lleva a su hijo de 6 años en el asiento delantero, no usa el cinturón de seguridad y adelanta en una curva de visibilidad reducida. ¿Cuántas infracciones cometió?"
> → 4 infracciones

---

## 📦 Archivos de datos

### `preguntas.js`
```js
window.PREGUNTAS = [
  {
    "id": 1,
    "pregunta": "texto de la pregunta",
    "opciones": ["Opción A", "Opción B", "Opción C"],
    "correcta": 0,  // índice de la opción correcta (0, 1 o 2)
    "libro": "III"   // libro de la ley al que pertenece
  },
  ...
];
```

### `preguntas_combo.js`
```js
window.PREGUNTAS_COMBO = [
  {
    "id": 377,
    "pregunta": "texto situacional",
    "opciones": ["2", "3", "4"],
    "correcta": 2,  // 2 → "4"
    "libro": "Combo"
  },
  ...
];
```

### Formato de cada pregunta

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador único |
| `pregunta` | string | Enunciado situacional |
| `opciones` | string[] | 3 opciones de respuesta |
| `correcta` | number | Índice (0, 1, 2) de la respuesta correcta |
| `libro` | string | Libro de la Ley o "Combo" / "Glosario" |

---

## ⚙️ Lógica (app.js)

### Funciones principales

| Función | Acción |
|---|---|
| `shuffle(a)` | Baraja un array (Fisher-Yates) |
| `shuffleOpts(q)` | Baraja las 3 opciones de una pregunta |
| `startExam()` | Selecciona 16 normales + 4 combo, baraja todo, renderiza |
| `render()` | Renderiza página actual con preguntas y navegación |
| `select(idx, val)` | Marca opción seleccionada y re-renderiza |
| `prevPage()` / `nextPage()` | Navegación entre páginas |
| `evaluar()` | Calcula nota (5 pts c/u) y muestra resultados detallados |
| `closeExam()` | Muestra modal de confirmación |
| `confirmClose(yes)` | Cierra modal, vuelve a inicio si confirma |
| `show(id)` | Cambia entre pantallas (home/exam/results) |

### Constantes

```js
const P = 5;            // Preguntas por página
const TOTAL = 20;       // Total preguntas por examen
const COMBO_COUNT = 4;  // Combos por examen
```

### Datos en memoria

```js
allQuestions   → window.PREGUNTAS (376 preguntas normales)
comboQuestions → window.PREGUNTAS_COMBO (20 combo)
examQuestions  → array de 20 preguntas del examen activo con:
  { id, pregunta, shuffled: [opciones barajadas],
    correct: índice correcto barajado, selected: respuesta del usuario }
```

---

## 🎨 Diseño (style.css)

- **Paleta**: blanco (`#f5f5f5`), grises suaves, azul oscuro (`#1a237e`)
- **Tipografía**: sistema nativo (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`)
- **Responsive**: max-width 720px, sin frameworks
- **Tema**: minimalista, clean
- **Clases principales**:

| Clase | Uso |
|---|---|
| `.container` | Contenedor centrado max 720px |
| `.hero` | Pantalla de inicio |
| `.btn` / `.btn-sm` / `.btn-eval` | Botones |
| `.question` | Tarjeta de pregunta |
| `.option` / `.option.selected` | Opción de respuesta |
| `.exam-header` / `.exam-footer` | Barras superior e inferior del examen |
| `.progress-bar-bg` / `.progress-bar` | Barra de progreso |
| `.result-box` / `.result-row` / `.result-row.ok` / `.result-row.err` | Resultados |
| `.modal-box` | Modal de confirmación |

---

## 🔧 Migración a Quasar / Capacitor

### Estrategia

1. **Datos** → `preguntas.js` y `preguntas_combo.js` se mantienen igual (solo JSON)
2. **Lógica** → `app.js` se puede reescribir en TypeScript o mantener como módulo
3. **Vista** → `index.html` + `style.css` se migran a componentes Vue de Quasar:
   - Pantalla inicio → `QCard` + `QBtn`
   - Preguntas → `QRadio` + `QCard`
   - Paginación → `QPagination`
   - Resultados → `QCard` con iconos
   - Modal → `QDialog`
4. **Empaquetado** → `@capacitor/cli` + `@capacitor/android` para generar APK

### Archivos reutilizables directamente

- `preguntas.js` → 100%
- `preguntas_combo.js` → 100%
- Lógica en `startExam()`, `evaluar()`, `shuffle()` → 90%

---

## ☁️ Publicación en Cloudflare Pages

Es sitio **100% estático**, sin backend.

1. Subir a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Inicial"
   git remote add origin <tu-repo>
   git push -u origin main
   ```
2. En [Cloudflare Pages](https://pages.cloudflare.com/):
   - Connect Git → elegir repo
   - Framework: **None**
   - Build output: dejar vacío (raíz)
   - Deploy
3. En 2 minutos está online con HTTPS.

---

## 🧪 Testing

No requiere. La app es autocontenida:

1. Abrir `index.html` en el navegador
2. Click "Comenzar"
3. Responder preguntas
4. Click "Evaluar"
5. Verificar nota y desglose

---

## 👨‍💻 Mantenimiento

### Añadir preguntas nuevas

Añadir objetos a `window.PREGUNTAS` en `preguntas.js` o a `window.PREGUNTAS_COMBO` en `preguntas_combo.js`.

```js
{
  "id": 397,  // siguiente ID disponible
  "pregunta": "texto de la nueva pregunta",
  "opciones": ["Opción 1", "Opción 2", "Opción 3"],
  "correcta": 0,
  "libro": "III"
}
```

### Modificar cantidad de combo por examen

En `app.js`, cambiar:
```js
const COMBO_COUNT = 4;  // cambiar a 3, 5, etc.
```

### Modificar puntuación o aprobado

En `app.js`, ajustar:
```js
// evaluar() — línea de puntuación
if (correct) score += 5;  // cambiar 5 por otro valor

// evaluar() — línea de aprobado
const passed = score >= 70;  // cambiar 70 por otro valor
```

---

## 📜 Referencia legal

**Ley 109 - Código de Seguridad Vial de la República de Cuba**
- Aprobada: agosto 2010
- Publicada en Gaceta Oficial: 17 de septiembre de 2010
- Vigente desde: 16 de marzo de 2011
- 324 artículos en 7 libros
- Deroga la Ley No. 60 de 1987
