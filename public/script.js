// script.js - Исправленный скрипт для работы с Vercel API

// Автоматическое определение базового URL API
const API_BASE = () => {
    const hostname = window.location.hostname;
    console.log('Hostname:', hostname);
    
    if (hostname.includes('vercel.app')) {
        return '/api';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    return '/api';
};

console.log('API Base:', API_BASE());

document.addEventListener('DOMContentLoaded', function() {
    console.log('Документ загружен, инициализация приложения...');
    initApp();
});

function initApp() {
    console.log('Инициализация приложения...');
    
    if (document.getElementById('bookingForm')) {
        console.log('Найдена форма записи, инициализируем...');
        initBookingForm();
    }
    
    if (document.getElementById('adminLoginForm') || document.getElementById('adminPanel')) {
        console.log('Найдена админ-панель, инициализируем...');
        initAdminPanel();
    }
    
    initModalHandlers();
}

// Функция для инициализации формы записи
function initBookingForm() {
    console.log('Инициализация формы записи...');
    
    loadTeachers();
    initSaturdayCalendar();
    updateTimeSlots();
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        console.log('Добавляем обработчик отправки формы записи...');
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    const teacherSelect = document.getElementById('teacher');
    if (teacherSelect) {
        teacherSelect.addEventListener('change', function() {
            updateTimeSlots();
        });
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhone);
    }
}

// Функция для инициализации календаря с выбором только суббот
function initSaturdayCalendar() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    
    console.log('Инициализация календаря с выбором только суббот...');
    
    const nextSaturday = getNextSaturday();
    
    const calendar = flatpickr(dateInput, {
        locale: "ru",
        dateFormat: "Y-m-d",
        minDate: nextSaturday,
        maxDate: new Date().fp_incr(90),
        disable: [
            function(date) {
                return date.getDay() !== 6;
            }
        ],
        onChange: function(selectedDates, dateStr, instance) {
            console.log('Выбрана дата:', dateStr);
            if (dateStr) {
                updateTimeSlots();
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            instance.setDate(nextSaturday, false);
            console.log('Дата по умолчанию установлена:', nextSaturday);
            
            setTimeout(() => {
                const calendarContainer = instance.calendarContainer;
                if (calendarContainer) {
                    const saturdays = calendarContainer.querySelectorAll('.flatpickr-day:not(.disabled)');
                    saturdays.forEach(day => {
                        const date = new Date(day.dateObj);
                        if (date.getDay() === 6) {
                            day.classList.add('saturday');
                        }
                    });
                }
            }, 100);
        }
    });
    
    window.bookingCalendar = calendar;
    console.log('Календарь инициализирован');
}

// Функция для получения ближайшей субботы
function getNextSaturday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7;
    
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    nextSaturday.setHours(0, 0, 0, 0);
    
    return nextSaturday;
}

