(function(jsGrid) {

    jsGrid.locales.ua = {
        grid: {
            noDataContent: "Дані не знайдені",
            deleteConfirm: "Ви дійсно хочете видали дану заправку?",
            pagerFormat: "Сторінки: {first} {prev} {pages} {next} {last} &nbsp;&nbsp; {pageIndex} з {pageCount}",
            pagePrevText: "<",
            pageNextText: ">",
            pageFirstText: "<<",
            pageLastText: ">>",
            loadMessage: "Будь ласка, зачекайте...",
            invalidMessage: "Введкні не коректні дані!"
        },

        loadIndicator: {
            message: "Завантаження..."
        },

        fields: {
            control: {
                searchModeButtonTooltip: "Пошук",
                insertModeButtonTooltip: "Додати дані заправки",
                editButtonTooltip: "Змінити",
                deleteButtonTooltip: "Видалити",
                searchButtonTooltip: "Знайти",
                clearFilterButtonTooltip: "Очистити фільтр",
                insertButtonTooltip: "Додати",
                updateButtonTooltip: "Зберегти",
                cancelEditButtonTooltip: "Відміна"
            }
        },

        validators: {
            required: { message: "Поле обов'язкове для заповнення" },
            rangeLength: { message: "Довжина даного значення не діапазоні допустимих значень" },
            minLength: { message: "Введене значення дуже коротке" },
            maxLength: { message: "Введене значення дуже довге" },
            pattern: { message: "Введене значення не відповідає правилу" },
            range: { message: "ВДовжина даного значення не діапазоні допустимих значень" },
            min: { message: "Введене значення дуже коротке" },
            max: { message: "Введене значення дуже довге" }
        }
    };

}(jsGrid, jQuery));

