# Примеры конфигурации деплоя

Этот файл содержит примеры различных способов деплоя на виртуальный хостинг.

## 1. FTP/SFTP деплой

Замените секцию "Deploy to hosting" в deploy.yml на:

```yaml
- name: Deploy via FTP
  uses: SamKirkland/FTP-Deploy-Action@4.3.4
  with:
    server: ${{ secrets.FTP_SERVER }}
    username: ${{ secrets.FTP_USERNAME }}
    password: ${{ secrets.FTP_PASSWORD }}
    local-dir: .output/public/
    server-dir: /public_html/
```

## 2. SSH деплой

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.HOST_IP }}
    username: ${{ secrets.HOST_USERNAME }}
    key: ${{ secrets.HOST_SSH_KEY }}
    script: |
      cd /var/www/html
      rm -rf *
      # Затем скопируйте файлы из .output/public/
```

## 3. RSYNC деплой

```yaml
- name: Deploy via RSYNC
  uses: burnett01/rsync-deployments@6.0.0
  with:
    switches: -avzr --delete
    path: .output/public/
    remote_path: /var/www/html/
    remote_host: ${{ secrets.HOST_IP }}
    remote_user: ${{ secrets.HOST_USERNAME }}
    remote_key: ${{ secrets.HOST_SSH_KEY }}
```

## Необходимые GitHub Secrets

Добавьте следующие секреты в настройках репозитория (Settings > Secrets and variables > Actions):

### Для FTP:

- `FTP_SERVER` - адрес FTP сервера
- `FTP_USERNAME` - имя пользователя FTP
- `FTP_PASSWORD` - пароль FTP

### Для SSH/RSYNC:

- `HOST_IP` - IP адрес сервера
- `HOST_USERNAME` - имя пользователя на сервере
- `HOST_SSH_KEY` - приватный SSH ключ

## Структура проекта после сборки

После выполнения `npm run build` файлы будут в папке `.output/public/`:

```
.output/
└── public/
    ├── index.html
    ├── _nuxt/
    │   ├── [hash].js
    │   ├── [hash].css
    │   └── ...
    └── [другие статические файлы]
```

Именно содержимое папки `public/` нужно загружать на хостинг.
