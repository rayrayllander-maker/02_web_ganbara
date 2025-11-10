# Quick Start Guide - Sistema de Analítica de Clicks

Esta guía te permitirá iniciar el sistema de rastreo de clicks en menos de 5 minutos.

## 🚀 Inicio Rápido (Sin Google Sheets)

Si solo quieres probar el sistema sin configurar Google Sheets:

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor
```bash
npm start
```

### 3. Abrir la aplicación
Abre tu navegador en: http://localhost:3000

**¡Listo!** Los clicks se registrarán en la consola del servidor.

## 📊 Configuración Completa (Con Google Sheets)

Para almacenar los datos en Google Sheets:

### 1. Crear Hoja de Cálculo
- Ve a [Google Sheets](https://sheets.google.com)
- Crea una nueva hoja llamada "Ganbara Analytics"
- Crea una pestaña llamada "Clicks"
- Agrega estos encabezados en la primera fila:
  ```
  Timestamp | Category | Item ID | Item Name
  ```

### 2. Configurar Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo
3. Habilita "Google Sheets API"
4. Crea una "Service Account"
5. Descarga el archivo JSON de credenciales

### 3. Compartir la Hoja

Abre el archivo JSON y copia el email (campo `client_email`), luego:
- Abre tu Google Sheet
- Click en "Compartir"
- Pega el email de la cuenta de servicio
- Dale permisos de "Editor"

### 4. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` y completa:
```env
GOOGLE_SPREADSHEET_ID=ID_de_tu_hoja
GOOGLE_SERVICE_ACCOUNT_EMAIL=email-de-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPega_aquí_la_clave\n-----END PRIVATE KEY-----\n"
```

### 5. Reiniciar el Servidor

```bash
npm start
```

## 🧪 Probar el Sistema

### Verificar Estado
```bash
curl http://localhost:3000/api/health
```

### Registrar un Click Manual
```bash
curl -X POST http://localhost:3000/api/track-click \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "1",
    "itemName": {"es": "GANBARA", "eu": "GANBARA"},
    "category": "hamburguesas"
  }'
```

### Ver Estadísticas
```bash
curl http://localhost:3000/api/stats
```

## 🎯 Uso Normal

1. Abre http://localhost:3000
2. Navega al menú de hamburguesas
3. Haz click en cualquier hamburguesa
4. Los clicks se registran automáticamente

## 📈 Ver Resultados

- **Consola**: Los clicks aparecen en la terminal del servidor
- **Google Sheets**: Ve a tu hoja "Clicks" para ver todos los registros
- **API Stats**: Llama a `/api/stats` para obtener estadísticas agregadas

## ❓ Problemas Comunes

### El servidor no inicia
```bash
# Verifica las dependencias
npm install
```

### Los clicks no se guardan en Sheets
1. Verifica que compartiste la hoja con el email correcto
2. Revisa que el `GOOGLE_SPREADSHEET_ID` sea correcto
3. Verifica que la pestaña "Clicks" exista

### Error de autenticación
- Asegúrate de que `GOOGLE_PRIVATE_KEY` incluya los `\n`
- Verifica que no haya espacios extras al copiar

## 📚 Documentación Completa

Para más detalles, consulta [ANALYTICS_README.md](./ANALYTICS_README.md)

## 🔒 Seguridad

✅ Archivos sensibles no son accesibles públicamente  
✅ Solo la carpeta `public/` es servida  
✅ Variables de entorno protegidas en `.env`  

## 🎉 ¡Felicitaciones!

Tu sistema de analítica está funcionando. Cada click en las hamburguesas será registrado automáticamente.
