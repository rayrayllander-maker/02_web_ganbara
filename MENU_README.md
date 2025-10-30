# Gestión del Menú - Ganbara Restaurant

## 📋 Descripción

El menú del restaurante se gestiona completamente a través del archivo **`menu-data.json`**. Esto permite añadir, modificar o eliminar platos sin necesidad de editar el código HTML o JavaScript.

---

## 🗂️ Estructura del JSON

El archivo está organizado por categorías:

```json
{
  "bocadillos": [...],
  "raciones": [...],
  "hamburguesas": [...],
  "chuleta": [...],
  "postres": [...]
}
```

### Estructura de un plato:

```json
{
  "id": 1,
  "nombre": {
    "es": "Nombre en español",
    "eu": "Izena euskeraz"
  },
  "descripcion": {
    "es": "Descripción en español",
    "eu": "Deskribapena euskeraz"
  },
  "precio": 10.50,
  "imagen": "images/plato.jpg",
  "categoria": "bocadillos",
  "disponible": true
}
```

---

## 📝 Campos Explicados

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | number | ✅ | Identificador único del plato |
| `nombre` | object | ✅ | Nombre del plato en ES y EU |
| `descripcion` | object | ✅ | Descripción/ingredientes en ES y EU |
| `precio` | number/null | ⚠️ | Precio fijo (ej: 8.50). Null si es precio por kg |
| `precioPorKg` | number | ❌ | Solo para chuletas (precio variable por peso) |
| `mediaRacion` | number | ❌ | Precio de media ración (solo raciones) |
| `imagen` | string | ✅ | Ruta de la imagen del plato |
| `categoria` | string | ✅ | Categoría: bocadillos, raciones, hamburguesas, chuleta, postres |
| `disponible` | boolean | ✅ | true = visible, false = oculto |
| `nota` | object | ❌ | Nota adicional bilingüe (ej: info sobre precio/kg) |

---

## ✏️ Cómo Añadir un Nuevo Plato

### Ejemplo: Añadir un nuevo bocadillo

1. Abre `menu-data.json`
2. Ve a la sección `"bocadillos": [...]`
3. Añade al final del array (antes del `]`):

```json
{
  "id": 12,
  "nombre": {
    "es": "Atún con pimientos",
    "eu": "Atuna piperekin"
  },
  "descripcion": {
    "es": "Atún, pimientos rojos, cebolla, mayonesa",
    "eu": "Atuna, piper gorriak, tipula, mayonesa"
  },
  "precio": 7.50,
  "imagen": "images/bocadillo-12.jpg",
  "categoria": "bocadillos",
  "disponible": true
}
```

⚠️ **Importante**: Asegúrate de añadir una coma `,` después del plato anterior.

---

## 🔄 Cómo Modificar un Plato Existente

### Cambiar el precio:

```json
"precio": 9.00  // Cambia de 8.50 a 9.00
```

### Cambiar el nombre:

```json
"nombre": {
  "es": "Nuevo nombre en español",
  "eu": "Izen berria euskeraz"
}
```

### Ocultar temporalmente un plato (sin eliminarlo):

```json
"disponible": false
```

---

## 🗑️ Cómo Eliminar un Plato

Simplemente **borra todo el objeto** del plato, desde `{` hasta `}`, incluyendo la coma.

**Antes:**
```json
{
  "id": 5,
  "nombre": { ... },
  ...
},
{
  "id": 6,  ← Este quiero eliminar
  "nombre": { ... },
  ...
},
{
  "id": 7,
  "nombre": { ... },
  ...
}
```

**Después:**
```json
{
  "id": 5,
  "nombre": { ... },
  ...
},
{
  "id": 7,
  "nombre": { ... },
  ...
}
```

---

## 📌 Ejemplos Especiales

### Plato con Media Ración (Raciones):

