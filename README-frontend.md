# 💰 CrediAgil — Frontend

> **Interfaz web para gestión de créditos informales con soporte multitenant**
> *Web interface for informal credit management with multitenant support*

![React](https://img.shields.io/badge/React-18.x-blue)
![React Router](https://img.shields.io/badge/React_Router-7.x-red)
![Axios](https://img.shields.io/badge/Axios-1.x-purple)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

---

## 📋 Tabla de contenidos / Table of Contents

- [Descripción general](#-descripción-general)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura de archivos](#-estructura-de-archivos)
- [Instalación local](#-instalación-y-configuración-local)
- [Variables de entorno](#-variables-de-entorno)
- [Rutas de la aplicación](#-rutas-de-la-aplicación)
- [Sistema multitenant](#-sistema-multitenant-en-el-frontend)
- [Panel superadmin](#-panel-superadmin)
- [Despliegue en Vercel](#-despliegue-en-vercel)

---

## 📌 Descripción general

**ES:** Frontend de CrediAgil — una aplicación React que permite a múltiples empresas gestionar sus créditos, clientes y cobradores desde una interfaz unificada. Cada empresa accede a sus propios datos mediante un sistema de **multitenant** basado en headers HTTP. Incluye un panel de superadmin protegido accesible desde `/admin`.

**EN:** CrediAgil Frontend — a React application that allows multiple companies to manage their credits, clients and collectors from a unified interface. Each company accesses its own data through an HTTP header-based **multitenant** system. Includes a protected superadmin panel accessible from `/admin`.

### Funcionalidades principales / Main Features

- ✅ Login por empresa — el tenantId se captura en el formulario de acceso
- ✅ Dashboard con estadísticas en tiempo real
- ✅ CRUD completo de clientes, cobradores y créditos
- ✅ Panel superadmin en `/admin` — gestión global de empresas
- ✅ Diseño responsive — optimizado para móvil y escritorio
- ✅ Separación de clientes HTTP: uno para tenants, otro para admin

---

## 🛠 Stack tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.x | Framework de UI |
| React Router DOM | 7.x | Enrutamiento cliente |
| Axios | 1.x | Cliente HTTP |
| React Icons | 5.x | Iconografía |
| CSS puro | — | Estilos y responsive |
| Vercel | — | Despliegue |

---

## 📁 Estructura de archivos

```
nequi-login/src/
├── App.js                          # Router principal + estado de autenticación
├── App.css
├── index.js
│
├── core/
│   └── config/
│       └── api.config.js           # API_BASE_URL y endpoints
│
├── services/
│   ├── api/
│   │   └── http-client.js          # Axios con X-Tenant-ID dinámico desde localStorage
│   ├── admin/
│   │   └── admin.service.js        # Cliente admin con X-Admin-Secret desde sessionStorage
│   ├── clientes/
│   │   └── clientes.service.js
│   ├── cobradores/
│   │   └── cobradores.service.js
│   └── credits/
│       └── creditos.service.js
│
└── components/
    ├── Admin/
    │   ├── AdminLogin.js            # Formulario de acceso superadmin
    │   ├── AdminDashboard.js        # Panel de gestión de empresas
    │   └── Admin.css
    │
    ├── Login/
    │   ├── Login.js                 # Login con campos: empresa, email, contraseña
    │   └── Login.css
    │
    ├── Dashboard/
    │   ├── Dashboard.js             # Layout principal con sidebar
    │   └── Dashboard.css
    │
    ├── clients/
    │   ├── ClientsList.js
    │   ├── ClientCard.js
    │   ├── ClientForm.js
    │   └── *.css
    │
    ├── collectors/
    │   ├── CollectorsList.js
    │   ├── CollectorCard.js
    │   ├── CollectorForm.js
    │   └── *.css
    │
    ├── credits/
    │   ├── CreditsList.js
    │   ├── CreditCard.js
    │   ├── CreditForm.js
    │   └── *.css
    │
    └── common/
        ├── Alert/
        ├── Button/
        ├── Input/
        ├── Modal/
        └── StatsCard/
```

---

## 🚀 Instalación y configuración local

### Requisitos previos

- Node.js v22+
- Backend de CrediAgil corriendo en `http://localhost:3000`
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/dgamay/Creditos-frontend.git
cd creditos-frontend
npm install
```

### 2. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto:

```properties
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_TENANT_ID=empresa1
```

### 3. Iniciar la aplicación

```bash
npm start
```

La app queda disponible en `http://localhost:3001`

---

## 🔐 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL base del backend | `https://creditos-api.vercel.app/api` |
| `REACT_APP_TENANT_ID` | Tenant por defecto (fallback si no hay localStorage) | `empresa1` |

> ℹ️ En producción `REACT_APP_TENANT_ID` actúa como fallback. El valor real del tenant siempre viene del campo "empresa" que el usuario escribe en el login.

---

## 🗺 Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Login` / `Dashboard` | Login de empresa o dashboard si ya autenticado |
| `/admin` | `AdminLogin` / `AdminDashboard` | Panel superadmin |
| `*` | Redirect a `/` | Cualquier ruta desconocida |

### Flujo de navegación

```
Usuario abre la app
        │
        ▼
   ¿Está en /admin?
        │
   SÍ  │  NO
        │
  AdminLogin     Login (empresa + email + pass)
        │                   │
  ingresa secret       ingresa datos
        │                   │
  AdminDashboard        Dashboard
  (gestión global)   (módulos del negocio)
```

---

## 🏢 Sistema multitenant en el frontend

### ¿Cómo funciona?

1. El usuario escribe el nombre de su empresa en el campo **"Nombre de empresa"** del login (ej: `empresa1`)
2. Al hacer login exitoso, `Login.js` guarda el valor en `localStorage`:
   ```javascript
   localStorage.setItem('tenantId', 'empresa1');
   ```
3. El interceptor de `http-client.js` lee ese valor en **cada petición**:
   ```javascript
   const tenantId = localStorage.getItem('tenantId') || process.env.REACT_APP_TENANT_ID;
   request.headers['X-Tenant-ID'] = tenantId;
   ```
4. Al cerrar sesión, `App.js` limpia el `localStorage`:
   ```javascript
   localStorage.removeItem('tenantId');
   ```

### Validación del tenantId en el formulario

El campo empresa en `Login.js` valida:
- Solo letras, números y guiones: `/^[a-zA-Z0-9\-]+$/`
- Mínimo 2 caracteres
- Se convierte automáticamente a minúsculas antes de guardarse

### Clientes HTTP separados

| Cliente | Archivo | Header enviado | Almacenamiento |
|---------|---------|---------------|----------------|
| `httpClient` | `http-client.js` | `X-Tenant-ID` | `localStorage` |
| `adminClient` | `admin.service.js` | `X-Admin-Secret` | `sessionStorage` |

El cliente admin usa `sessionStorage` — el secret se borra automáticamente al cerrar el navegador.

---

## 👑 Panel superadmin

El panel de superadmin es completamente independiente del login de empresas. Vive en la ruta `/admin` y usa sus propias credenciales.

### Acceso

```
URL:   http://localhost:3001/admin
Clave: valor configurado en ADMIN_SECRET del backend
```

### Funcionalidades

| Sección | Descripción |
|---------|-------------|
| Estadísticas globales | Total de empresas activas/inactivas y clientes |
| Listado de empresas | Tabla con datos y métricas por empresa |
| Crear empresa | Formulario para registrar nueva empresa |
| Activar/Desactivar | Toggle de estado por empresa |
| Eliminar empresa | Elimina el registro con confirmación |

### Seguridad del panel admin

- El secret se guarda en `sessionStorage` — no persiste al cerrar el navegador
- Si el backend responde `401` o `403`, el secret se limpia automáticamente y el usuario vuelve al `AdminLogin`
- La ruta `/admin` en `App.js` verifica `adminService.isAuthenticated()` al cargar — si ya hay sesión activa, muestra el dashboard directamente

---

## 📱 Diseño responsive

La aplicación está optimizada para:

| Dispositivo | Breakpoint | Comportamiento |
|------------|-----------|----------------|
| Escritorio | > 768px | Sidebar visible permanentemente |
| Tablet | 768px | Sidebar se colapsa con overlay |
| Móvil | < 480px | Layout de una columna, botón "Atrás" en créditos |

### Mejoras UX en móvil

- Botón "← Volver al inicio" en el módulo de créditos
- Modal de cobrador con scroll y altura máxima controlada
- Cards de crédito en una sola columna
- Estadísticas en grid 2x2

---

## ☁️ Despliegue en Vercel

### 1. Conectar repositorio en Vercel

Importa el repositorio desde [vercel.com](https://vercel.com)

### 2. Configurar variables de entorno

En **Settings → Environment Variables** agrega:

| Variable | Valor |
|----------|-------|
| `REACT_APP_API_URL` | `https://creditos-api.vercel.app/api` |
| `REACT_APP_TENANT_ID` | `empresa1` |

### 3. Configuración de build

Vercel detecta automáticamente que es un proyecto React (Create React App). No necesitas configuración adicional.

| Campo | Valor |
|-------|-------|
| Framework | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |

### 4. Push y despliegue automático

```bash
git add .
git commit -m "deploy: producción"
git push
```

### 5. Verificar CORS en el backend

Asegúrate de que el dominio de Vercel del frontend esté en la lista de orígenes permitidos en el backend (`src/app.js`):

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'https://tu-frontend.vercel.app', // ← tu URL real
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Admin-Secret'],
};
```

---

## 🔗 Repositorio relacionado

Este frontend consume la API de:

👉 [CrediAgil Backend](https://github.com/dgamay/Creditos-frontend.git) — Node.js + Express + MongoDB Atlas

---

## 👨‍💻 Autor

Desarrollado como proyecto de integración web y móvil.

**Universidad:** Unicatólica
**Materia:** Integración Web y Móvil
**Stack:** MERN (MongoDB, Express, React, Node.js)

---

*CrediAgil Frontend — 2026*
