// api/bookings.js
export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    console.log(`API: ${req.method} ${req.url}`);
    
    // Храним данные в памяти (временное решение)
    if (!global.bookingsData) {
      global.bookingsData = {
        bookings: [],
        users: [{ username: 'admin', password: 'admin123' }]
      };
    }
    
    // GET /api/bookings
    if (req.method === 'GET' && req.url === '/api/bookings') {
      return res.status(200).json(global.bookingsData.bookings);
    }
    
    // POST /api/bookings
    if (req.method === 'POST' && req.url === '/api/bookings') {
      try {
        const body = req.body;
        const booking = {
          ...body,
          id: Date.now(),
          status: 'новая',
          createdAt: new Date().toISOString(),
          teacherName: body.teacher.split('|')[0],
          teacherRoom: body.teacher.split('|')[1] || 'не указан'
        };
        
        global.bookingsData.bookings.push(booking);
        
        return res.status(201).json({ 
          success: true, 
          message: 'Запись создана',
          bookingId: booking.id
        });
      } catch (error) {
        return res.status(400).json({ error: 'Ошибка данных' });
      }
    }
    
    // POST /api/auth/login
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { username, password } = req.body;
      
      const user = global.bookingsData.users.find(
        u => u.username === username && u.password === password
      );
      
      if (user) {
        return res.status(200).json({ 
          success: true, 
          message: 'Вход успешен'
        });
      } else {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }
    }
    
    // Для остальных маршрутов возвращаем заглушки
    return res.status(200).json({ 
      success: true, 
      message: 'API работает',
      method: req.method,
      url: req.url
    });
  }