// Функция для загрузки учителей из предоставленного списка
function loadTeachers() {
    const teacherSelect = document.getElementById('teacher');
    if (!teacherSelect) return;
    
    console.log('Загрузка списка учителей...');
    
    teacherSelect.innerHTML = '<option value="">-- Выберите учителя --</option>';
    
    const teachers = [
        {name: "Акимова В. А.", room: "1040"},
        {name: "Александрова В. А.", room: "3016"},
        {name: "Антипина С. В.", room: "3033"},
        {name: "Антипова Е. О.", room: ""},
        {name: "Афанасьева О. В.", room: "4015"},
        {name: "Бабкина Е. А.", room: "3035"},
        {name: "Балшикая Ю. А.", room: "1014"},
        {name: "Балтачева Д. А.", room: "1080"},
        {name: "Бондаренко И. М.", room: "2010"},
        {name: "Бугушева З. М.", room: "4022"},
        {name: "Вагина А. О.", room: "2007"},
        {name: "Вакушина Е. В.", room: "2012"},
        {name: "Гапанович Е. А.", room: "4019"},
        {name: "Голдырева П. И.", room: "3032"},
        {name: "Горбачева И. А.", room: "1085"},
        {name: "Груздева Н. В.", room: "4010"},
        {name: "Гусельникова И. В.", room: "1084"},
        {name: "Дубичник Л. М.", room: "4021"},
        {name: "Егорова М. И.", room: "1083"},
        {name: "Загорская Л. В.", room: "3034"},
        {name: "Закалюкина Е. А.", room: "3014"},
        {name: "Засыпкина А. В.", room: "2017"},
        {name: "Зефирова Е. В.", room: "1015"},
        {name: "Зуева Ю. Н.", room: ""},
        {name: "Зырянова И. В.", room: "3054"},
        {name: "Игнатова Е. Ю.", room: "2009"},
        {name: "Ивачёв Е. А.", room: "3011"},
        {name: "Ивачёва М. О.", room: ""},
        {name: "Ищенко К. А.", room: "3035"},
        {name: "Казакова В. В.", room: "4010"},
        {name: "Калугина А. В.", room: "4019"},
        {name: "Кизирева В. С.", room: ""},
        {name: "Кизерова В. С.", room: ""},
        {name: "Колодчевская Е. А.", room: "3013"},
        {name: "Колпылова П. И.", room: "2007"},
        {name: "Кондрашова З. В.", room: "5012"},
        {name: "Конищева А. И.", room: ""},
        {name: "Кононец Д. С.", room: "3009"},
        {name: "Красулина Т. В.", room: "2018"},
        {name: "Кропотова М. Ю.", room: "1081"},
        {name: "Крутикова А. П.", room: "4020"},
        {name: "Кузнецова К. М.", room: "5013"},
        {name: "Кунщикова Н. Г.", room: "3032"},
        {name: "Липина Ю. С.", room: "3017"},
        {name: "Макарова Д. Е.", room: ""},
        {name: "Макеева А. О.", room: "1015"},
        {name: "Макушина А. В.", room: ""},
        {name: "Малышева О. Д.", room: "3036"},
        {name: "Малышева Т. В.", room: "3006"},
        {name: "Марарова М. С.", room: ""},
        {name: "Медведева К. Д.", room: "2006"},
        {name: "Мордань Е. В.", room: "4013"},
        {name: "Московская Д. Д.", room: "5014"},
        {name: "Москалева А. В.", room: "2083"},
        {name: "Мусихина И. Д.", room: "2019"},
        {name: "Овчинников Д. И.", room: "2083"},
        {name: "Опарина А. Ю.", room: "2082"},
        {name: "Панченко М. Н.", room: "2011"},
        {name: "Павлова К. А.", room: "2020"},
        {name: "Пелевина Е. А.", room: "4006"},
        {name: "Плетенёва С. А.", room: "4023"},
        {name: "Подлисецкая Д. В.", room: "2015"},
        {name: "Попович Е. А.", room: "1017"},
        {name: "Россов А. В.", room: "1044"},
        {name: "Светлакова А. А.", room: "2065"},
        {name: "Семенова О. А.", room: "1016"},
        {name: "Семянинкова И. Н.", room: "2015"},
        {name: "Смирнова И. Р.", room: "4012"},
        {name: "Смирнова И.А.", room: "1082"},
        {name: "Соловьева Д. О.", room: "2008"},
        {name: "Сысолятина М. В.", room: "3032"},
        {name: "Толстикова А. С.", room: "2006"},
        {name: "Торопова Н. А.", room: "5014"},
        {name: "Усольцева А. Д.", room: "3033"},
        {name: "Филиппова В. Д.", room: "3017"},
        {name: "Фоминова В. А.", room: "5005"},
        {name: "Халивина К. В.", room: "3032"},
        {name: "Хлопина А. М.", room: ""},
        {name: "Цее Л. Ю.", room: "4018"},
        {name: "Червов Д. В.", room: "2013"},
        {name: "Чиркова В. В.", room: "3037"},
        {name: "Чукашина А. В.", room: "1080"},
        {name: "Шаблюк О. К.", room: "2008"},
        {name: "Шамордина М. С.", room: "4016"},
        {name: "Шералиева Б. Х.", room: "3015"},
        {name: "Шербакова А. М.", room: "5007"},
        {name: "Шипулина Н. Л.", room: "2083"},
        {name: "Штуркина Н. С.", room: "3016"},
        {name: "Юрина Н. Е.", room: "1085"},
        {name: "Ярочкина А.В.", room: "5005"},
        {name: "Ярунина О.Ф.", room: "2016"},
        {name: "Яхнова Я.Д.", room: "2065"}
    ];
    
    console.log('Загружено учителей:', teachers.length);
    
    teachers.sort((a, b) => {
        const lastNameA = a.name.split(' ')[0];
        const lastNameB = b.name.split(' ')[0];
        return lastNameA.localeCompare(lastNameB);
    });
    
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        const roomInfo = teacher.room ? ` (каб. ${teacher.room})` : '';
        option.value = teacher.name + (teacher.room ? `|${teacher.room}` : '');
        option.textContent = teacher.name + roomInfo;
        teacherSelect.appendChild(option);
    });
    
    console.log('Список учителей загружен в выпадающий список');
}

