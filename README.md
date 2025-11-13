# Ganbara Restaurant Website

Una página web moderna y responsiva para el restaurante Ganbara, diseñada con HTML, CSS y JavaScript vanilla, con sistema de analítica de clicks integrado.

## 🚀 Características

- **Diseño Responsivo**: Se adapta perfectamente a dispositivos móviles, tablets y escritorio
- **Navegación Suave**: Scroll suave entre secciones
- **Menú Interactivo**: Filtrado por categorías y búsqueda de platos
- **Formulario de Reservas**: Sistema de validación en tiempo real
- **Animaciones**: Efectos visuales atractivos y transiciones suaves
- **SEO Optimizado**: Estructura semántica y metadatos apropiados
- **🆕 Sistema de Analítica**: Rastreo automático de clicks en hamburguesas con integración a Google Sheets

## 📊 Sistema de Analítica (Nuevo)

El sitio incluye un sistema back-end simplificado para rastrear clicks en las hamburguesas y enviar los datos a Google Sheets.

### Inicio Rápido
```bash
npm install
npm start
```

Visita http://localhost:3000 para ver el sitio en acción.

## 📁 Estructura del Proyecto

```
02_web_ganbara/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidad JavaScript
├── firebase-init.js    # Inicialización de Firebase (Auth)
├── analytics.js        # Sistema de rastreo de clicks
├── server.js           # Servidor Node.js/Express
├── package.json        # Dependencias del proyecto
├── .env.example        # Plantilla de configuración
└── README.md           # Este archivo
```

## 🎨 Secciones de la Página

### 1. Header/Navegación
- Logo del restaurante
- Menú de navegación responsivo
- Hamburger menu para móviles

### 2. Hero Section
- Título principal atractivo
- Subtítulo descriptivo
- Botón call-to-action

### 3. Menú
- **Categorías**: Entrantes, Principales, Postres, Bebidas
- **Filtrado**: Por categoría y búsqueda por texto
- **Tarjetas de platos**: Imagen, título, descripción y precio

### 4. Sobre Nosotros
- Historia del restaurante
- Características destacadas
- Imagen del chef/restaurante

### 5. Contacto
- Información de contacto
- Formulario de reservas con validación
- Horarios de atención

### 6. Footer
- Enlaces de navegación
- Información de contacto
- Redes sociales
- Copyright

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: 
  - Grid y Flexbox para layouts
  - Animaciones y transiciones
  - Variables CSS personalizadas
  - Media queries para responsividad
- **JavaScript ES6+**:
  - Manipulación del DOM
  - Event listeners
  - Validación de formularios
  - Intersection Observer API
- **Fuentes**: Google Fonts (Playfair Display, Inter)
- **Iconos**: Font Awesome

## 🎯 Funcionalidades JavaScript

### Navegación
- Toggle del menú móvil
- Scroll suave a secciones
- Cambio de fondo del header al hacer scroll

### Menú Interactivo
- Filtrado por categorías
- Búsqueda de platos en tiempo real
- Animaciones de entrada

### Formulario de Reservas
- Validación en tiempo real
- Validación de email y teléfono
- Prevención de fechas pasadas
- Sistema de notificaciones

### Animaciones
- Intersection Observer para elementos
- Efectos de parallax (opcional)
- Transiciones suaves

## 🎨 Personalización

### Colores
Los colores principales se pueden modificar en el CSS:
```css
:root {
  --primary-color: #d4761a;      /* Naranja principal */
  --secondary-color: #2c3e50;    /* Azul oscuro */
  --accent-color: #e8904d;       /* Naranja claro */
  --text-color: #333;            /* Texto principal */
  --light-bg: #f8f9fa;           /* Fondo claro */
}
```

### Fuentes
- **Títulos**: Playfair Display (serif elegante)
- **Texto**: Inter (sans-serif moderna)

### Imágenes
Reemplaza los placeholders con imágenes reales:
1. Hero section: Imagen del restaurante o plato destacado
2. Menú: Fotos de cada plato
3. About: Foto del chef o interior del restaurante

### Carrusel Hero
Edita `hero-carousel.json` para elegir qué platos aparecen en el carrusel. Basta con indicar la categoría y el identificador (o el nombre) del plato tal como aparece en `menu-data.json`; los textos e imagen se completan automáticamente.

```json
{
  "category": "hamburguesas",
  "id": 6
}
```

También puedes usar `"name": "COLOMBIANA"` (coincidiendo con `nombre.es` o `nombre.eu`) y añadir overrides opcionales como `image`, `title`, `subtitle` o `alt` si deseas personalizar el resultado.

El carrusel incluye botones laterales y marcadores clicables para pasar manualmente entre diapositivas; en móviles funcionan igual con toques.

## 📱 Responsividad

La página está optimizada para:
- **Móviles**: < 480px
- **Tablets**: 481px - 768px
- **Escritorio**: > 768px

## 🚀 Cómo Usar

### Desarrollo con Servidor (Recomendado)

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar el servidor**:
   ```bash
   npm start
   ```

3. **Abrir en el navegador**: http://localhost:3000

### Solo Front-end (Sin Analítica)

1. **Abrir la página**: Simplemente abre `index.html` en tu navegador
2. **Personalizar contenido**: 
   - Edita el texto en `index.html`
   - Modifica estilos en `styles.css`
   - Añade funcionalidades en `script.js`
3. **Añadir imágenes**: Reemplaza los placeholders con imágenes reales

## 🔧 Características Implementadas y Futuras

### ✅ Implementado
- [x] Sistema de analítica de clicks para hamburguesas
- [x] Integración con Google Sheets
- [x] API REST para rastreo de datos
- [x] Modo multi-idioma (ES/EU)
- [x] Tema claro/oscuro

### 🚀 Mejoras Futuras
- [ ] Integración con sistema de reservas real
- [ ] Galería de imágenes
- [ ] Testimonios de clientes
- [ ] Blog/noticias
- [ ] Integración con redes sociales
- [ ] Mapa interactivo
- [ ] Multi-idioma
- [ ] Modo oscuro

## 📞 Soporte

Para soporte técnico o consultas sobre personalización, contacta al desarrollador.

## 📄 Licencia

Este proyecto está bajo licencia MIT. Puedes usar, modificar y distribuir libremente.

---

**Desarrollado con ❤️ para Ganbara Restaurant**