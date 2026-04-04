import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Trophy, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';

export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { mode } = useDesign();
  const isLoFi = mode === 'lofi';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const success = await signUp(email, password, name);
    if (success) {
      navigate('/login');
    } else {
      setError('An account with this email already exists');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isLoFi ? 'bg-[#E8E8E8]' : 'bg-[#121212]'}`}>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-8 text-center">
            {isLoFi ? (
              <div className="w-16 h-16 mx-auto border-4 border-[#000000] bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-[#000000]">T</span>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#CCFF00] to-[#9FCC00] rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-[#121212]" />
              </div>
            )}
            <h1 className={`mt-4 font-bold ${isLoFi ? 'text-[#000000] text-xl' : 'text-white text-2xl'}`}>
              {isLoFi ? '[CREATE ACCOUNT]' : 'Create Account'}
            </h1>
            <p className={`mt-2 text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
              {isLoFi ? '[JOIN THE TOURNAMENT]' : 'Join the tennis tournament today'}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`p-3 flex items-center gap-2 ${
                isLoFi ? 'bg-white border-2 border-[#000000]' : 'bg-[#FF3B30]/10 border border-[#FF3B30] rounded-lg'
              }`}>
                <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isLoFi ? 'text-[#000000]' : 'text-[#FF3B30]'}`} />
                <p className={`text-sm ${isLoFi ? 'text-[#000000]' : 'text-[#FF3B30]'}`}>{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
                {isLoFi ? '[NAME]' : 'Full Name'}
              </label>
              <div className="relative">
                {!isLoFi && <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isLoFi ? '[YOUR NAME]' : 'John Doe'}
                  className={`w-full px-4 py-3 bg-transparent border outline-none transition-colors ${
                    isLoFi
                      ? 'border-2 border-[#999999] text-[#000000] placeholder:text-[#999999] focus:border-[#000000]'
                      : 'pl-11 border-[#2A2A2A] rounded-lg text-white placeholder:text-[#666666] focus:border-[#CCFF00]'
                  }`}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
                {isLoFi ? '[EMAIL]' : 'Email'}
              </label>
              <div className="relative">
                {!isLoFi && <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isLoFi ? '[YOUR EMAIL]' : 'you@example.com'}
                  className={`w-full px-4 py-3 bg-transparent border outline-none transition-colors ${
                    isLoFi
                      ? 'border-2 border-[#999999] text-[#000000] placeholder:text-[#999999] focus:border-[#000000]'
                      : 'pl-11 border-[#2A2A2A] rounded-lg text-white placeholder:text-[#666666] focus:border-[#CCFF00]'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
                {isLoFi ? '[PASSWORD]' : 'Password'}
              </label>
              <div className="relative">
                {!isLoFi && <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLoFi ? '[YOUR PASSWORD]' : '••••••••'}
                  className={`w-full px-4 py-3 bg-transparent border outline-none transition-colors ${
                    isLoFi
                      ? 'border-2 border-[#999999] text-[#000000] placeholder:text-[#999999] focus:border-[#000000]'
                      : 'pl-11 border-[#2A2A2A] rounded-lg text-white placeholder:text-[#666666] focus:border-[#CCFF00]'
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-[#666666]">
                {isLoFi ? '[MIN 6 CHARACTERS]' : 'Minimum 6 characters'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 ${
                isLoFi
                  ? 'bg-[#000000] text-white border-4 border-[#000000]'
                  : 'bg-[#CCFF00] text-[#121212] rounded-lg shadow-lg'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              {isLoFi ? '[CREATE ACCOUNT]' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
              {isLoFi ? '[ALREADY HAVE ACCOUNT?]' : 'Already have an account?'}{' '}
              <Link to="/login" className={`font-bold ${isLoFi ? 'text-[#000000] underline' : 'text-[#CCFF00]'}`}>
                {isLoFi ? '[SIGN IN]' : 'Sign In'}
              </Link>
            </p>
          </div>

          {/* Back to Welcome */}
          <div className="mt-4 text-center">
            <Link to="/" className={`text-sm ${isLoFi ? 'text-[#666666] underline' : 'text-[#666666]'}`}>
              {isLoFi ? '[BACK TO WELCOME]' : 'Back to Welcome'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