// Функция обновления слотов времени с учетом занятых времен
function updateTimeSlots() {
    const timeSlotsContainer = document.querySelector('.time-slots');
    const selectedTimeInput = document.getElementById('selectedTime');
    const teacherSelect = document.getElementById('teacher');
    const dateInput = document.getElementById('date');
    const occupiedSlotsInfo = document.getElementById('occupiedSlotsInfo');
    
    if (!timeSlotsContainer || !teacherSelect || !dateInput) return;
    
    const selectedTeacher = teacherSelect.value;
    const selectedDate = dateInput.value;
    
    if (!selectedTeacher || !selectedDate) {
        createAllTimeSlots(timeSlotsContainer, selectedTimeInput, [], true);
        if (occupiedSlotsInfo) {
            occupiedSlotsInfo.textContent = 'Выберите учителя и дату';
            occupiedSlotsInfo.style.color = '#dc3545';
        }
        return;
    }
    
    console.log('Обновление слотов времени для:', selectedTeacher, 'на дату:', selectedDate);
    
    getOccupiedTimeSlots(selectedTeacher, selectedDate).then(occupiedSlots => {
        createAllTimeSlots(timeSlotsContainer, selectedTimeInput, occupiedSlots, false);
        
        if (occupiedSlotsInfo) {
            if (occupiedSlots.length > 0) {
                occupiedSlotsInfo.textContent = `Занятые слоты: ${occupiedSlots.join(', ')}`;
                occupiedSlotsInfo.style.color = '#dc3545';
            } else {
                occupiedSlotsInfo.textContent = 'Все слоты свободны';
                occupiedSlotsInfo.style.color = '#28a745';
            }
        }
        
        console.log('Занятые слоты:', occupiedSlots);
    }).catch(error => {
        console.error('Ошибка при получении занятых слотов:', error);
        createAllTimeSlots(timeSlotsContainer, selectedTimeInput, [], true);
    });
}

// Функция получения занятых слотов времени для учителя и даты
async function getOccupiedTimeSlots(teacher, date) {
    try {
        const response = await fetch(`${API_BASE()}/bookings`);
        if (!response.ok) {
            console.error('Ошибка HTTP:', response.status);
            throw new Error('Ошибка загрузки данных');
        }
        
        const bookings = await response.json();
        console.log('Получено записей:', bookings.length);
        
        // Фильтруем записи по выбранному учителю и дате
        const teacherBookings = bookings.filter(booking => {
            return booking.teacher === teacher && booking.date === date;
        });
        
        // Извлекаем занятые временные слоты
        const occupiedSlots = teacherBookings.map(booking => booking.selectedTime);
        
        return occupiedSlots;
    } catch (error) {
        console.error('Ошибка при получении занятых слотов:', error);
        return [];
    }
}

