const User = require('../models/user');
const jwt = require('jsonwebtoken');

function isStrongPassword(password) {
  // Al menos 6 caracteres, 1 número, 1 símbolo, 1 mayúscula, 1 minúscula
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>,.?/]).{6,}$/.test(password);
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios. Por favor, completa usuario, email y contraseña.' });

  if (!/^[^@\s]+@[^@\s]+\.com$/.test(email))
    return res.status(400).json({ error: 'El email debe ser válido y terminar en .com. Revisa que esté bien escrito.' });

  if (!isStrongPassword(password))
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres, 1 número, 1 símbolo, 1 mayúscula y 1 minúscula. Elige una contraseña más segura.' });

  try {
    if (await User.findOne({ email })) return res.status(400).json({ error: 'El email ya está registrado. Usa otro email o inicia sesión.' });
    if (await User.findOne({ username })) return res.status(400).json({ error: 'El username ya está registrado. Elige otro nombre de usuario.' });

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente. Ya puedes iniciar sesión.', user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: 'Ocurrió un error al registrar el usuario. Intenta nuevamente o revisa los datos enviados.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña son obligatorios. Por favor, completa ambos campos.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas. Verifica tu email y contraseña.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas. Verifica tu email y contraseña.' });

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY, { expiresIn: '2h' });
    res.json({ message: 'Login exitoso. Copia tu token y pégalo en Authorize para usar la API.', token });
  } catch (err) {
    res.status(400).json({ error: 'Ocurrió un error al iniciar sesión. Intenta nuevamente.' });
  }
}; 