# Tactical Ops 3.5 Chile - Sitio Web de la Comunidad

## Instalación en XAMPP

### 1. Requisitos
- XAMPP con PHP 7.4+ y MySQL
- phpMyAdmin
- Navegador web moderno

### 2. Configuración de la Base de Datos

1. **Abrir phpMyAdmin**
   - Ir a `http://localhost/phpmyadmin`
   - Iniciar sesión como `root` sin contraseña

2. **Crear la Base de Datos**
   - Crear nueva base de datos llamada `tactical_ops_chile`
   - Seleccionar collation: `utf8mb4_unicode_ci`

3. **Importar Estructura**
   - Seleccionar la base de datos `tactical_ops_chile`
   - Ir a la pestaña "Importar"
   - Seleccionar el archivo `database/tactical_ops_chile.sql`
   - Hacer clic en "Continuar"

### 3. Configuración del Servidor

1. **Copiar Archivos**
   ```bash
   # Copiar la carpeta del proyecto a htdocs
   cp -r tactical-ops-chile/ C:/xampp/htdocs/
   ```

2. **Verificar Configuración**
   - El archivo `api/config/database.php` ya está configurado para XAMPP
   - Host: `localhost`
   - Base de datos: `tactical_ops_chile`
   - Usuario: `root`
   - Contraseña: (vacía)

### 4. Configuración del Frontend

1. **Instalar Dependencias**
   ```bash
   npm install
   ```

2. **Configurar URL de API**
   - En `src/contexts/AuthContext.tsx`, la URL de la API está configurada como:
   ```typescript
   const API_BASE_URL = 'http://localhost/tactical-ops-chile/api';
   ```

3. **Ejecutar en Desarrollo**
   ```bash
   npm run dev
   ```

### 5. Estructura de Archivos

```
tactical-ops-chile/
├── api/                          # Backend PHP
│   ├── config/
│   │   └── database.php         # Configuración de BD
│   ├── auth/
│   │   ├── login.php           # Login de usuarios
│   │   ├── register.php        # Registro de usuarios
│   │   └── logout.php          # Logout
│   ├── users/
│   │   └── get-all.php         # Obtener todos los usuarios
│   ├── news/
│   │   ├── get-all.php         # Obtener noticias
│   │   ├── create.php          # Crear noticia
│   │   ├── like.php            # Like/Unlike noticia
│   │   └── comment.php         # Comentar noticia
│   ├── messages/
│   │   ├── send.php            # Enviar mensaje
│   │   └── get-conversation.php # Obtener conversación
│   └── .htaccess               # Configuración Apache
├── database/
│   └── tactical_ops_chile.sql  # Estructura de BD
├── src/                        # Frontend React
└── README.md                   # Este archivo
```

### 6. Funcionalidades Implementadas

#### Base de Datos
- ✅ Usuarios con autenticación
- ✅ Sistema de noticias con likes y comentarios
- ✅ Sistema de mensajería privada
- ✅ Sistema de clanes
- ✅ Estadísticas de usuarios
- ✅ Sistema de logros

#### API Endpoints
- ✅ `POST /auth/login.php` - Login
- ✅ `POST /auth/register.php` - Registro
- ✅ `POST /auth/logout.php` - Logout
- ✅ `GET /users/get-all.php` - Obtener usuarios
- ✅ `GET /news/get-all.php` - Obtener noticias
- ✅ `POST /news/create.php` - Crear noticia
- ✅ `POST /news/like.php` - Like/Unlike
- ✅ `POST /news/comment.php` - Comentar
- ✅ `POST /messages/send.php` - Enviar mensaje
- ✅ `GET /messages/get-conversation.php` - Obtener conversación

### 7. Seguridad

- Contraseñas hasheadas con `password_hash()`
- Prepared statements para prevenir SQL injection
- Validación de entrada en todos los endpoints
- Sistema de sesiones PHP
- CORS configurado para desarrollo

### 8. Próximos Pasos

Para completar la migración, implementar:
- [ ] API para actualizar usuarios (admin)
- [ ] API para gestión de noticias (editar/eliminar)
- [ ] API para marcar mensajes como leídos
- [ ] API para gestión de clanes
- [ ] API para estadísticas y logros
- [ ] Sistema de archivos para subida de imágenes

### 9. Troubleshooting

**Error de conexión a BD:**
- Verificar que MySQL esté ejecutándose en XAMPP
- Verificar credenciales en `database.php`

**Error CORS:**
- Verificar que el archivo `.htaccess` esté en la carpeta `api/`
- Verificar que mod_rewrite esté habilitado en Apache

**Error 404 en API:**
- Verificar que la carpeta esté en `htdocs/tactical-ops-chile/`
- Verificar que Apache esté ejecutándose