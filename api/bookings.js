const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/bookings.json');

// Инициализация файла данных
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ bookings: [] }, null, 2));
  }
}

// Middleware CORS
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  cors(res);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  initDataFile();
  
  const { method, url } = req;
  const urlParts = url.split('/').filter(part => part);
  
  // GET /api/bookings
  if (method === 'GET' && urlParts[1] === 'bookings') {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      res.status(200).json(data.bookings);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка чтения данных' });
    }
    return;
  }
  
  // POST /api/bookings
  if (method === 'POST' && urlParts[1] === 'bookings') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const booking = JSON.parse(body);
        booking.id = Date.now();
        booking.createdAt = new Date().toISOString();
        booking.status = 'новая';
        
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.bookings.push(booking);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.status(201).json({ success: true, bookingId: booking.id });
      } catch (error) {
        res.status(400).json({ error: 'Ошибка данных' });
      }
    });
    return;
  }
  
  // PUT /api/bookings/:id
  if (method === 'PUT' && urlParts[1] === 'bookings' && urlParts[2]) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { status } = JSON.parse(body);
        const bookingId = parseInt(urlParts[2]);
        
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const booking = data.bookings.find(b => b.id === bookingId);
        
        if (!booking) {
          res.status(404).json({ error: 'Запись не найдена' });
          return;
        }
        
        booking.status = status;
        booking.updatedAt = new Date().toISOString();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(400).json({ error: 'Ошибка обновления' });
      }
    });
    return;
  }
  
  // DELETE /api/bookings/:id
  if (method === 'DELETE' && urlParts[1] === 'bookings' && urlParts[2]) {
    try {
      const bookingId = parseInt(urlParts[2]);
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      const initialLength = data.bookings.length;
      
      data.bookings = data.bookings.filter(b => b.id !== bookingId);
      
      if (data.bookings.length === initialLength) {
        res.status(404).json({ error: 'Запись не найдена' });
        return;
      }
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка удаления' });
    }
    return;
  }
  
  // POST /api/auth/login
  if (method === 'POST' && urlParts[1] === 'auth' && urlParts[2] === 'login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { username, password } = JSON.parse(body);
        
        // Простая проверка (в реальном приложении используйте хеширование)
        if (username === 'admin' && password === 'admin123') {
          res.status(200).json({ 
            success: true, 
            message: 'Вход выполнен успешно'
          });
        } else {
          res.status(401).json({ error: 'Неверные учетные данные' });
        }
      } catch (error) {
        res.status(400).json({ error: 'Ошибка данных' });
      }
    });
    return;
  }
  
  res.status(404).json({ error: 'Маршрут не найден' });
};