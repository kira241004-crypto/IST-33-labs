document.addEventListener('DOMContentLoaded', () => {
    const viewSelector = document.getElementById('view-selector');
    const body = document.body;

    // Функция обновления отображения в зависимости от выбора
    function updateView() {
        const selectedView = viewSelector.value;

        // Сбрасываем принудительные классы
        body.classList.remove('view-mobile', 'view-desktop');

        if (selectedView === 'mobile') {
            body.classList.add('view-mobile');
        } else if (selectedView === 'desktop') {
            body.classList.add('view-desktop');
        }
        // Если 'auto', ничего не добавляем, работают CSS Media Queries
    }

    // Слушатель изменения выбора в выпадающем списке
    viewSelector.addEventListener('change', updateView);

    // Дополнительно: Если требования подразумевают, что мы должны
    // "следить" за шириной и как-то реагировать в JS (например, логировать),
    // можно добавить слушатель resize. Но для визуального переключения
    // достаточно CSS media queries в режиме Auto.
    
    // Однако, чтобы полностью соответствовать заданию "Автоматическое переключение... происходит проверка текущей ширины",
    // реализуем логику, которая при выборе "Desktop" может сброситься в "Mobile", 
    // ТОЛЬКО если мы не в режиме принудительного выбора? 
    // Нет, обычно "Auto" - это и есть этот режим.
    
    // Инициализация при загрузке
    updateView();
});
