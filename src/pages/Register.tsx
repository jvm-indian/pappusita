import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/schemas';
import type { User } from '../lib/schemas';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'PARENT' | 'DOCTOR' | 'ADMIN' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    childAge: '',
    childDisabilities: [] as string[],
    symptoms: '',
    licenseNumber: '',
    specialization: '',
  });

  const handleRoleSelect = (selectedRole: 'PARENT' | 'DOCTOR' | 'ADMIN') => {
    setRole(selectedRole);
    setStep('details');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDisabilityToggle = (disability: string) => {
    setFormData((prev) => ({
      ...prev,
      childDisabilities: prev.childDisabilities.includes(disability)
        ? prev.childDisabilities.filter((d) => d !== disability)
        : [...prev.childDisabilities, disability],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      let newUser: User;

      if (role === 'PARENT') {
        newUser = db.createUser({
          role: 'PARENT',
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
          parent_email: formData.email,
          karma_points: 0,
          gita_unlocked_chapters: [],
          is_verified: true,
        });

        // Create child profile
        const child = db.createUser({
          role: 'CHILD',
          name: formData.name || 'My Child',
          email: `child-${Date.now()}@nayanthara.local`,
          password_hash: 'child-account',
          age: parseInt(formData.childAge),
          disabilities: formData.childDisabilities as any[],
          symptoms_narrative: formData.symptoms,
          parent_email: formData.email,
          is_verified: true,
          karma_points: 0,
          gita_unlocked_chapters: [],
        });

        alert('Registration successful! Child profile created.');
      } else if (role === 'DOCTOR') {
        newUser = db.createUser({
          role: 'DOCTOR',
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
          license_number: formData.licenseNumber,
          specialization: formData.specialization,
          is_verified: false,
          patient_limit: 20,
          current_patients: [],
          karma_points: 0,
          gita_unlocked_chapters: [],
        });

        alert('Registration pending. Your credentials will be verified within 24 hours.');
      } else {
        newUser = db.createUser({
          role: 'ADMIN',
          name: formData.name,
          email: formData.email,
          password_hash: formData.password,
          is_verified: true,
          karma_points: 0,
          gita_unlocked_chapters: [],
        });
      }

      // Store in localStorage for demo
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // Redirect to dashboard by role
      if (newUser.role === 'DOCTOR') {
        navigate('/dashboard/doctor')
      } else if (newUser.role === 'ADMIN') {
        navigate('/dashboard/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-sage/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-playfair text-4xl font-bold text-ayur-slate mb-2">Nayanthara</h1>
          <p className="font-body text-ayur-slate/60">Join our healing community</p>
        </motion.div>

        {step === 'role' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <h2 className="font-playfair text-2xl font-bold text-ayur-slate text-center mb-8">
              Who are you?
            </h2>

            <button
              onClick={() => handleRoleSelect('PARENT')}
              className="w-full p-6 rounded-2xl border-2 border-ayur-gold/30 hover:border-ayur-gold hover:bg-ayur-gold/10 transition text-left"
            >
              <span className="text-3xl block mb-2">👨‍👩‍👧</span>
              <h3 className="font-playfair text-lg font-bold text-ayur-slate">Parent/Guardian</h3>
              <p className="font-body text-sm text-ayur-slate/60 mt-2">
                Register your child for therapeutic games
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('DOCTOR')}
              className="w-full p-6 rounded-2xl border-2 border-ayur-sage/30 hover:border-ayur-sage hover:bg-ayur-sage/10 transition text-left"
            >
              <span className="text-3xl block mb-2">⚕️</span>
              <h3 className="font-playfair text-lg font-bold text-ayur-slate">Doctor</h3>
              <p className="font-body text-sm text-ayur-slate/60 mt-2">
                Join as a verified healthcare professional
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('ADMIN')}
              className="w-full p-6 rounded-2xl border-2 border-pitta-fire/30 hover:border-pitta-fire hover:bg-pitta-fire/10 transition text-left"
            >
              <span className="text-3xl block mb-2">🔐</span>
              <h3 className="font-playfair text-lg font-bold text-ayur-slate">Administrator</h3>
              <p className="font-body text-sm text-ayur-slate/60 mt-2">
                Verify doctors and allocate patients
              </p>
            </button>
          </motion.div>
        )}

        {step === 'details' && role && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 bg-white p-8 rounded-3xl shadow-lg"
          >
            <button
              type="button"
              onClick={() => setStep('role')}
              className="text-sm text-ayur-gold hover:underline mb-4"
            >
              ← Back
            </button>

            {/* Common Fields */}
            <div>
              <label className="block font-body font-bold text-ayur-slate mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                required
              />
            </div>

            <div>
              <label className="block font-body font-bold text-ayur-slate mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                required
              />
            </div>

            <div>
              <label className="block font-body font-bold text-ayur-slate mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                required
              />
            </div>

            <div>
              <label className="block font-body font-bold text-ayur-slate mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                required
              />
            </div>

            {/* Parent-specific Fields */}
            {role === 'PARENT' && (
              <>
                <div>
                  <label className="block font-body font-bold text-ayur-slate mb-2">Child's Age</label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                    required
                  />
                </div>

                <div>
                  <label className="block font-body font-bold text-ayur-slate mb-3">Condition(s)</label>
                  <div className="space-y-2">
                    {['ADHD', 'AUTISM', 'DYSLEXIA', 'ANXIETY'].map((disability) => (
                      <label key={disability} className="flex items-center font-body cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.childDisabilities.includes(disability)}
                          onChange={() => handleDisabilityToggle(disability)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="ml-3 text-ayur-slate">{disability}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-body font-bold text-ayur-slate mb-2">Describe symptoms</label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Doctor-specific Fields */}
            {role === 'DOCTOR' && (
              <>
                <div>
                  <label className="block font-body font-bold text-ayur-slate mb-2">Medical License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                    required
                  />
                </div>

                <div>
                  <label className="block font-body font-bold text-ayur-slate mb-2">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-ayur-gold/30 focus:outline-none focus:border-ayur-gold font-body"
                    placeholder="e.g., Pediatric Psychiatry"
                    required
                  />
                </div>

                <div className="p-3 bg-ayur-gold/10 rounded-lg border border-ayur-gold/20 text-sm font-body text-ayur-slate">
                  ℹ️ Your credentials will be verified within 24 hours by our admin team.
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-6 bg-ayur-gold text-white font-body font-bold rounded-lg hover:bg-ayur-olive transition"
            >
              Create Account
            </button>

            <p className="text-center font-body text-sm text-ayur-slate/60">
              Already have an account?{' '}
              <Link to="/login" className="text-ayur-gold hover:underline font-bold">
                Log in
              </Link>
            </p>
          </motion.form>
        )}
      </div>
    </div>
  );
}
