/**
 * Веб-версия парсера Excel файлов для школьного меню
 * Использует библиотеку SheetJS для чтения Excel файлов в браузере
 */

class ExcelMenuParser {
    constructor() {
        this.menuData = {};
        this.isLoading = false;
    }

    /**
     * Загружает и парсит Excel файлы
     */
    async loadExcelFiles() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingMessage();

        try {
            // Пытаемся загрузить оба файла
            const files = [
                'School Menu/Меню_на_1_4_классы_Каспийск_ноябрь_первая_смена_1,2,3,4,6,7,8.xls',
                'School Menu/Меню_на_1_4_классы_Каспийск_ноябрь_вторая_смена.xls'
            ];

            for (const filePath of files) {
                try {
                    const response = await fetch(filePath);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        
                        const shiftType = filePath.includes('первая') ? 'first' : 'second';
                        this.menuData[shiftType] = this.parseWorkbook(workbook, shiftType);
                        
                        console.log(`✅ Загружен файл: ${filePath}`);
                    } else {
                        console.warn(`⚠️ Не удалось загрузить: ${filePath}`);
                    }
                } catch (error) {
                    console.error(`❌ Ошибка загрузки ${filePath}:`, error);
                }
            }

            // Если не удалось загрузить файлы, используем примерные данные
            if (Object.keys(this.menuData).length === 0) {
                console.log('📝 Используем примерные данные');
                this.menuData = this.createSampleData();
            }

