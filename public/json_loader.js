/**
 * Загрузчик данных из JSON файла
 * Позволяет загружать меню из menu_data.json
 */

class JSONMenuLoader {
    constructor() {
        this.menuData = {};
        this.fallbackData = this.createFallbackData();
    }

    /**
     * Загружает данные из встроенного объекта или JSON файла
     */
    async loadMenuFromJSON() {
        try {
            console.log('🔄 Загрузка данных...');
            
            let data = null;
            
            // Сначала пытаемся использовать встроенные данные
            if (window.EMBEDDED_MENU_DATA) {
                console.log('✅ Используем встроенные данные из Excel файлов');
                data = window.EMBEDDED_MENU_DATA;
            } else {
                // Если встроенных данных нет, пытаемся загрузить JSON
                console.log('📥 Загружаем данные из JSON файла...');
                let response = await fetch('menu_data_accurate.json');
                if (!response.ok) {
                    response = await fetch('menu_data.json');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
            }
            
            // Проверяем, есть ли данные
            const hasData = Object.values(data).some(shift => 
                (shift.days && shift.days.length > 0) || 
                (shift.weeks && shift.weeks.length > 0)
            );
            
            if (hasData) {
                this.menuData = data;
                console.log('✅ Данные успешно загружены');
                console.log('📊 Первая смена, понедельник, завтрак:', 
                    data.first?.weeks?.[0]?.days?.[0]?.meals?.завтрак || 'Не найдено');
            } else {
                console.log('⚠️ Данные пусты');
                this.showError('Данные из Excel файлов не найдены');
                return;
            }
            
            // Обновляем отображение
            this.updateMenuDisplay();
            
        } catch (error) {
            console.log('❌ Ошибка загрузки:', error.message);
            this.showError('Ошибка загрузки данных: ' + error.message);
        }
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

            const shiftData = this.menuData[shiftType];
            
            // Поддерживаем и старый формат (days) и новый (weeks)
            if (shiftData.weeks && shiftData.weeks.length > 0) {
                // Новый формат с неделями
                shiftData.weeks.forEach(weekData => {
                    // Добавляем заголовок недели
                    const weekHeader = document.createElement('div');
                    weekHeader.className = 'week-header';
                    weekHeader.innerHTML = `<h2>Неделя ${weekData.week_number}</h2>`;
                    weekGrid.appendChild(weekHeader);
                    
                    // Добавляем дни недели
                    weekData.days.forEach(dayData => {
                        const dayCard = this.createDayCard(dayData);
                        weekGrid.appendChild(dayCard);
                    });
                });
            } else if (shiftData.days && shiftData.days.length > 0) {
                // Старый формат без недель
                shiftData.days.forEach(dayData => {
                    const dayCard = this.createDayCard(dayData);
                    weekGrid.appendChild(dayCard);
                });
            }
        });

        console.log('✅ Меню обновлено на странице');
        
