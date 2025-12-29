import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/schemas';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // For demo purposes, find user by email
      const users = db.getAllUsers();
      const user = users.find((u) => u.email === email);

      if (!user) {
        setError('Email or password incorrect');
        setIsLoading(false);
        return;
      }

      // In production, would verify password hash
      if (!user.password_hash || user.password_hash !== password) {
        setError('Email or password incorrect');
        setIsLoading(false);
        return;
      }

      // Store current user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'DOCTOR') {
        navigate('/dashboard/doctor');
      } else if (user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background SVG */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/src/assets/backgoround of login page.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-playfair text-6xl font-bold text-gray-900 mb-4" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}>Nayanthara</h1>
          <p className="font-body text-2xl text-gray-900 font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Welcome back</p>
        </motion.div>

        <motion.div
          className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-2 border-white/50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-body font-bold text-gray-900 mb-3 text-xl">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-lg border-2 border-gray-400 focus:outline-none focus:border-orange-600 font-body text-xl"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block font-body font-bold text-ayur-slate mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body text-lg"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                className="p-4 bg-pitta-fire/10 border border-pitta-fire rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-body text-sm text-pitta-fire">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 mt-6 bg-ayur-gold text-white font-body font-bold rounded-lg hover:bg-ayur-olive transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </motion.button>

            <p className="text-center font-body text-sm text-ayur-slate/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-ayur-gold hover:underline font-bold">
                Register
              </Link>
            </p>

            <div className="pt-6 border-t border-ayur-gold/20 text-center">
              <p className="font-body text-xs text-ayur-slate/50 mb-3">Demo Accounts</p>
              <div className="space-y-2 text-xs font-body">
                <p className="text-ayur-slate/60">
                  <span className="font-bold">Parent:</span> parent@demo.com / password
                </p>
                <p className="text-ayur-slate/60">
                  <span className="font-bold">Doctor:</span> doctor@demo.com / password
                </p>
                <p className="text-ayur-slate/60">
                  <span className="font-bold">Admin:</span> admin@demo.com / password
                </p>
              </div>
            </div>
          </form>

          {/* Back to Home */}
          <Link
            to="/"
            className="block text-center mt-6 text-ayur-gold hover:text-ayur-olive font-body font-bold text-sm"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