// Функция создания всех слотов времени
function createAllTimeSlots(container, selectedTimeInput, occupiedSlots, disabledAll = false) {
    const timeInfo = container.querySelector('.time-info');
    container.innerHTML = '';
    if (timeInfo) {
        container.appendChild(timeInfo);
    }
    
    const startTime = { hour: 11, minute: 30 };
    const endTime = { hour: 13, minute: 0 };
    
    let currentHour = startTime.hour;
    let currentMinute = startTime.minute;
    let hasAvailableSlots = false;
    
    while (currentHour < endTime.hour || (currentHour === endTime.hour && currentMinute < endTime.minute)) {
        const startHourStr = currentHour.toString().padStart(2, '0');
        const startMinuteStr = currentMinute.toString().padStart(2, '0');
        
        let endHour = currentHour;
        let endMinute = currentMinute + 20;
        
        if (endMinute >= 60) {
            endHour += 1;
            endMinute -= 60;
        }
        
        if (endHour > endTime.hour || (endHour === endTime.hour && endMinute > endTime.minute)) {
            break;
        }
        
        const endHourStr = endHour.toString().padStart(2, '0');
        const endMinuteStr = endMinute.toString().padStart(2, '0');
        
        const timeSlotStr = `${startHourStr}:${startMinuteStr}-${endHourStr}:${endMinuteStr}`;
        
        const isOccupied = occupiedSlots.includes(timeSlotStr) || disabledAll;
        
        const timeSlot = document.createElement('div');
        timeSlot.className = `time-slot ${isOccupied ? 'occupied' : 'available'}`;
        timeSlot.setAttribute('data-time', timeSlotStr);
        timeSlot.textContent = `${startHourStr}:${startMinuteStr} - ${endHourStr}:${endMinuteStr}`;
        
        if (!isOccupied) {
            timeSlot.title = 'Доступно для записи';
            hasAvailableSlots = true;
            
            timeSlot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                    s.classList.remove('active');
                });
                
                this.classList.add('selected');
                this.classList.add('active');
                
                if (selectedTimeInput) {
                    selectedTimeInput.value = this.getAttribute('data-time');
                    console.log('Выбрано время:', selectedTimeInput.value);
                }
            });
        } else {
            timeSlot.title = 'Время занято';
            timeSlot.style.cursor = 'not-allowed';
        }
        
        container.appendChild(timeSlot);
        
        currentMinute += 20;
        if (currentMinute >= 60) {
            currentHour += 1;
            currentMinute -= 60;
        }
    }
    
    if (!disabledAll && hasAvailableSlots) {
        const firstAvailableSlot = container.querySelector('.time-slot.available');
        if (firstAvailableSlot && selectedTimeInput) {
            firstAvailableSlot.classList.add('selected');
            firstAvailableSlot.classList.add('active');
            selectedTimeInput.value = firstAvailableSlot.getAttribute('data-time');
            console.log('Время по умолчанию установлено:', selectedTimeInput.value);
        }
    } else if (disabledAll) {
        if (selectedTimeInput) {
            selectedTimeInput.value = '';
        }
    }
    
    console.log('Создано слотов времени:', container.querySelectorAll('.time-slot').length);
    console.log('Доступных слотов:', container.querySelectorAll('.time-slot.available').length);
}

// Инициализация обработчиков модальных окон
function initModalHandlers() {
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
}

