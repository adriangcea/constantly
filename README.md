# Constantly — Aplicación de seguimiento de hábitos

Aplicación web fullstack para el seguimiento de hábitos personales con sistema de rachas (streaks).

## Tecnologías

- **Backend:** Python + Flask + Gunicorn
- **Frontend:** React + TypeScript + Tailwind CSS
- **Base de datos:** MySQL
- **Servidor web:** Apache (proxy inverso)
- **Infraestructura:** AWS EC2 (Ubuntu Server 24.04 LTS, t3.micro)

## Estructura del proyecto

```
constantly/
├── backend/
│   ├── app.py
│   ├── db/
│   │   └── connection.py
│   ├── routes/
│   │   ├── auth.py        # Login
│   │   ├── users.py       # CRUD de usuarios
│   │   ├── habits.py      # Gestión de hábitos
│   │   └── progress.py    # Seguimiento y rachas
│   └── utils/
│       ├── auth.py
│       └── __init__.py
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── index.tsx
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── login.tsx
│       │   ├── register.tsx
│       │   ├── Dashboard.tsx
│       │   └── Users.tsx
│       └── services/
│           ├── api.ts
│           ├── auth.ts
│           └── habits.ts
└── database/
    ├── schema.sql
    ├── init.sql
    └── seed.sql
```

---

## Despliegue en AWS EC2

### Requisitos previos

- Instancia EC2 con Ubuntu Server 24.04 LTS
- Par de claves `.pem` para acceso SSH
- Puerto 80 abierto en el Security Group de la instancia

### 1. Conectarse a la instancia

```bash
ssh -i "ruta/a/tu-clave.pem" ubuntu@TU_IP_PUBLICA
```

### 2. Actualizar el sistema e instalar dependencias

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv -y
sudo apt install apache2 -y
sudo apt install mysql-server -y
sudo apt install git -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

### 3. Crear swap (recomendado en t3.micro para el build del frontend)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 4. Configurar MySQL

```bash
sudo mysql_secure_installation
```

Entrar a MySQL y crear la base de datos:

```bash
sudo mysql
```

```sql
CREATE DATABASE habit_tracker;
CREATE USER 'constantly_user'@'localhost' IDENTIFIED BY 'TU_PASSWORD_SEGURA';
GRANT ALL PRIVILEGES ON habit_tracker.* TO 'constantly_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Clonar el repositorio

```bash
cd /var/www
sudo git clone https://github.com/TU_USUARIO/constantly.git constantly
sudo chown -R ubuntu:ubuntu /var/www/constantly
```

### 6. Inicializar la base de datos

```bash
mysql -u constantly_user -p habit_tracker < /var/www/constantly/database/schema.sql
mysql -u constantly_user -p habit_tracker < /var/www/constantly/database/init.sql
mysql -u constantly_user -p habit_tracker < /var/www/constantly/database/seed.sql
```

### 7. Configurar el backend

```bash
cd /var/www/constantly/backend
python3 -m venv venv
source venv/bin/activate
```

> Si hay errores de permisos con el venv:
> ```bash
> sudo python3 -m venv /var/www/constantly/backend/venv
> sudo chown -R ubuntu:ubuntu /var/www/constantly/backend/venv
> source /var/www/constantly/backend/venv/bin/activate
> ```

Instalar las dependencias manualmente:

```bash
pip install flask flask-jwt-extended flask-cors bcrypt mysql-connector-python gunicorn
```

Asegúrate de que `backend/db/connection.py` tiene las credenciales correctas de MySQL.

### 8. Configurar Gunicorn como servicio

```bash
sudo nano /etc/systemd/system/constantly.service
```

Contenido:

```ini
[Unit]
Description=Gunicorn instance for Constantly
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/constantly/backend
Environment="PATH=/var/www/constantly/backend/venv/bin"
ExecStart=/var/www/constantly/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Activar y arrancar:

```bash
sudo systemctl daemon-reload
sudo systemctl start constantly
sudo systemctl enable constantly
sudo systemctl status constantly
```

### 9. Construir el frontend

```bash
cd /var/www/constantly/frontend
npm install
npm run build
```

> El build genera la carpeta `frontend/build/`.

### 10. Configurar Apache

Habilitar módulos necesarios:

```bash
sudo a2enmod proxy proxy_http rewrite headers
```

Crear el VirtualHost:

```bash
sudo nano /etc/apache2/sites-available/constantly.conf
```

Contenido:

```apache
<VirtualHost *:80>
    ServerName TU_IP_PUBLICA

    DocumentRoot /var/www/constantly/frontend/build

    # Proxy al backend Flask/Gunicorn
    ProxyPreserveHost On
    ProxyPass /auth http://127.0.0.1:5000/auth
    ProxyPassReverse /auth http://127.0.0.1:5000/auth
    ProxyPass /users http://127.0.0.1:5000/users
    ProxyPassReverse /users http://127.0.0.1:5000/users
    ProxyPass /habits http://127.0.0.1:5000/habits
    ProxyPassReverse /habits http://127.0.0.1:5000/habits
    ProxyPass /progress http://127.0.0.1:5000/progress
    ProxyPassReverse /progress http://127.0.0.1:5000/progress

    <Directory /var/www/constantly/frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/constantly_error.log
    CustomLog ${APACHE_LOG_DIR}/constantly_access.log combined
</VirtualHost>
```

Activar el sitio y reiniciar Apache:

```bash
sudo a2dissite 000-default.conf
sudo a2ensite constantly.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
```

---

## Variables de entorno (frontend)

El frontend usa una variable de entorno para la URL del backend. Crea el archivo `.env.production` en `frontend/`:

```
REACT_APP_API_URL=http://TU_IP_PUBLICA
```

---

## Comandos útiles

```bash
# Ver estado del backend
sudo systemctl status constantly

# Ver logs del backend
sudo journalctl -u constantly -n 50

# Ver logs de Apache
sudo tail -f /var/log/apache2/constantly_error.log

# Reiniciar servicios
sudo systemctl restart constantly
sudo systemctl restart apache2
```