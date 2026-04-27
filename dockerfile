# Dockerfile для dev окружения
FROM node:20-alpine

# Устанавливаем Рабочую Директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Открываем порт 3000
EXPOSE 3000

# Запускаем dev server
CMD [ "npm", "run", "dev" ]