            // Обновляем интерфейс
            this.updateMenuDisplay();
            
        } catch (error) {
            console.error('❌ Общая ошибка загрузки:', error);
            this.menuData = this.createSampleData();
            this.updateMenuDisplay();
        } finally {
            this.isLoading = false;
            this.hideLoadingMessage();
        }
    }

    /**
     * Парсит Excel workbook
     */
    parseWorkbook(workbook, shiftType) {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const menuData = {
            shift_type: shiftType,
            shift_name: shiftType === 'first' ? 'Первая смена' : 'Вторая смена',
            days: []
        };

        const daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
        const mealTypes = ['завтрак', 'обед', 'полдник', 'ужин'];
        
        let currentDay = null;
        let currentDate = null;
        let currentMeals = {};
        let currentMealType = null;

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const cellText = String(row[0] || '').toLowerCase().trim();
            if (!cellText || cellText === 'undefined') continue;

            // Ищем день недели
            const foundDay = daysOfWeek.find(day => cellText.includes(day));
            if (foundDay) {
                // Сохраняем предыдущий день
                if (currentDay && Object.keys(currentMeals).length > 0) {
                    menuData.days.push({
                        day: this.capitalize(currentDay),
                        date: currentDate || '',
                        meals: { ...currentMeals }
                    });
                }

                currentDay = foundDay;
                currentMeals = {};
                currentMealType = null;

                // Извлекаем дату
                const dateMatch = String(row[0]).match(/\d{1,2}[.\-/]\d{1,2}/);
                currentDate = dateMatch ? dateMatch[0] : '';
                continue;
            }

            // Ищем тип приема пищи
            const foundMealType = mealTypes.find(meal => cellText.includes(meal));
            if (foundMealType) {
                currentMealType = foundMealType;
                if (!currentMeals[currentMealType]) {
                    currentMeals[currentMealType] = [];
                }
                continue;
            }

            // Добавляем блюдо
            if (currentMealType && cellText.length > 2) {
                // Очищаем текст блюда
                const dish = String(row[0]).trim()
                    .replace(/^\d+\.?\s*/, '') // Убираем номера
                    .replace(/\s+/g, ' '); // Нормализуем пробелы
                
                if (dish && dish !== 'undefined' && !dish.match(/^[.\-\s]*$/)) {
                    currentMeals[currentMealType].push(dish);
                }
            }
        }

        // Добавляем последний день
        if (currentDay && Object.keys(currentMeals).length > 0) {
            menuData.days.push({
                day: this.capitalize(currentDay),
                date: currentDate || '',
                meals: { ...currentMeals }
            });
        }

        return menuData;
    }

    /**
     * Обновляет отображение меню на странице
     */
    updateMenuDisplay() {
        Object.keys(this.menuData).forEach(shiftType => {
            const container = document.getElementById(`${shiftType}-shift`);
            if (!container) return;

            const weekGrid = container.querySelector('.week-grid');
            if (!weekGrid) return;

            // Очищаем текущий контент
            weekGrid.innerHTML = '';

            // Добавляем дни из данных
            this.menuData[shiftType].days.forEach(dayData => {
                const dayCard = this.createDayCard(dayData);
                weekGrid.appendChild(dayCard);
            });
        });

        console.log('✅ Меню обновлено на странице');
    }

    /**
     * Создает HTML карточку дня
     */
    createDayCard(dayData) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';

        const mealsHTML = Object.entries(dayData.meals).map(([mealType, dishes]) => {
            const dishesHTML = dishes.map(dish => `<li>${dish}</li>`).join('');
            return `
                <div class="meal">
                    <h4 class="meal-type">${this.capitalize(mealType)}</h4>
                    <ul class="meal-items">
                        ${dishesHTML}
                    </ul>
                </div>
            `;
        }).join('');

        dayCard.innerHTML = `
            <div class="day-header">
                <h3>${dayData.day}</h3>
                <span class="date">${dayData.date}</span>
            </div>
            <div class="meals">
                ${mealsHTML}
            </div>
        `;

        return dayCard;
    }

    /**
     * Создает примерные данные
     */
    createSampleData() {
        return {
            first: {
                shift_type: 'first',
                shift_name: 'Первая смена',
                days: [
                    {
                        day: 'Понедельник',
                        date: '2.09',
                        meals: {
                            завтрак: ['Каша овсяная молочная', 'Бутерброд с маслом', 'Чай с сахаром'],
                            обед: ['Борщ со сметаной', 'Котлета куриная', 'Пюре картофельное', 'Салат из капусты', 'Компот из сухофруктов']
                        }
                    },
                    {
                        day: 'Вторник',
                        date: '3.09',
                        meals: {
                            завтрак: ['Каша рисовая молочная', 'Яйцо вареное', 'Какао'],
                            обед: ['Суп гороховый', 'Рыба запеченная', 'Рис отварной', 'Салат овощной', 'Сок яблочный']
                        }
                    },
                    {
                        day: 'Среда',
                        date: '4.09',
                        meals: {
                            завтрак: ['Каша гречневая', 'Сосиска', 'Чай с лимоном'],
                            обед: ['Щи из свежей капусты', 'Гуляш говяжий', 'Макароны отварные', 'Салат морковный', 'Кисель ягодный']
                        }
                    },
                    {
                        day: 'Четверг',
                        date: '5.09',
                        meals: {
                            завтрак: ['Омлет', 'Хлеб с джемом', 'Молоко'],
                            обед: ['Суп куриный с лапшой', 'Тефтели мясные', 'Гречка отварная', 'Салат из огурцов', 'Компот из яблок']
                        }
                    },
                    {
                        day: 'Пятница',
                        date: '6.09',
                        meals: {
                            завтрак: ['Каша пшенная', 'Творожок', 'Чай с медом'],
                            обед: ['Солянка мясная', 'Курица отварная', 'Картофель отварной', 'Салат свекольный', 'Морс клюквенный']
                        }
                    }
                ]
            },
            second: {
                shift_type: 'second',
                shift_name: 'Вторая смена',
                days: [
                    {
                        day: 'Понедельник',
                        date: '2.09',
                        meals: {
                            обед: ['Суп овощной', 'Рыбные котлеты', 'Рис с овощами', 'Салат витаминный', 'Компот из сухофруктов'],
                            полдник: ['Булочка с повидлом', 'Молоко', 'Фрукты']
                        }
                    },
                    {
                        day: 'Вторник',
                        date: '3.09',
                        meals: {
                            обед: ['Борщ украинский', 'Котлета свиная', 'Пюре картофельное', 'Салат из помидоров', 'Сок апельсиновый'],
                            полдник: ['Печенье овсяное', 'Йогурт', 'Банан']
                        }
                    },
                    {
                        day: 'Среда',
                        date: '4.09',
                        meals: {
                            обед: ['Суп рассольник', 'Курица запеченная', 'Гречка с маслом', 'Салат капустный', 'Кисель вишневый'],
                            полдник: ['Сырники', 'Сметана', 'Чай']
                        }
                    },
                    {
                        day: 'Четверг',
                        date: '5.09',
                        meals: {
                            обед: ['Суп молочный', 'Биточки рыбные', 'Макароны отварные', 'Салат огуречный', 'Компот яблочный'],
                            полдник: ['Кекс домашний', 'Какао', 'Яблоко']
                        }
                    },
                    {
                        day: 'Пятница',
                        date: '6.09',
                        meals: {
                            обед: ['Щи кислые', 'Тефтели в соусе', 'Рис отварной', 'Салат морковный', 'Морс брусничный'],
                            полдник: ['Запеканка творожная', 'Молоко', 'Груша']
                        }
                    }
                ]
            }
        };
    }

    /**
     * Показывает сообщение загрузки
     */
    showLoadingMessage() {
        const existing = document.querySelector('.excel-loading');
        if (existing) existing.remove();

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'excel-loading';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Загружаем данные из Excel файлов...</p>
            </div>
        `;

        const styles = `
            .excel-loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 248, 243, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .excel-loading .loading-content {
                text-align: center;
                color: var(--primary-brown);
            }
            
            .excel-loading .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid var(--light-orange);
                border-top: 4px solid var(--primary-orange);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
        `;

        if (!document.querySelector('#excel-loading-styles')) {
            const style = document.createElement('style');
            style.id = 'excel-loading-styles';
            style.textContent = styles;
            document.head.appendChild(style);
        }

        document.body.appendChild(loadingDiv);
    }

    /**
     * Скрывает сообщение загрузки
     */
    hideLoadingMessage() {
        const loadingDiv = document.querySelector('.excel-loading');
        if (loadingDiv) {
            loadingDiv.style.opacity = '0';
            setTimeout(() => loadingDiv.remove(), 300);
        }
    }

    /**
     * Утилита для капитализации строки
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Сохраняет данные в JSON файл (для разработки)
     */
    downloadAsJSON() {
        const dataStr = JSON.stringify(this.menuData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'menu_data.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Глобальный экземпляр парсера
window.excelParser = new ExcelMenuParser();

// Автоматическая загрузка при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем загрузки библиотеки SheetJS
    if (typeof XLSX !== 'undefined') {
        window.excelParser.loadExcelFiles();
    } else {
        // Если библиотека не загружена, используем примерные данные
        console.log('📚 SheetJS не найден, используем примерные данные');
        window.excelParser.menuData = window.excelParser.createSampleData();
        window.excelParser.updateMenuDisplay();
    }

    // Настраиваем загрузку файлов
    setupFileUpload();
});

/**
 * Настройка загрузки файлов
 */
function setupFileUpload() {
    const fileInput = document.getElementById('excel-upload');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                processUploadedFiles(files);
            }
        });
    }

    // Drag and drop для всей страницы
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
        document.body.style.background = 'linear-gradient(135deg, #FFDBCC 0%, #FFB366 100%)';
    });

    document.addEventListener('dragleave', function(e) {
        if (e.clientX === 0 && e.clientY === 0) {
            document.body.style.background = '';
        }
    });

    document.addEventListener('drop', function(e) {
        e.preventDefault();
        document.body.style.background = '';
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.name.endsWith('.xls') || file.name.endsWith('.xlsx')
        );
        
        if (files.length > 0) {
            processUploadedFiles(files);
        } else {
            alert('Пожалуйста, загрузите Excel файлы (.xls или .xlsx)');
        }
    });
}

/**
 * Обработка загруженных файлов
 */
async function processUploadedFiles(files) {
    window.excelParser.showLoadingMessage();
    
    try {
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Определяем тип смены из имени файла
            const fileName = file.name.toLowerCase();
            const shiftType = fileName.includes('первая') ? 'first' : 'second';
            
            window.excelParser.menuData[shiftType] = window.excelParser.parseWorkbook(workbook, shiftType);
            
            console.log(`✅ Обработан файл: ${file.name}`);
        }
        
        // Обновляем отображение
        window.excelParser.updateMenuDisplay();
        
        // Показываем уведомление об успехе
        showNotification('✅ Файлы успешно загружены и обработаны!', 'success');
        
    } catch (error) {
        console.error('❌ Ошибка обработки файлов:', error);
        showNotification('❌ Ошибка при обработке файлов', 'error');
    } finally {
        window.excelParser.hideLoadingMessage();
    }
}

/**
 * Показать уведомление
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const styles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .notification-success {
            background: linear-gradient(135deg, #28a745, #20c997);
        }
        
        .notification-error {
            background: linear-gradient(135deg, #dc3545, #fd7e14);
        }
        
        .notification-info {
            background: linear-gradient(135deg, var(--primary-orange), var(--secondary-orange));
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = styles;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
