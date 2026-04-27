# [Docker Deployment] Implementation Plan

> **For Claude:** Ручное выполнение по шагам в текущей сессии

**Goal:** Перенести деплой с FTP на Docker контейнер на VPS

**Architecture:** GitHub Actions → Docker Registry → VPS (docker-compose up)

**Tech Stack:** GitHub Actions, Docker, Docker Compose, VPS

---

## Task 1: Создать Docker Registry для образов

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Добавить login to registry**

Измени deploy-prod job, добавив шаги:
```yaml
- name: Login to Docker Registry
  run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
```

**Step 2: Изменить deploy-prod job для build & push**

Вместо `npm run generate` + FTP:
```yaml
- name: Build and push Docker image
  run: |
        docker build -f Dockerfile.prod -t registry.kapralov.ru/nuxt-app:${{ github.sha }} .
        docker push registry.kapralov.ru/nuxt-app:${{ github.sha }}
```

**Step 3: Удалить FTP деплой**

Удали шаг с SamKirkland/FTP-Deploy-Action.

---

### Task 2: Настроить VPS для Docker

**Files:**
- Create: `docker-compose.prod.yml` на VPS

**Step 1: SSH подключение к VPS**

```bash
ssh user@vps-server
```

**Step 2: Установка Docker**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**Step 3: Создать docker-compose.prod.yml**

```yaml
version: '3.8'
services:
  nuxt-app:
    image: registry.kapralov.ru/nuxt-app:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Step 4: Тестирование локально**

Сначала протестируй docker-compose.prod.yml локально.

---

### Task 3: Обновить GitHub Secrets

**Files:**
- Modify: GitHub repository settings

**Step 1: Добавить DOCKER_USERNAME secret**

В GitHub Settings → Secrets and variables → New repository secret:
- Name: `DOCKER_USERNAME`
- Value: твой логин для Docker registry

**Step 2: Добавить DOCKER_PASSWORD secret**

- Name: `DOCKER_PASSWORD`
- Value: твой пароль для Docker registry

**Step 3: Добавить DOCKER_REGISTRY secret**

- Name: `DOCKER_REGISTRY`
- Value: `registry.kapralov.ru` (или другой registry)

---

### Task 4: Настроить CI/CD для Docker

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Изменить test job**

Обнови npm команды на актуальные:
```yaml
- name: Install dependencies
  run: npm ci
```

**Step 2: Обновить deploy-prod job**

Полностью замени deploy-prod job для Docker:

```yaml
deploy-prod:
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/prod'
  environment: production
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Docker Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ secrets.DOCKER_REGISTRY }}
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.prod
        push: true
        tags: ${{ secrets.DOCKER_REGISTRY }}/nuxt-app:${{ github.sha }}
```

**Step 3: Тестирование workflow**

Создай test pull request или протестируй в ветке testing.

---

### Task 5: Деплой и проверка

**Files:**
- No files needed

**Step 1: Push в main/prod branch**

```bash
git checkout prod
git merge main
git push origin prod
```

**Step 2: Проверь GitHub Actions**

Зайди в GitHub Actions и проверь что workflow прошел успешно.

**Step 3: SSH на VPS и запусти docker-compose**

```bash
ssh user@vps-server
cd /path/to/project
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

**Step 4: Проверь доступность сайта**

Открой https://kalashyulya.ru в браузере и проверь что сайт работает.

---

## Порядок выполнения

1. **Начни с Task 1** - измени deploy.yml для Docker registry
2. **Продолжай к Task 2** - настрой VPS
3. **Затем Task 3** - добавь secrets
4. **Дальше Task 4** - обнови CI/CD
5. **Закончи Task 5** - деплой и проверка

---

## Важные моменты

- **Не пропускай шаги** - каждый step важен для следующего
- **Тестируй перед деплоем** - локальное тестирование предотвратит проблемы
- **Сохраня secrets безопасно** - не коммить их в репозиторий
- **Проверя результаты после каждого шага** - это сэкономит время
- **Создавай ветку testing** - для тестирования CI/CD изменений