```json
{
  "id": 1,
  "nombre": {
    "es": "Calamares a la romana",
    "eu": "Txipiroi erromatar eran"
  },
  "descripcion": {
    "es": "Calamares rebozados, estilo romana",
    "eu": "Txipiroi errebozatuak, erromatar estiloan"
  },
  "precio": 12.00,
  "mediaRacion": 7.00,  ← Añade este campo
  "imagen": "images/racion-1.jpg",
  "categoria": "raciones",
  "disponible": true
}
```

### Plato con Precio por Kg (Chuletas):

```json
{
  "id": 1,
  "nombre": {
    "es": "Chuletón de ternera",
    "eu": "Txahalaren txuleta"
  },
  "descripcion": {
    "es": "Chuletón de ternera a la parrilla",
    "eu": "Txahalaren txuleta parrillan"
  },
  "precio": null,  ← Sin precio fijo
  "precioPorKg": 65.00,  ← Precio por kg
  "imagen": "images/chuleta-1.jpg",
  "categoria": "chuleta",
  "disponible": true,
  "nota": {
    "es": "Precio por kilogramo. Peso variable según pieza.",
    "eu": "Prezio kilogramoko. Pieza araberako pisua."
  }
}
```

---

## 🎨 Gestión de Imágenes

### Ubicación de las Imágenes:
Las imágenes deben estar en la carpeta `images/` del proyecto.

### Formato Recomendado:
- **Formato**: JPG o PNG
- **Dimensiones**: 800x600px (aprox.)
- **Peso**: < 200KB para optimizar carga

### Nombrado:
```
images/bocadillo-1.jpg
images/racion-5.jpg
images/hamburguesa-3.jpg
images/chuleta-1.jpg
images/postre-2.jpg
```

### Placeholder:
Si aún no tienes la imagen, puedes usar:
```json
"imagen": "images/placeholder.jpg"
```

---

## ✅ Validación del JSON

Antes de guardar los cambios, **verifica que el JSON es válido**:

1. Usa un validador online: https://jsonlint.com/
2. Copia todo el contenido de `menu-data.json`
3. Pega y valida
4. Corrige errores si los hay

**Errores comunes:**
- ❌ Falta una coma `,`
- ❌ Coma extra al final del último elemento
- ❌ Comillas mal cerradas
- ❌ Paréntesis `{}` o corchetes `[]` no balanceados

---

## 🔄 Aplicar los Cambios

1. Edita `menu-data.json`
2. Guarda el archivo
3. Recarga la página web (F5 o Ctrl+R)
4. Los cambios se verán reflejados automáticamente

**No es necesario reiniciar el servidor ni modificar otros archivos.**

---

## 🌐 Sistema Bilingüe

El sitio soporta **Español (ES)** y **Euskera (EU)**. 

### Reglas:
- ✅ **Todos** los campos `nombre` y `descripcion` deben tener ambos idiomas
- ✅ El sistema cambia automáticamente al presionar el botón ES/EU
- ✅ Los precios se muestran igual en ambos idiomas (€)

### Traducción de Ingredientes:
Mantén consistencia en las traducciones:

| Español | Euskera |
|---------|---------|
| Bacon | Zirikatz |
| Queso | Gazta |
| Tomate | Tomatea |
| Cebolla | Tipula |
| Lechuga | Letxuga |
| Pimientos | Piperrak |

---

## 📞 Soporte

Si tienes problemas con el JSON:
1. Verifica que está validado correctamente
2. Revisa la consola del navegador (F12 → Console) para ver errores
3. Compara con los ejemplos en este documento

---

## 🎯 Resumen Rápido

| Acción | Archivo | Recarga Necesaria |
|--------|---------|-------------------|
| Añadir plato | `menu-data.json` | ✅ |
| Modificar precio | `menu-data.json` | ✅ |
| Cambiar imagen | `menu-data.json` + carpeta `images/` | ✅ |
| Ocultar plato | `disponible: false` | ✅ |
| Cambiar estilos | `styles.css` | ✅ |

**¡No toques `script.js` ni `index.html` a menos que sea necesario!**
