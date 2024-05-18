const User = require('../models/userModel');

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({ name: username, email, password });
    req.session.user = { id: user.id, username: user.name, email: user.email };
    req.session.isAuthenticated = true;
    res.redirect('/home');
  } catch (err) {
    res.status(500).send('Error signing up');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    req.session.user = { id: user.id, username: user.name, email: user.email };
    req.session.isAuthenticated = true;
    res.redirect('/home');
  } catch (err) {
    res.status(401).send('Invalid email or password');
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

const renderSignupForm = (req, res) => {
  res.render('signup');
};

const renderLoginForm = (req, res) => {
  res.render('login');
};

const renderHomePage = (req, res) => {
  res.render('home');
};

module.exports = { signup, login, logout, renderSignupForm, renderLoginForm, renderHomePage };