// Обработчик отправки формы записи
async function handleBookingSubmit(event) {
    event.preventDefault();
    console.log('Отправка формы записи...');
    
    const teacherSelect = document.getElementById('teacher');
    if (!teacherSelect || teacherSelect.value === '') {
        showNotification('Пожалуйста, выберите учителя.', 'error');
        teacherSelect.focus();
        return;
    }
    
    const dateInput = document.getElementById('date');
    if (!dateInput || !dateInput.value) {
        showNotification('Пожалуйста, выберите субботу.', 'error');
        dateInput.focus();
        return;
    }
    
    const selectedDate = new Date(dateInput.value);
    if (selectedDate.getDay() !== 6) {
        showNotification('Запись возможна только по субботам!', 'error');
        
        const nextSaturday = getNextSaturday();
        if (window.bookingCalendar) {
            window.bookingCalendar.setDate(nextSaturday, false);
        }
        return;
    }
    
    const selectedTimeInput = document.getElementById('selectedTime');
    if (!selectedTimeInput || !selectedTimeInput.value) {
        showNotification('Пожалуйста, выберите время приема.', 'error');
        return;
    }
    
    try {
        const occupiedSlots = await getOccupiedTimeSlots(teacherSelect.value, dateInput.value);
        if (occupiedSlots.includes(selectedTimeInput.value)) {
            showNotification('Это время уже занято у выбранного учителя. Пожалуйста, выберите другое время.', 'error');
            updateTimeSlots();
            return;
        }
    } catch (error) {
        console.error('Ошибка проверки занятых слотов:', error);
        showNotification('Ошибка проверки доступности времени. Попробуйте еще раз.', 'error');
        return;
    }
    
    // Собираем данные формы
    const bookingData = {
        teacher: teacherSelect.value,
        date: dateInput.value,
        selectedTime: selectedTimeInput.value,
        parentName: document.getElementById('parentName').value,
        studentName: document.getElementById('studentName').value,
        studentClass: document.getElementById('studentClass').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        comment: document.getElementById('comment').value || ''
    };
    
    console.log('Данные записи:', bookingData);
    
    try {
        const result = await saveBooking(bookingData);
        console.log('Результат сохранения:', result);
        
        showBookingDetails(bookingData);
        updateTimeSlots();
        showNotification('Запись успешно отправлена! Ожидайте подтверждения.', 'success');
    } catch (error) {
        console.error('Ошибка сохранения записи:', error);
        showNotification('Ошибка при отправке записи. Попробуйте еще раз.', 'error');
    }
}

// Функция сохранения записи
async function saveBooking(bookingData) {
    try {
        console.log('Отправка запроса на:', `${API_BASE()}/bookings`);
        const response = await fetch(`${API_BASE()}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });
        
        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            let errorText = 'Ошибка сохранения';
            try {
                const errorData = await response.json();
                errorText = errorData.error || errorText;
            } catch (e) {
                errorText = await response.text();
            }
            throw new Error(errorText);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка в saveBooking:', error);
        throw error;
    }
}

// Функция показа деталей записи в модальном окне
function showBookingDetails(bookingData) {
    const modal = document.getElementById('successModal');
    const detailsContainer = document.getElementById('bookingDetails');
    
    if (modal && detailsContainer) {
        const date = new Date(bookingData.date);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
        
        const teacherParts = bookingData.teacher.split('|');
        const teacherName = teacherParts[0];
        const teacherRoom = teacherParts[1] || 'не указан';
        
        detailsContainer.innerHTML = `
            <div class="booking-summary">
                <p><strong>Учитель:</strong> ${teacherName} (каб. ${teacherRoom})</p>
                <p><strong>Дата:</strong> ${formattedDate}</p>
                <p><strong>Время приема:</strong> ${bookingData.selectedTime} (20 минут)</p>
                <p><strong>Родитель:</strong> ${bookingData.parentName}</p>
                <p><strong>Ученик:</strong> ${bookingData.studentName} (${bookingData.studentClass} класс)</p>
                <p><strong>Контактный телефон:</strong> ${bookingData.phone}</p>
                <p><strong>Email:</strong> ${bookingData.email}</p>
                ${bookingData.comment ? `<p><strong>Комментарий:</strong> ${bookingData.comment}</p>` : ''}
                <div class="booking-note">
                    <p><i class="fas fa-info-circle"></i> <strong>Важно:</strong> Прием родителей проводится только по субботам с 11:30 до 13:00. Продолжительность приема - 20 минут.</p>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        console.log('Показано модальное окно с деталями записи');
    }
}

// Функция закрытия модального окна
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Модальное окно закрыто');
    }
}

// Функция сброса формы
function resetForm() {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.reset();
        
        if (window.bookingCalendar) {
            const nextSaturday = getNextSaturday();
            window.bookingCalendar.setDate(nextSaturday, false);
        }
        
        updateTimeSlots();
        
        console.log('Форма сброшена');
        showNotification('Форма очищена', 'info');
    }
}

