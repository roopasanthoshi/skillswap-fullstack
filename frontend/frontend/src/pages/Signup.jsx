import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Signup = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/signup', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#b026ff] to-[#ff0055] rounded-2xl blur opacity-20" />
        <Card variant="glass" className="relative p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0B0E14] border border-white/10 mb-4 shadow-[0_0_15px_rgba(176,38,255,0.2)]">
              <UserPlus className="w-8 h-8 text-[#b026ff]" />
            </div>
            <h2 className="text-3xl font-bold">Initialize Node</h2>
            <p className="text-slate-400 mt-2">Create your identity in the Nexus</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-center justify-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="text"
                name="name"
                placeholder="Designation (Name)"
                required
                value={formData.name}
                onChange={handleChange}
                className="pl-12"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-12"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Security Key (Password)"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-12"
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Establish Connection
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-[#b026ff] hover:text-white transition-colors">
              Access System
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
