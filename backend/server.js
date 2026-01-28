const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Путь к файлу с данными
const DATA_FILE = path.join(__dirname, 'data', 'bookings.json');

// Инициализация файла данных
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({
      bookings: [],
      users: [
        {
          id: 1,
          username: 'admin',
          password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq2CqW4p2B7YV7cC5YJ6TtQ1FpLb0a', // admin123
          role: 'admin'
        }
      ]
    }, null, 2));
  }
}

// Чтение данных
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { bookings: [], users: [] };
  }
}

// Запись данных
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// API маршруты

// Получить все записи
app.get('/api/bookings', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.bookings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новую запись
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = req.body;
    
    // Валидация
    if (!booking.teacher || !booking.date || !booking.selectedTime || !booking.parentName) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    // Добавляем ID и дату создания
    booking.id = Date.now();
    booking.status = 'новая';
    booking.createdAt = new Date().toISOString();

    const data = await readData();
    data.bookings.push(booking);
    await writeData(data);

    res.status(201).json({ 
      success: true, 
      message: 'Запись успешно создана', 
      bookingId: booking.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить статус записи
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['новая', 'подтверждена', 'отменена', 'завершена'].includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const data = await readData();
    const bookingIndex = data.bookings.findIndex(b => b.id == id);

    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    data.bookings[bookingIndex].status = status;
    data.bookings[bookingIndex].updatedAt = new Date().toISOString();
    await writeData(data);

    res.json({ success: true, message: 'Статус обновлен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить запись
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    
    const initialLength = data.bookings.length;
    data.bookings = data.bookings.filter(b => b.id != id);
    
    if (data.bookings.length === initialLength) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    await writeData(data);
    res.json({ success: true, message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Аутентификация администратора
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await readData();
    
    const user = data.users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // В реальном приложении используйте bcrypt.compare
    // Для простоты делаем прямое сравнение
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // В реальном приложении генерируйте JWT токен
    res.json({ 
      success: true, 
      message: 'Вход выполнен успешно',
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить статистику
app.get('/api/stats', async (req, res) => {
  try {
    const data = await readData();
    const bookings = data.bookings;
    
    const stats = {
      total: bookings.length,
      byStatus: {
        новая: bookings.filter(b => b.status === 'новая').length,
        подтверждена: bookings.filter(b => b.status === 'подтверждена').length,
        отменена: bookings.filter(b => b.status === 'отменена').length,
        завершена: bookings.filter(b => b.status === 'завершена').length
      },
      byTeacher: {},
      recentBookings: bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    };

    // Группировка по учителям
    bookings.forEach(booking => {
      const teacher = booking.teacherName || booking.teacher;
      if (!stats.byTeacher[teacher]) {
        stats.byTeacher[teacher] = 0;
      }
      stats.byTeacher[teacher]++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Экспорт в Excel (возвращает JSON для фронтенда)
app.get('/api/export', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.bookings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
async function startServer() {
  await initDataFile();
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступно по адресу: http://localhost:${PORT}`);
    console.log('Доступные маршруты:');
    console.log('  GET  /api/bookings      - получить все записи');
    console.log('  POST /api/bookings      - создать запись');
    console.log('  PUT  /api/bookings/:id  - обновить статус');
    console.log('  DELETE /api/bookings/:id - удалить запись');
    console.log('  POST /api/auth/login    - вход администратора');
    console.log('  GET  /api/stats         - статистика');
    console.log('  GET  /api/export        - экспорт данных');
  });
}

startServer();