// Функция форматирования телефона
function formatPhone(event) {
    let phone = event.target.value.replace(/\D/g, '');
    
    if (phone.length === 0) return '';
    
    let formattedPhone = '+7 ';
    
    if (phone.length > 1) {
        formattedPhone += '(' + phone.substring(1, 4);
    }
    
    if (phone.length >= 5) {
        formattedPhone += ') ' + phone.substring(4, 7);
    }
    
    if (phone.length >= 8) {
        formattedPhone += '-' + phone.substring(7, 9);
    }
    
    if (phone.length >= 10) {
        formattedPhone += '-' + phone.substring(9, 11);
    }
    
    event.target.value = formattedPhone;
}

// Функция инициализации админ-панели
async function initAdminPanel() {
    console.log('Инициализация админ-панели...');
    
    // Убрали проверку localStorage, всегда показываем форму входа
    showLoginForm();
    
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        console.log('Найдена форма входа, добавляем обработчик');
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        // Устанавливаем значения по умолчанию
        if (usernameInput) usernameInput.value = 'admin';
        if (passwordInput) passwordInput.value = 'admin123';
        
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

// Функция показа формы входа
function showLoginForm() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginSection) {
        loginSection.style.display = 'block';
        console.log('Форма входа показана');
    }
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
}

// Функция показа панели администратора
function showAdminPanel() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginSection) {
        loginSection.style.display = 'none';
    }
    if (adminPanel) {
        adminPanel.style.display = 'block';
        console.log('Панель администратора показана');
    }
}

