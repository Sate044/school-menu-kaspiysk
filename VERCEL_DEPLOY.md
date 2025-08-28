# 🚀 Развертывание на Vercel

## 📋 Подготовка завершена!

Ваш проект готов к развертыванию на Vercel. Все файлы оптимизированы и настроены.

## 🎯 Способы развертывания:

### **Способ 1: Через веб-интерфейс Vercel (Рекомендуется)**

1. **Перейдите на [vercel.com](https://vercel.com)**
2. **Зарегистрируйтесь** или войдите в аккаунт
3. **Нажмите "New Project"**
4. **Выберите "Browse all templates"** или **"Import Git Repository"**
5. **Загрузите папку Menu** (перетащите всю папку в браузер)
6. **Настройки проекта:**
   - **Project Name**: `school-menu-kaspiysk`
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (корень)
   - **Build Command**: оставьте пустым
   - **Output Directory**: `./` (корень)
7. **Нажмите "Deploy"**

### **Способ 2: Через Vercel CLI**

```bash
# Установите Vercel CLI
npm i -g vercel

# В папке Menu выполните:
cd /Users/user/Desktop/Menu
vercel

# Следуйте инструкциям:
# - Set up and deploy? Y
# - Which scope? Выберите ваш аккаунт
# - Link to existing project? N
# - Project name: school-menu-kaspiysk
# - In which directory is your code? ./
# - Want to override the settings? N
```

### **Способ 3: Через GitHub (если есть аккаунт)**

1. **Создайте репозиторий на GitHub**
2. **Загрузите файлы в репозиторий**
3. **Подключите GitHub к Vercel**
4. **Выберите репозиторий для развертывания**

## 📁 Файлы для развертывания:

### ✅ **Обязательные файлы:**
```
Menu/
├── index.html              ← Главная страница
├── styles.css              ← Стили
├── menu_data_embedded.js   ← Данные из Excel
├── json_loader.js          ← Загрузчик данных
├── script.js               ← Интерактивность
├── vercel.json             ← Конфигурация Vercel
└── package.json            ← Информация о проекте
```

### ❌ **Файлы НЕ для развертывания:**
- `excel_parser.py` и другие Python файлы
- `menu_data.json` файлы
- Markdown документация
- Excel файлы из папки `School Menu/`

## ⚙️ **Настройки Vercel:**

- **Build Command**: Не требуется (статический сайт)
- **Output Directory**: `./` (корень проекта)
- **Install Command**: Не требуется
- **Development Command**: `python3 -m http.server 3000`

## 🌐 **После развертывания:**

1. **Получите ссылку** типа: `https://school-menu-kaspiysk.vercel.app`
2. **Проверьте работу** всех функций
3. **Настройте домен** (по желанию)

## 🔧 **Если возникают проблемы:**

### **Ошибка 404:**
- Убедитесь, что `index.html` в корне проекта
- Проверьте настройки в `vercel.json`

### **Не загружаются стили:**
- Проверьте пути к файлам CSS и JS
- Убедитесь, что все файлы загружены

### **Не работают данные:**
- Данные встроены в `menu_data_embedded.js`
- Проверьте консоль браузера на ошибки

## 📞 **Поддержка:**

- **Документация Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Помощь**: [vercel.com/help](https://vercel.com/help)

---

## ✅ **Готово к развертыванию!**

**Просто перетащите папку Menu на [vercel.com](https://vercel.com) и ваш сайт будет онлайн!** 🎉
