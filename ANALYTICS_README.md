# Sistema de Analítica de Clicks (Click Analytics System)

Sistema simplificado para rastrear clicks en hamburguesas y enviar los datos a Google Sheets.

## 🎯 Características

- Rastreo automático de clicks en hamburguesas
- Almacenamiento de datos en Google Sheets
- API REST para estadísticas
- Funciona sin Google Sheets (modo consola)
- Mínima interferencia con la experiencia del usuario

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Una cuenta de Google (para Google Sheets)

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Google Sheets

#### Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Sheets API:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Sheets API"
   - Haz clic en "Enable"

#### Crear una Cuenta de Servicio

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "Service Account"
3. Completa los detalles:
   - Nombre: `ganbara-analytics`
   - ID: Se genera automáticamente
   - Descripción: "Service account for click tracking"
4. Haz clic en "Create and Continue"
5. No es necesario asignar roles específicos
6. Haz clic en "Done"

#### Generar Clave JSON

1. En la lista de cuentas de servicio, haz clic en la cuenta recién creada
2. Ve a la pestaña "Keys"
3. Haz clic en "Add Key" > "Create new key"
4. Selecciona "JSON"
5. Descarga el archivo JSON (¡guárdalo de forma segura!)

#### Crear y Configurar la Hoja de Cálculo

1. Crea una nueva Google Sheet en [Google Sheets](https://sheets.google.com)
2. Nómbrala como quieras (ej: "Ganbara Click Analytics")
3. Copia el ID de la hoja de cálculo desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. Comparte la hoja con el email de la cuenta de servicio:
   - Abre el archivo JSON descargado
   - Copia el valor de `client_email`
   - Comparte la hoja con ese email (con permisos de Editor)

5. Crea una hoja llamada "Clicks" (o el nombre que prefieras) con estos encabezados en la primera fila:
   ```
   | Timestamp | Category | Item ID | Item Name |
   ```

### 3. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y configura las variables:
   ```env
   PORT=3000
   GOOGLE_SPREADSHEET_ID=tu_id_de_spreadsheet_aqui
   GOOGLE_SHEET_NAME=Clicks
   GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta-servicio@tu-proyecto.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu clave privada aquí\n-----END PRIVATE KEY-----\n"
   ```

3. Para obtener los valores del archivo JSON:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: valor de `client_email`
   - `GOOGLE_PRIVATE_KEY`: valor de `private_key` (incluye las comillas y los `\n`)

## 🎮 Uso

### Iniciar el Servidor

```bash
npm start
```

El servidor iniciará en `http://localhost:3000`

### Acceder a la Página Web

Abre tu navegador y ve a:
```
http://localhost:3000
```

### Verificar el Estado del Sistema

```bash
curl http://localhost:3000/api/health
```

Respuesta:
```json
{
  "status": "ok",
  "sheetsConfigured": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 📊 API Endpoints

### 1. Rastrear Click

**POST** `/api/track-click`

Registra un click en un item del menú.

**Request Body:**
```json
{
  "itemId": "1",
  "itemName": {
    "es": "GANBARA",
    "eu": "GANBARA"
  },
  "category": "hamburguesas",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": {
    "itemId": "1",
    "itemName": "GANBARA",
    "category": "hamburguesas",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. Verificar Estado

**GET** `/api/health`

Verifica el estado del servidor y la configuración.

**Response:**
```json
{
  "status": "ok",
  "sheetsConfigured": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. Obtener Estadísticas

**GET** `/api/stats`

Obtiene estadísticas agregadas de clicks.

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "category": "hamburguesas",
      "itemId": "1",
      "itemName": "GANBARA",
      "clicks": 15
    }
  ],
  "totalClicks": 15
}
```

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca commits el archivo `.env`**
   - Ya está incluido en `.gitignore`
   - Contiene información sensible

2. **Protege el archivo JSON de credenciales**
   - No lo subas a GitHub
   - Guárdalo en un lugar seguro

3. **Limita el acceso a la hoja de cálculo**
   - Solo compártela con la cuenta de servicio
   - No la hagas pública

4. **Usa HTTPS en producción**
   - Configura un certificado SSL
   - Usa un proxy reverso como Nginx

## 🧪 Modo de Desarrollo (Sin Google Sheets)

Si no configuras las credenciales de Google Sheets, el sistema funcionará en modo consola:
- Los clicks se registrarán en la consola del servidor
- El endpoint `/api/stats` retornará un error 503
- La aplicación web funcionará normalmente

## 📝 Datos Registrados

Para cada click se guarda:
- **Timestamp**: Fecha y hora del click (ISO 8601)
- **Category**: Categoría del item (siempre "hamburguesas")
- **Item ID**: ID único del item
- **Item Name**: Nombre del item en español

## 🐛 Solución de Problemas

### El servidor no inicia

```bash
# Verifica que las dependencias estén instaladas
npm install

# Verifica el archivo .env
cat .env
```

### Los clicks no se registran en Google Sheets

1. Verifica que el `GOOGLE_SPREADSHEET_ID` sea correcto
2. Asegúrate de haber compartido la hoja con el email de la cuenta de servicio
3. Verifica que la hoja "Clicks" exista
4. Revisa los logs del servidor en la consola

### Error de autenticación de Google

1. Verifica que la `GOOGLE_PRIVATE_KEY` esté correctamente formateada
2. Asegúrate de que los `\n` estén incluidos en la clave
3. Verifica que el email de la cuenta de servicio sea correcto

## 📈 Análisis de Datos

### Ver Datos en Google Sheets

1. Abre tu hoja de cálculo en Google Sheets
2. Ve a la pestaña "Clicks"
3. Los datos se agregarán automáticamente

### Crear Gráficos

1. Selecciona los datos
2. Menú "Insert" > "Chart"
3. Elige el tipo de gráfico (barras, líneas, etc.)

### Exportar Datos

1. Menú "File" > "Download"
2. Elige el formato (Excel, CSV, PDF)

## 🔄 Próximas Mejoras

- [ ] Dashboard web para visualización de estadísticas
- [ ] Rastreo de otras categorías (no solo hamburguesas)
- [ ] Autenticación para endpoints protegidos
- [ ] Agregación de datos en tiempo real
- [ ] Exportación automática de reportes

## 📞 Soporte

Para preguntas o problemas, por favor abre un issue en el repositorio.

## 📄 Licencia

MIT License - ver LICENSE para más detalles
