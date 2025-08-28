# 🚀 Развертывание через GitHub + Vercel

## 📋 Git репозиторий готов!

Ваш проект уже инициализирован как Git репозиторий и готов к загрузке на GitHub.

## 🔧 **Шаг 1: Создайте репозиторий на GitHub**

1. **Откройте [github.com](https://github.com)**
2. **Войдите в аккаунт** или зарегистрируйтесь
3. **Нажмите "New repository"** (зеленая кнопка)
4. **Заполните данные:**
   - **Repository name**: `school-menu-kaspiysk`
   - **Description**: `Школьное меню для 1-4 классов г. Каспийск`
   - **Public** (рекомендуется для бесплатного Vercel)
   - **НЕ** ставьте галочки на README, .gitignore, license (у нас уже есть)
5. **Нажмите "Create repository"**

## 📤 **Шаг 2: Загрузите код на GitHub**

После создания репозитория GitHub покажет команды. Выполните в терминале:

```bash
# Перейдите в папку проекта (если не там)
cd /Users/user/Desktop/Menu

# Добавьте удаленный репозиторий (замените YOUR_USERNAME на ваш логин)
git remote add origin https://github.com/YOUR_USERNAME/school-menu-kaspiysk.git

# Загрузите код
git branch -M main
git push -u origin main
```

**Замените `YOUR_USERNAME` на ваш логин GitHub!**

## 🌐 **Шаг 3: Подключите к Vercel**

1. **Откройте [vercel.com](https://vercel.com)**
2. **Войдите через GitHub** (или создайте аккаунт)
3. **Нажмите "New Project"**
4. **Выберите "Import Git Repository"**
5. **Найдите репозиторий** `school-menu-kaspiysk`
6. **Нажмите "Import"**
7. **Настройки проекта:**
   - **Project Name**: `school-menu-kaspiysk`
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (по умолчанию)
   - **Build Command**: оставьте пустым
   - **Output Directory**: `./` (по умолчанию)
8. **Нажмите "Deploy"**

## ✅ **Готово!**

Через 1-2 минуты получите ссылку типа:
`https://school-menu-kaspiysk.vercel.app`

## 🔄 **Автоматические обновления**

Теперь при любых изменениях в GitHub репозитории Vercel автоматически пересоберет сайт!

## 📝 **Если нужно обновить данные:**

1. **Измените файлы локально**
2. **Выполните:**
   ```bash
   git add .
   git commit -m "Обновление меню"
   git push
   ```
3. **Vercel автоматически обновит сайт**

## 🆘 **Альтернативный способ (если нет Git):**

1. **Создайте ZIP архив** папки Menu
2. **Загрузите на GitHub** через веб-интерфейс
3. **Подключите к Vercel**

---

## 🎯 **Команды для копирования:**

```bash
# В папке /Users/user/Desktop/Menu выполните:
git remote add origin https://github.com/YOUR_USERNAME/school-menu-kaspiysk.git
git branch -M main  
git push -u origin main
```

**Не забудьте заменить `YOUR_USERNAME` на ваш логин GitHub!**

---

## 🎉 **Результат:**

После развертывания получите красивый сайт с:
- ✅ Точными данными из Excel
- ✅ Калорийностью блюд
- ✅ 2 неделями меню
- ✅ Адаптивным дизайном
- ✅ Автоматическими обновлениями