// Функция входа администратора
async function adminLogin(username, password) {
    try {
        console.log('Попытка входа:', username);
        const response = await fetch(`${API_BASE()}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        console.log('Статус ответа входа:', response.status);
        
        if (!response.ok) {
            let errorText = 'Ошибка авторизации';
            try {
                const errorData = await response.json();
                errorText = errorData.error || errorText;
            } catch (e) {
                errorText = await response.text();
            }
            throw new Error(errorText);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка в adminLogin:', error);
        throw error;
    }
}

// Обработчик входа администратора
async function handleAdminLogin(event) {
    event.preventDefault();
    console.log('Попытка входа администратора...');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Введенные данные - Логин:', username, 'Пароль:', password ? '***' : 'пустой');
    
    try {
        const result = await adminLogin(username, password);
        
        console.log('Авторизация успешна!', result);
        
        // Сохраняем статус авторизации
        localStorage.setItem('adminLoggedIn', 'true');
        
        // Показываем панель управления
        showAdminPanel();
        
        // Настраиваем панель
        await setupAdminPanel();
        
        // Показываем уведомление
        showNotification('Вы успешно вошли в систему как администратор!', 'success');
    } catch (error) {
        console.log('Авторизация не удалась:', error.message);
        showNotification('Неверное имя пользователя или пароль! Попробуйте снова.', 'error');
        
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// Функция настройки панели администратора после входа
async function setupAdminPanel() {
    console.log('Настройка панели администратора...');
    
    setupFilterDates();
    await loadBookings();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
        console.log('Обработчик кнопки выхода добавлен');
    }
    
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportAllToExcel);
        console.log('Обработчик кнопки экспорта всех записей добавлен');
    }
    
    const exportFilteredBtn = document.getElementById('exportFilteredBtn');
    if (exportFilteredBtn) {
        exportFilteredBtn.addEventListener('click', exportFilteredToExcel);
        console.log('Обработчик кнопки экспорта отфильтрованных записей добавлен');
    }
    
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Применение фильтров...');
            await loadBookings();
        });
        
        const resetFilterBtn = document.getElementById('resetFilter');
        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', async function() {
                filterForm.reset();
                console.log('Фильтры сброшены');
                await loadBookings();
            });
        }
    }
}

// Функция настройки дат в фильтрах
function setupFilterDates() {
    const filterDateInput = document.getElementById('filterDate');
    if (filterDateInput) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 1);
        filterDateInput.min = minDate.toISOString().split('T')[0];
        
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        filterDateInput.max = maxDate.toISOString().split('T')[0];
        
        console.log('Фильтр дат настроен: от', filterDateInput.min, 'до', filterDateInput.max);
    }
}

// Обработчик выхода администратора
function handleAdminLogout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        localStorage.removeItem('adminLoggedIn');
        showLoginForm();
        console.log('Администратор вышел из системы');
        showNotification('Вы успешно вышли из системы.', 'info');
    }
}

// Функция загрузки записей для админ-панели
async function loadBookings() {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const noBookingsMessage = document.getElementById('noBookingsMessage');
    
    if (!bookingsTableBody) {
        console.log('Таблица записей не найдена');
        return;
    }
    
    try {
        // Используем fetchBookings вместо прямого вызова
        let bookings = await fetchBookings();
        console.log('Загружено записей из API:', bookings.length);
        
        // Применяем фильтры
        bookings = applyFilters(bookings);
        console.log('Записей после фильтрации:', bookings.length);
        
        window.currentFilteredBookings = bookings;
        
        bookingsTableBody.innerHTML = '';
        
        if (bookings.length === 0) {
            if (noBookingsMessage) {
                noBookingsMessage.style.display = 'block';
            }
            updateBookingsCounter(0);
            return;
        }
        
        if (noBookingsMessage) {
            noBookingsMessage.style.display = 'none';
        }
        
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            const date = new Date(booking.date);
            const formattedDate = date.toLocaleDateString('ru-RU');
            
            const dayOfWeek = date.getDay();
            const weekdays = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
            const weekday = weekdays[dayOfWeek];
            
            const createdAt = new Date(booking.createdAt);
            const formattedCreatedAt = createdAt.toLocaleDateString('ru-RU') + ' ' + 
                                      createdAt.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
            
            let statusClass = '';
            switch(booking.status) {
                case 'новая':
                    statusClass = 'status-new';
                    break;
                case 'подтверждена':
                    statusClass = 'status-confirmed';
                    break;
                case 'отменена':
                    statusClass = 'status-cancelled';
                    break;
                case 'завершена':
                    statusClass = 'status-completed';
                    break;
            }
            
            const teacherParts = booking.teacher ? booking.teacher.split('|') : ['', ''];
            const teacherName = booking.teacherName || teacherParts[0];
            const teacherRoom = booking.teacherRoom || teacherParts[1] || 'не указан';
            
            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${teacherName}<br><small>Каб. ${teacherRoom}</small></td>
                <td>${formattedDate}<br><small>${weekday}, ${booking.selectedTime}</small></td>
                <td>${booking.parentName}<br><small>${booking.phone}</small></td>
                <td>${booking.studentName}<br><small>${booking.studentClass} класс</small></td>
                <td>
                    <select class="status-select ${statusClass}" data-id="${booking.id}">
                        <option value="новая" ${booking.status === 'новая' ? 'selected' : ''}>Новая</option>
                        <option value="подтверждена" ${booking.status === 'подтверждена' ? 'selected' : ''}>Подтверждена</option>
                        <option value="отменена" ${booking.status === 'отменена' ? 'selected' : ''}>Отменена</option>
                        <option value="завершена" ${booking.status === 'завершена' ? 'selected' : ''}>Завершена</option>
                    </select>
                </td>
                <td>${formattedCreatedAt}</td>
                <td>
                    <button class="btn-delete" data-id="${booking.id}" title="Удалить запись">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            bookingsTableBody.appendChild(row);
        });
        
        console.log('Таблица записей заполнена:', bookings.length, 'записей');
        
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', handleDeleteBooking);
        });
        
        updateBookingsCounter(bookings.length);
        
    } catch (error) {
        console.error('Ошибка загрузки записей:', error);
        showNotification('Ошибка загрузки записей. Проверьте соединение с сервером.', 'error');
        
        if (noBookingsMessage) {
            noBookingsMessage.style.display = 'block';
            noBookingsMessage.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> Ошибка загрузки данных с сервера</p>';
        }
    }
}

// Функция получения записей
async function fetchBookings() {
    try {
        console.log('Запрос записей по адресу:', `${API_BASE()}/bookings`);
        const response = await fetch(`${API_BASE()}/bookings`);
        
        if (!response.ok) {
            console.error('Ошибка HTTP при загрузке записей:', response.status);
            throw new Error('Ошибка загрузки данных');
        }
        
        const bookings = await response.json();
        console.log('Получено записей:', bookings.length);
        return bookings;
    } catch (error) {
        console.error('Ошибка в fetchBookings:', error);
        return [];
    }
}

// Функция применения фильтров
function applyFilters(bookings) {
    const teacherFilter = document.getElementById('filterTeacher');
    const dateFilter = document.getElementById('filterDate');
    const statusFilter = document.getElementById('filterStatus');
    
    let filteredBookings = [...bookings];
    
    if (teacherFilter && teacherFilter.value) {
        const searchTerm = teacherFilter.value.toLowerCase();
        filteredBookings = filteredBookings.filter(booking => 
            (booking.teacherName && booking.teacherName.toLowerCase().includes(searchTerm)) ||
            (booking.teacher && booking.teacher.toLowerCase().includes(searchTerm))
        );
        console.log('Применен фильтр по учителю:', teacherFilter.value);
    }
    
    if (dateFilter && dateFilter.value) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.date === dateFilter.value
        );
        console.log('Применен фильтр по дате:', dateFilter.value);
    }
    
    if (statusFilter && statusFilter.value) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.status === statusFilter.value
        );
        console.log('Применен фильтр по статусу:', statusFilter.value);
    }
    
    return filteredBookings;
}

// Обработчик изменения статуса записи
async function handleStatusChange(event) {
    const bookingId = parseInt(event.target.getAttribute('data-id'));
    const newStatus = event.target.value;
    
    console.log('Изменение статуса записи', bookingId, 'на', newStatus);
    
    try {
        await updateBookingStatus(bookingId, newStatus);
        
        event.target.className = `status-select status-${getStatusClass(newStatus)}`;
        
        console.log(`Статус записи ${bookingId} изменен на: ${newStatus}`);
        
        showNotification(`Статус записи #${bookingId} изменен на "${newStatus}"`, 'success');
    } catch (error) {
        console.error('Ошибка изменения статуса:', error);
        showNotification('Ошибка изменения статуса. Попробуйте еще раз.', 'error');
    }
}

// Функция обновления статуса
async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE()}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка обновления');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка в updateBookingStatus:', error);
        throw error;
    }
}

