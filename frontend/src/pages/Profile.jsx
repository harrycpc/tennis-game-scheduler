import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDesign } from '../context/DesignContext';
import axiosInstance from '../axiosConfig';

export function Profile() {
  const { user } = useAuth();
  const { mode } = useDesign();
  const isLoFi = mode === 'lofi';

  const [formData, setFormData] = useState({ name: '', email: '', university: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name,
          email: response.data.email,
          university: response.data.university || '',
          address: response.data.address || '',
        });
      } catch (error) {
        setMessage('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return <div className={`p-4 text-center ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Loading...</div>;
  }

  const inputClass = isLoFi
    ? 'w-full px-4 py-3 bg-white border-2 border-[#999999] text-[#000000] placeholder:text-[#999999] focus:border-[#000000] outline-none'
    : 'w-full px-4 py-3 bg-transparent border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#666666] focus:border-[#CCFF00] outline-none transition-colors';

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className={`font-bold mb-1 ${isLoFi ? 'text-[#333333] text-base' : 'text-white text-2xl'}`}>
          {isLoFi ? '[YOUR PROFILE]' : 'Your Profile'}
        </h2>
        <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Manage your account details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-3 text-sm ${
            message.includes('success')
              ? isLoFi ? 'bg-white border-2 border-[#000000] text-[#000000]' : 'bg-[#CCFF00]/10 border border-[#CCFF00] text-[#CCFF00] rounded-lg'
              : isLoFi ? 'bg-white border-2 border-[#CC0000] text-[#CC0000]' : 'bg-[#FF3B30]/10 border border-[#FF3B30] text-[#FF3B30] rounded-lg'
          }`}>
            {message}
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
            {isLoFi ? '[NAME]' : 'Name'}
          </label>
          <input type="text" placeholder="Name" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
            {isLoFi ? '[EMAIL]' : 'Email'}
          </label>
          <input type="email" placeholder="Email" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
            {isLoFi ? '[UNIVERSITY]' : 'University'}
          </label>
          <input type="text" placeholder="University" value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })} className={inputClass} />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
            {isLoFi ? '[ADDRESS]' : 'Address'}
          </label>
          <input type="text" placeholder="Address" value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
        </div>

        <button type="submit" disabled={loading}
          className={`w-full py-3 font-bold transition-opacity hover:opacity-90 ${
            isLoFi ? 'bg-[#000000] text-white border-4 border-[#000000]' : 'bg-[#CCFF00] text-[#121212] rounded-lg shadow-lg'
          }`}>
          {loading ? (isLoFi ? '[UPDATING...]' : 'Updating...') : (isLoFi ? '[UPDATE PROFILE]' : 'Update Profile')}
        </button>
      </form>
    </div>
  );
}

export default Profile;
