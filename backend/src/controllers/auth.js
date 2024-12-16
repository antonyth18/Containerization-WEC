import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        role: role.toUpperCase(),
        status: 'ACTIVE'
      },
    });

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.status(201).json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ 
        error: 'Email or username already exists' 
      });
    } else {
      throw error;
    }
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  res.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role 
    } 
  });
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Could not log out, please try again' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { 
      id: true, 
      email: true, 
      username: true, 
      role: true 
    }
  });
  res.json(user);
}; 