// Функция получения класса для статуса
function getStatusClass(status) {
    switch(status) {
        case 'новая': return 'new';
        case 'подтверждена': return 'confirmed';
        case 'отменена': return 'cancelled';
        case 'завершена': return 'completed';
        default: return '';
    }
}

// Обработчик удаления записи
async function handleDeleteBooking(event) {
    const bookingId = parseInt(event.currentTarget.getAttribute('data-id'));
    
    if (confirm(`Вы уверены, что хотите удалить запись #${bookingId}?`)) {
        try {
            await deleteBooking(bookingId);
            
            await loadBookings();
            
            console.log(`Запись ${bookingId} удалена`);
            
            showNotification(`Запись #${bookingId} удалена`, 'info');
        } catch (error) {
            console.error('Ошибка удаления записи:', error);
            showNotification('Ошибка удаления записи. Попробуйте еще раз.', 'error');
        }
    }
}

// Функция удаления записи
async function deleteBooking(bookingId) {
    try {
        const response = await fetch(`${API_BASE()}/bookings/${bookingId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка удаления');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка в deleteBooking:', error);
        throw error;
    }
}

// Функция обновления счетчика записей
function updateBookingsCounter(count) {
    const counterElement = document.getElementById('bookingsCounter');
    if (counterElement) {
        counterElement.textContent = `Найдено записей: ${count}`;
        console.log('Счетчик записей обновлен:', count);
    }
}

// Функция показа уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                border-left: 4px solid #1e3c72;
            }
            .notification-success {
                border-left-color: #28a745;
            }
            .notification-error {
                border-left-color: #dc3545;
            }
            .notification-info {
                border-left-color: #17a2b8;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                font-size: 14px;
                padding: 5px;
                margin-left: 10px;
            }
            .notification-close:hover {
                color: #333;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}