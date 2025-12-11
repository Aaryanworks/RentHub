
const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const express = require('express');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

// Initialize server
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Configuration
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_PATH = path.join(__dirname, 'db.json');
console.log('Using DB file at:', DB_PATH);

// debugging helper — log every request
server.use((req, res, next) => {
    console.log('[REQ]', new Date().toISOString(), req.method, req.originalUrl);
    next();
});

// after you register your routes, print available routes (add near end, before server.listen)
function listRoutes() {
    try {
        const routes = [];
        server._router.stack.forEach(mw => {
            if (mw.route) {
                const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
                routes.push(`${methods} ${mw.route.path}`);
            } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
                mw.handle.stack.forEach(r => {
                    if (r.route) {
                        const methods = Object.keys(r.route.methods).join(',').toUpperCase();
                        routes.push(`${methods} ${r.route.path}`);
                    }
                });
            }
        });
        console.log('=== REGISTERED ROUTES ===');
        routes.forEach(r => console.log(r));
        console.log('=== END ROUTES ===');
    } catch (e) {
        console.warn('Route listing failed', e);
    }
}
listRoutes();


// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};
ensureUploadDir();

// Helper: Read database
const readDatabase = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Database error');
  }
};

// Helper: Write database
const writeDatabase = async (data) => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw new Error('Database error');
  }
};

// ==========================
// MIDDLEWARE
// ==========================
server.use(cors());
// Note: JSON Server handles body parsing internally for its routes
// We only need express.json() for our custom routes (login, register)
server.use('/uploads', express.static(UPLOAD_DIR));

// ==========================
// FILE UPLOAD CONFIGURATION
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ==========================
// CUSTOM ENDPOINTS
// ==========================

// Upload endpoint (Multer handles multipart/form-data, no need for express.json)
server.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint (needs body parser)
server.post('/login', express.json(), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const db = await readDatabase();
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Support both bcrypt hashed and plain text passwords
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = user.password === password;
    }
    
    if (isPasswordValid) {
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        accessToken: `token-${user.id}-${Date.now()}`,
        user: userWithoutPassword
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register endpoint (needs body parser)
server.post('/register', express.json(), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const users = router.db.get('users');
    
    if (users.value().find(u => u.email === email)) {
      console.log('Registration attempt with existing email:', email);
      console.log('Users:', users);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: users.value().length > 0 ? Math.max(...users.value().map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword,
      name
    };

    console.log('Registering new user:', newUser);
    
    users.push(newUser).write();
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      accessToken: `token-${newUser.id}-${Date.now()}`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ==========================
// JSON SERVER ROUTES
// ==========================
server.use(middlewares);
server.use(router);

// ==========================
// START SERVER
// ==========================
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`--) RentHub Backend Server Running`);

  console.log(`${'='.repeat(60)}\n`);
});
