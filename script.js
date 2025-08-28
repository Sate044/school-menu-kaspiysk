// Функциональность переключения между сменами
document.addEventListener('DOMContentLoaded', function() {
    const shiftButtons = document.querySelectorAll('.shift-btn');
    const menuContainers = document.querySelectorAll('.menu-container');
    
    // Функция переключения смен
    function switchShift(targetShift) {
        // Убираем активный класс с всех кнопок
        shiftButtons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс к выбранной кнопке
        document.querySelector(`[data-shift="${targetShift}"]`).classList.add('active');
        
        // Скрываем все контейнеры меню
        menuContainers.forEach(container => {
            container.classList.add('hidden');
        });
        
        // Показываем выбранный контейнер с анимацией
        setTimeout(() => {
            document.getElementById(`${targetShift}-shift`).classList.remove('hidden');
        }, 150);
    }
    
    // Обработчики событий для кнопок смен
    shiftButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetShift = this.getAttribute('data-shift');
            switchShift(targetShift);
            
            // Сохраняем выбор пользователя в localStorage
            localStorage.setItem('selectedShift', targetShift);
        });
    });
    
    // Восстанавливаем последний выбор пользователя
    const savedShift = localStorage.getItem('selectedShift');
    if (savedShift) {
        switchShift(savedShift);
    }
    
    // Добавляем анимации при загрузке страницы
    const dayCards = document.querySelectorAll('.day-card');
    
    // Функция для анимации появления карточек
    function animateCards() {
        dayCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Запускаем анимацию после загрузки
    setTimeout(animateCards, 500);
    
    // Добавляем интерактивность к элементам меню
    const mealItems = document.querySelectorAll('.meal-items li');
    
    mealItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Добавляем эффект параллакса для заголовка
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        header.style.transform = `translateY(${parallax}px)`;
    });
    
    // Функция для плавной прокрутки
    function smoothScroll(target) {
        document.querySelector(target).scrollIntoView({
            behavior: 'smooth'
        });
    }
    
    // Добавляем функциональность поиска по меню
    function addSearchFunctionality() {
        // Создаем поле поиска
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="menu-search" placeholder="Поиск по меню..." class="search-input">
            <button class="search-clear" id="clear-search">✕</button>
        `;
        
        // Добавляем стили для поиска
        const searchStyles = `
            .search-container {
                position: relative;
                max-width: 400px;
                margin: 0 auto 30px;
            }
            
            .search-input {
                width: 100%;
                padding: 15px 50px 15px 20px;
                border: 2px solid var(--light-orange);
                border-radius: 25px;
                font-size: 16px;
                background: var(--white);
                color: var(--text-dark);
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                outline: none;
                border-color: var(--primary-orange);
                box-shadow: 0 0 15px rgba(255, 140, 66, 0.2);
            }
            
            .search-clear {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 18px;
                color: var(--text-light);
                cursor: pointer;
                padding: 5px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .search-clear.visible {
                opacity: 1;
            }
            
            .search-clear:hover {
                color: var(--primary-orange);
            }
            
            .meal-items li.highlighted {
                background: var(--light-orange);
                padding: 8px 12px;
                margin: 2px 0;
                border-radius: 8px;
                font-weight: 500;
            }
        `;
        
        // Добавляем стили в head
        const style = document.createElement('style');
        style.textContent = searchStyles;
        document.head.appendChild(style);
        
        // Вставляем поиск после переключателя смен
        const shiftSelector = document.querySelector('.shift-selector');
        shiftSelector.insertAdjacentElement('afterend', searchContainer);
        
        // Функциональность поиска
        const searchInput = document.getElementById('menu-search');
        const clearButton = document.getElementById('clear-search');
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            // Показываем/скрываем кнопку очистки
            if (searchTerm) {
                clearButton.classList.add('visible');
            } else {
                clearButton.classList.remove('visible');
            }
            
            // Поиск по меню
            const allMealItems = document.querySelectorAll('.meal-items li');
            
            allMealItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (searchTerm === '' || text.includes(searchTerm)) {
                    item.style.display = 'block';
                    if (searchTerm && text.includes(searchTerm)) {
                        item.classList.add('highlighted');
                    } else {
                        item.classList.remove('highlighted');
                    }
                } else {
                    item.style.display = 'none';
                    item.classList.remove('highlighted');
                }
            });
        });
        
        // Очистка поиска
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });
    }
    
    // Добавляем поиск после загрузки страницы
    setTimeout(addSearchFunctionality, 1000);
    
    // Добавляем уведомление о загрузке
    function showLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Загружаем вкусное меню...</p>
            </div>
        `;
        
        const loadingStyles = `
            .loading-message {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 248, 243, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeOut 2s ease forwards 1s;
            }
            
            .loading-content {
                text-align: center;
                color: var(--primary-brown);
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid var(--light-orange);
                border-top: 4px solid var(--primary-orange);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    visibility: hidden;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = loadingStyles;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingDiv);
        
        // Удаляем загрузочное сообщение через 3 секунды
        setTimeout(() => {
            loadingDiv.remove();
        }, 3000);
    }
    
    // Показываем загрузку только при первом посещении
    if (!localStorage.getItem('visited')) {
        showLoadingMessage();
        localStorage.setItem('visited', 'true');
    }
});

// Дополнительные утилиты
class MenuManager {
    constructor() {
        this.currentShift = 'first';
        this.menuData = {};
    }
    
    // Метод для загрузки данных из Excel (для будущего использования)
    async loadMenuData(excelFile) {
        try {
            // Здесь будет код для парсинга Excel файла
            console.log('Загрузка данных из Excel файла:', excelFile);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
    
    // Метод для обновления меню
    updateMenu(shiftType, menuData) {
        this.menuData[shiftType] = menuData;
        this.renderMenu(shiftType);
    }
    
    // Метод для рендеринга меню
    renderMenu(shiftType) {
        const container = document.getElementById(`${shiftType}-shift`);
        if (container && this.menuData[shiftType]) {
            // Код для обновления HTML с новыми данными
            console.log('Обновление меню для смены:', shiftType);
        }
    }
}

// Создаем экземпляр менеджера меню
const menuManager = new MenuManager();

// Экспортируем для использования в других скриптах
window.MenuManager = MenuManager;
window.menuManager = menuManager;