        // Показываем уведомление
        this.showNotification('📊 Меню обновлено!', 'success');
    }

    /**
     * Создает HTML карточку дня
     */
    createDayCard(dayData) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';

        const mealsHTML = Object.entries(dayData.meals).map(([mealType, dishes]) => {
            const dishesHTML = dishes.map(dish => {
                // Проверяем, является ли dish объектом с калорийностью или просто строкой
                if (typeof dish === 'object' && dish.name) {
                    const caloriesText = dish.calories ? ` <span class="calories">(${dish.calories} ккал)</span>` : '';
                    return `<li>${dish.name}${caloriesText}</li>`;
                } else {
                    return `<li>${dish}</li>`;
                }
            }).join('');
            
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
            </div>
            <div class="meals">
                ${mealsHTML}
            </div>
        `;

        return dayCard;
    }

    /**
     * Создает резервные данные для демонстрации
     */
    createFallbackData() {
        return {
            first: {
                shift_type: 'first',
                shift_name: 'Первая смена',
                days: [
                    {
                        day: 'Понедельник',
                        date: '2 сентября',
                        meals: {
                            завтрак: [
                                {name: 'Каша овсяная молочная с маслом сливочным', calories: 180},
                                {name: 'Бутерброд с маслом сливочным', calories: 145},
                                {name: 'Чай с сахаром', calories: 35},
                                {name: 'Хлеб пшеничный', calories: 85}
                            ],
                            обед: [
                                {name: 'Борщ со сметаной', calories: 125},
                                {name: 'Котлета куриная паровая', calories: 210},
                                {name: 'Пюре картофельное', calories: 95},
                                {name: 'Салат из свежей капусты', calories: 45},
                                {name: 'Компот из сухофруктов', calories: 65},
                                {name: 'Хлеб ржаной', calories: 75}
                            ]
                        }
                    },
                    {
                        day: 'Вторник',
                        date: '3 сентября',
                        meals: {
                            завтрак: [
                                'Каша рисовая молочная с изюмом',
                                'Яйцо куриное вареное',
                                'Какао на молоке',
                                'Хлеб пшеничный с маслом'
                            ],
                            обед: [
                                'Суп гороховый с мясом',
                                'Рыба запеченная с овощами',
                                'Рис отварной рассыпчатый',
                                'Салат витаминный',
                                'Сок яблочный натуральный',
                                'Хлеб ржаной'
                            ]
                        }
                    },
                    {
                        day: 'Среда',
                        date: '4 сентября',
                        meals: {
                            завтрак: [
                                'Каша гречневая с молоком',
                                'Сосиска молочная отварная',
                                'Чай с лимоном и сахаром',
                                'Хлеб пшеничный'
                            ],
                            обед: [
                                'Щи из свежей капусты',
                                'Гуляш говяжий тушеный',
                                'Макароны отварные',
                                'Салат из моркови с яблоком',
                                'Кисель ягодный',
                                'Хлеб ржаной'
                            ]
                        }
                    },
                    {
                        day: 'Четверг',
                        date: '5 сентября',
                        meals: {
                            завтрак: [
                                'Омлет натуральный',
                                'Хлеб с джемом абрикосовым',
                                'Молоко пастеризованное',
                                'Масло сливочное'
                            ],
                            обед: [
                                'Суп куриный с домашней лапшой',
                                'Тефтели мясные в томатном соусе',
                                'Гречка отварная рассыпчатая',
                                'Салат из свежих огурцов',
                                'Компот из свежих яблок',
                                'Хлеб ржаной'
                            ]
                        }
                    },
                    {
                        day: 'Пятница',
                        date: '6 сентября',
                        meals: {
                            завтрак: [
                                'Каша пшенная молочная',
                                'Творог со сметаной',
                                'Чай с медом натуральным',
                                'Печенье овсяное'
                            ],
                            обед: [
                                'Солянка мясная сборная',
                                'Курица отварная диетическая',
                                'Картофель отварной с укропом',
                                'Салат из отварной свеклы',
                                'Морс клюквенный',
                                'Хлеб ржаной'
                            ]
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
                        date: '2 сентября',
                        meals: {
                            обед: [
                                'Суп овощной с брокколи',
                                'Котлеты рыбные паровые',
                                'Рис с овощами тушеными',
                                'Салат витаминный из капусты',
                                'Компот из сухофруктов',
                                'Хлеб ржаной'
                            ],
                            полдник: [
                                'Булочка с повидлом домашним',
                                'Молоко топленое',
                                'Яблоко свежее',
                                'Орехи грецкие'
                            ]
                        }
                    },
                    {
                        day: 'Вторник',
                        date: '3 сентября',
                        meals: {
                            обед: [
                                'Борщ украинский со сметаной',
                                'Котлета свиная на пару',
                                'Пюре картофельное с маслом',
                                'Салат из помидоров и огурцов',
                                'Сок апельсиновый натуральный',
                                'Хлеб ржаной'
                            ],
                            полдник: [
                                'Печенье овсяное домашнее',
                                'Йогурт натуральный',
                                'Банан спелый',
                                'Чай травяной'
                            ]
                        }
                    },
                    {
                        day: 'Среда',
                        date: '4 сентября',
                        meals: {
                            обед: [
                                'Рассольник с перловкой',
                                'Курица запеченная с травами',
                                'Гречка рассыпчатая с маслом',
                                'Салат из белокочанной капусты',
                                'Кисель вишневый',
                                'Хлеб ржаной'
                            ],
                            полдник: [
                                'Сырники творожные',
                                'Сметана домашняя',
                                'Чай с мятой',
                                'Мед цветочный'
                            ]
                        }
                    },
                    {
                        day: 'Четверг',
                        date: '5 сентября',
                        meals: {
                            обед: [
                                'Суп молочный с вермишелью',
                                'Биточки рыбные запеченные',
                                'Макароны твердых сортов',
                                'Салат огуречный с зеленью',
                                'Компот яблочный домашний',
                                'Хлеб ржаной'
                            ],
                            полдник: [
                                'Кекс домашний с изюмом',
                                'Какао на молоке',
                                'Яблоко запеченное',
                                'Корица молотая'
                            ]
                        }
                    },
                    {
                        day: 'Пятница',
                        date: '6 сентября',
                        meals: {
                            обед: [
                                'Щи кислые с мясом',
                                'Тефтели в сметанном соусе',
                                'Рис отварной с зеленью',
                                'Салат морковный с медом',
                                'Морс брусничный',
                                'Хлеб ржаной'
                            ],
                            полдник: [
                                'Запеканка творожная',
                                'Молоко пастеризованное',
                                'Груша свежая',
                                'Варенье домашнее'
                            ]
                        }
                    }
                ]
            }
        };
    }

    /**
     * Утилита для капитализации строки
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Показать ошибку
     */
    showError(message) {
        console.error('❌', message);
        
        // Показываем ошибку в интерфейсе
        const containers = document.querySelectorAll('.week-grid');
        containers.forEach(container => {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Ошибка загрузки данных</h3>
                    <p>${message}</p>
                    <p>Проверьте консоль браузера для подробностей.</p>
                </div>
            `;
        });
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        // Используем функцию из excel_reader.js если она доступна
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Глобальный экземпляр загрузчика
window.jsonLoader = new JSONMenuLoader();

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Небольшая задержка чтобы дать время другим скриптам загрузиться
    setTimeout(() => {
        window.jsonLoader.loadMenuFromJSON();
    }, 500);
});
