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
            const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
            
            // Если открыто напрямую через file:// — используем встроенные данные, чтобы избежать CORS
            if (isFileProtocol && window.EMBEDDED_MENU_DATA) {
                console.log('📁 Запуск через file:// — используем EMBEDDED_MENU_DATA');
                data = window.EMBEDDED_MENU_DATA;
            } else {
                // Приоритет: menu_data.json -> menu_data_accurate.json -> EMBEDDED_MENU_DATA
                console.log('📥 Пробуем загрузить menu_data.json...');
                try {
                    let response = await fetch(`menu_data.json?ts=${Date.now()}`);
                    if (!response.ok) {
                        console.log('⚠️ menu_data.json недоступен, пробуем menu_data_accurate.json...');
                        response = await fetch(`menu_data_accurate.json?ts=${Date.now()}`);
                    }
                    if (response.ok) {
                        data = await response.json();
                    } else if (window.EMBEDDED_MENU_DATA) {
                        console.log('ℹ️ Используем встроенные данные EMBEDDED_MENU_DATA как запасной вариант');
                        data = window.EMBEDDED_MENU_DATA;
                    } else {
                        throw new Error(`Не удалось загрузить данные (HTTP ${response.status})`);
                    }
                } catch (e) {
                    // Ошибка сети/протокола — пробуем встроенные данные
                    if (window.EMBEDDED_MENU_DATA) {
                        console.log('🌐 Ошибка fetch, используем EMBEDDED_MENU_DATA как запасной вариант');
                        data = window.EMBEDDED_MENU_DATA;
                    } else {
                        throw e;
                    }
                }
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
            // Всегда показываем плоский список дней по датам (без недель)
            let days = [];
            if (Array.isArray(shiftData?.weeks) && shiftData.weeks.length > 0) {
                shiftData.weeks.forEach(week => {
                    if (Array.isArray(week.days)) {
                        days.push(...week.days);
                    }
                });
            } else if (Array.isArray(shiftData?.days)) {
                days = shiftData.days.slice();
            }

            // Сортировка по дате, если возможно
            const parseDateKey = (d) => {
                const raw = (d?.date || '').toString().trim().toLowerCase();
                // Попытка распознать d.m(.yyyy)
                const m1 = raw.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
                if (m1) {
                    const day = parseInt(m1[1], 10);
                    const mon = parseInt(m1[2], 10);
                    const year = m1[3] ? parseInt(m1[3], 10) : 0;
                    return year * 10000 + mon * 100 + day;
                }
                // d month
                const months = ['янв','фев','мар','апр','ма','июн','июл','авг','сен','сент','окт','ноя','нояб','дек'];
                const m2 = raw.match(/^(\d{1,2})\s+([а-я.]+)(?:\s+(\d{4}))?$/i);
                if (m2) {
                    const day = parseInt(m2[1], 10);
                    const monTxt = m2[2].replace('.', '');
                    const year = m2[3] ? parseInt(m2[3], 10) : 0;
                    let monIdx = months.findIndex(m => monTxt.startsWith(m));
                    if (monIdx >= 0) {
                        // нормализуем: 'ма' для мая конфликтует с 'май/мая', компенсируем
                        if (monTxt.startsWith('ма') && monTxt.length > 2) {
                            monIdx = 4; // май
                        }
                        const mon = [1,2,3,4,5,6,7,8,9,9,10,11,11][monIdx] || 0;
                        return year * 10000 + mon * 100 + day;
                    }
                }
                // iso yyyy-mm-dd
                const m3 = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (m3) {
                    return parseInt(m3[1], 10) * 10000 + parseInt(m3[2], 10) * 100 + parseInt(m3[3], 10);
                }
                // Фоллбек — оставляем порядок как есть
                return Number.MAX_SAFE_INTEGER;
            };

            // Сортировка по дням недели (для случаев без дат, например корпоративное меню)
            const dayOrder = {
                'понедельник': 1,
                'вторник': 2,
                'среда': 3,
                'четверг': 4,
                'пятница': 5,
                'суббота': 6,
                'воскресенье': 7
            };
            const getDayOrder = (d) => {
                const dayName = (d?.day || '').toLowerCase();
                return dayOrder[dayName] || 999;
            };

            // Сначала сортируем по дате, если даты есть
            days.sort((a, b) => {
                const dateA = parseDateKey(a);
                const dateB = parseDateKey(b);
                // Если оба без дат, применяем специальную логику
                if (dateA === Number.MAX_SAFE_INTEGER && dateB === Number.MAX_SAFE_INTEGER) {
                    // Для корпоративного меню сортируем по дням недели (7-дневная неделя)
                    if (shiftType === 'corporate') {
                        return getDayOrder(a) - getDayOrder(b);
                    }
                    // Для остальных меню без дат сохраняем исходный порядок (не сортируем)
                    return 0;
                }
                // Иначе сортируем по дате
                return dateA - dateB;
            });

            // Группировка по неделям: новая неделя начинается с Понедельника
            let groups = [];
            let currentGroup = [];
            let weekIndex = 0;
            const flushGroup = () => {
                if (currentGroup.length > 0) {
                    // Заголовок недели (жирный)
                    const weekHeader = document.createElement('div');
                    weekHeader.className = 'week-header';
                    weekIndex += 1;
                    weekHeader.innerHTML = `<strong>Неделя ${weekIndex}</strong>`;
                    weekGrid.appendChild(weekHeader);
                    currentGroup.forEach(d => {
                        const dayCard = this.createDayCard(d);
                        weekGrid.appendChild(dayCard);
                    });
                    currentGroup = [];
                }
            };

            days.forEach(d => {
                const isMonday = (d?.day || '').toLowerCase() === 'понедельник';
                if (isMonday && currentGroup.length > 0) {
                    flushGroup();
                }
                currentGroup.push(d);
            });
            flushGroup();
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
            // Фильтруем паразитные элементы, попавшие из Excel (названия листов и сводных таблиц)
            const blacklistSubstrings = [
                'примерное меню и пищевая ценность приготовляемых блюд',
                'лист 6',
                'лист 5',
                'среднее значение за период',
                'содержание белков, жиров, углеводов в меню за период'
            ];
            const isBlacklisted = (text) => {
                if (!text) return false;
                const normalized = String(text).toLowerCase().trim();
                return blacklistSubstrings.some(fragment => normalized.includes(fragment));
            };
            
            const visibleDishes = (Array.isArray(dishes) ? dishes : [])
                .filter(dish => {
                    const text = (typeof dish === 'object' && dish?.name) ? dish.name : dish;
                    if (!text || !String(text).trim()) return false;
                    return !isBlacklisted(text);
                })
                .map(dish => {
                    if (typeof dish === 'object' && dish.name) {
                        return {
                            name: dish.name,
                            grams: dish.grams
                        };
                    }
                    return {
                        name: String(dish).trim()
                    };
                });

            // Не показываем прием пищи, если в нем нет валидных блюд
            if (visibleDishes.length === 0) {
                return '';
            }

            const dishesHTML = visibleDishes
                .map(dish => {
                    const gramsText = dish.grams ? ` <span class="grams">(${dish.grams} г)</span>` : '';
                    return `<li>${dish.name}${gramsText}</li>`;
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
                ${dayData.date ? `<span class="date">${dayData.date}</span>` : ''}
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
