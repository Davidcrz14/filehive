import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Validación de entrada
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 30;
};

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validar campos obligatorios
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Validar formato de email
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Validar longitud de contraseña
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Validar nombre de usuario
        if (!validateUsername(username)) {
            return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 30 caracteres' });
        }

        // Verificar si el email o username ya existen
        const [existingUsers] = await pool.query(
            'SELECT email, username FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            const existing = existingUsers[0];
            if (existing.email === email) {
                return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
            }
            if (existing.username === username) {
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
            }
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Generar token
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: result.insertId,
                username,
                email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos obligatorios
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        // Validar formato de email
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Buscar usuario
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Actualizar último login
        await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
});

export default router;
