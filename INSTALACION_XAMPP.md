# Guía de Instalación en XAMPP - Tactical Ops 3.5 Chile

## 📁 Estructura de Carpetas Requerida

```
C:/xampp/htdocs/
└── tactical-ops-chile/
    ├── api/                     # Backend PHP (APIs)
    │   ├── auth/
    │   ├── config/
    │   ├── messages/
    │   ├── news/
    │   ├── users/
    │   └── .htaccess
    ├── dist/                    # Frontend compilado (React)
    │   ├── assets/
    │   ├── index.html
    │   └── vite.svg
    └── database/
        └── tactical_ops_chile.sql
```

## 🚀 Pasos de Instalación

### 1. Preparar XAMPP
1. **Descargar e instalar XAMPP** desde https://www.apachefriends.org/
2. **Iniciar servicios**:
   - Abrir XAMPP Control Panel
   - Iniciar **Apache** y **MySQL**
   - Verificar que estén en verde (running)

### 2. Configurar la Base de Datos

1. **Abrir phpMyAdmin**:
   - Ir a `http://localhost/phpmyadmin`
   - Usuario: `root` (sin contraseña por defecto)

2. **Crear la base de datos**:
   - Clic en "Nueva" en el panel izquierdo
   - Nombre: `tactical_ops_chile`
   - Cotejamiento: `utf8mb4_unicode_ci`
   - Clic en "Crear"

3. **Importar estructura**:
   - Seleccionar la base de datos `tactical_ops_chile`
   - Ir a la pestaña "Importar"
   - Seleccionar archivo: `database/tactical_ops_chile.sql`
   - Clic en "Continuar"

### 3. Configurar el Proyecto

#### A. Copiar archivos del backend
```bash
# Copiar toda la carpeta 'api' a htdocs
Copiar: ./api/ → C:/xampp/htdocs/tactical-ops-chile/api/

# Copiar base de datos
Copiar: ./supabase/migrations/20250613164158_twilight_hall.sql → C:/xampp/htdocs/tactical-ops-chile/database/tactical_ops_chile.sql
```

#### B. Compilar y copiar el frontend
```bash
# En la carpeta del proyecto (donde está package.json)
npm install
npm run build

# Copiar la carpeta 'dist' generada
Copiar: ./dist/ → C:/xampp/htdocs/tactical-ops-chile/dist/
```

### 4. Configurar URLs para XAMPP

#### A. Actualizar configuración del frontend
Crear archivo de configuración para producción:
```javascript
// C:/xampp/htdocs/tactical-ops-chile/dist/config.js
window.APP_CONFIG = {
  API_BASE_URL: 'http://localhost/tactical-ops-chile/api'
};
```

#### B. Actualizar CORS en el backend
El archivo `api/.htaccess` debe tener:
```apache
RewriteEngine On

# Permitir CORS
Header always set Access-Control-Allow-Origin "http://localhost"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Allow-Credentials "true"

# Manejar preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Configuración de PHP
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 300
php_value memory_limit 256M

# Seguridad
<Files "*.php">
    Order allow,deny
    Allow from all
</Files>

# Prevenir acceso directo a archivos de configuración
<Files "database.php">
    Order deny,allow
    Deny from all
</Files>
```

### 5. Configurar Apache Virtual Host (Opcional pero Recomendado)

#### A. Editar archivo hosts del sistema
```
# Archivo: C:/Windows/System32/drivers/etc/hosts
# Agregar esta línea:
127.0.0.1    tacops.local
```

#### B. Configurar Virtual Host en Apache
```apache
# Archivo: C:/xampp/apache/conf/extra/httpd-vhosts.conf
# Agregar al final:

<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/tactical-ops-chile/dist"
    ServerName tacops.local
    
    # Configurar API
    Alias /api "C:/xampp/htdocs/tactical-ops-chile/api"
    
    <Directory "C:/xampp/htdocs/tactical-ops-chile/dist">
        AllowOverride All
        Require all granted
        
        # Configurar SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    <Directory "C:/xampp/htdocs/tactical-ops-chile/api">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### C. Habilitar mod_rewrite
```apache
# Archivo: C:/xampp/apache/conf/httpd.conf
# Descomentar esta línea:
LoadModule rewrite_module modules/mod_rewrite.so
```

### 6. Crear Usuario Administrador

Ejecutar en phpMyAdmin:
```sql
INSERT INTO users (username, email, password, role, avatar, status, is_online) 
VALUES (
    'admin', 
    'admin@tacops.cl', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'admin', 
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    'Administrador del servidor',
    1
);
```

### 7. URLs de Acceso

#### Opción A: Acceso directo
- **Frontend**: `http://localhost/tactical-ops-chile/dist/`
- **API**: `http://localhost/tactical-ops-chile/api/`
- **phpMyAdmin**: `http://localhost/phpmyadmin`

#### Opción B: Con Virtual Host (recomendado)
- **Sitio web**: `http://tacops.local`
- **API**: `http://tacops.local/api/`
- **phpMyAdmin**: `http://localhost/phpmyadmin`

### 8. Verificación de Funcionamiento

1. **Verificar Apache**: `http://localhost` debe mostrar la página de XAMPP
2. **Verificar MySQL**: `http://localhost/phpmyadmin` debe abrir phpMyAdmin
3. **Verificar API**: `http://localhost/tactical-ops-chile/api/users/get-all.php` debe devolver JSON
4. **Verificar Frontend**: `http://localhost/tactical-ops-chile/dist/` debe mostrar la web

### 9. Solución de Problemas Comunes

#### Error 404 en API
```apache
# Verificar que .htaccess esté en la carpeta api/
# Verificar que mod_rewrite esté habilitado en Apache
```

#### Error de CORS
```php
# Verificar headers en api/config/database.php:
header('Access-Control-Allow-Origin: http://localhost');
```

#### Error de conexión a BD
```php
# Verificar credenciales en api/config/database.php:
private $host = 'localhost';
private $db_name = 'tactical_ops_chile';
private $username = 'root';
private $password = '';
```

#### Frontend no carga
```html
<!-- Verificar que index.html esté en dist/ -->
<!-- Verificar permisos de carpeta -->
```

### 10. Comandos Útiles

```bash
# Recompilar frontend después de cambios
npm run build

# Verificar logs de Apache
# Archivo: C:/xampp/apache/logs/error.log

# Verificar logs de PHP
# Archivo: C:/xampp/php/logs/php_error_log
```

### 11. Configuración de Desarrollo vs Producción

#### Para desarrollo local:
- Usar `npm run dev` para el frontend
- API en `http://localhost/tactical-ops-chile/api`

#### Para producción en XAMPP:
- Usar `npm run build` y copiar dist/
- Configurar Virtual Host
- Optimizar configuración de PHP

---

## 🎯 Resultado Final

Una vez completados todos los pasos, tendrás:
- ✅ Sitio web funcionando en `http://tacops.local` o `http://localhost/tactical-ops-chile/dist/`
- ✅ API REST funcionando en `/api/`
- ✅ Base de datos MySQL configurada
- ✅ Sistema de autenticación operativo
- ✅ Panel de administración accesible

## 📞 Soporte

Si encuentras problemas:
1. Verificar que Apache y MySQL estén ejecutándose
2. Revisar logs de error en XAMPP
3. Verificar permisos de carpetas
4. Comprobar configuración de CORS