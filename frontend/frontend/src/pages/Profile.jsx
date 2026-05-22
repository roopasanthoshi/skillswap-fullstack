import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Edit2, X, Loader2, Zap, Crosshair, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', bio: '', avatarUrl: '' });
  
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [skillType, setSkillType] = useState('KNOWN');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      
      if (!res.data) {
        throw new Error('Profile data is null');
      }

      setProfile(res.data);
      setProfileData({
        name: res.data.name || '',
        bio: res.data.bio || '',
        avatarUrl: res.data.avatarUrl || ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put('/users/profile', profileData);
      setProfile(res.data);
      setEditingProfile(false);
      toast.success('Configuration saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('Image must be less than 2MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatarUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return toast.error('Skill name cannot be empty');

    try {
      const skillRes = await api.post('/skills', { name: newSkillName });
      const skillId = skillRes.data.id;
      
      if (skillType === 'KNOWN') {
        await api.post('/skills/known', { skillId, proficiency: 'INTERMEDIATE' });
      } else {
        await api.post('/skills/learning', { skillId });
      }
      
      toast.success('Skill added to matrix');
      setNewSkillName('');
      setShowAddSkill(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to integrate skill');
    }
  };

  const handleRemoveKnown = async (id) => {
    try {
      await api.delete(`/skills/known/${id}`);
      fetchProfile();
      toast.success('Skill removed');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLearning = async (id) => {
    try {
      await api.delete(`/skills/learning/${id}`);
      fetchProfile();
      toast.success('Skill removed');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Card className="h-64"><Skeleton className="w-full h-full" /></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="h-48"><Skeleton className="w-full h-full" /></Card>
          <Card className="h-48"><Skeleton className="w-full h-full" /></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Card variant="panel" className="relative overflow-hidden p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#b026ff]/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative group cursor-pointer" onClick={() => editingProfile && fileInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#b026ff] p-1">
              <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center text-4xl font-bold overflow-hidden relative">
                {(editingProfile ? profileData.avatarUrl : profile.avatarUrl) ? (
                  <img src={editingProfile ? profileData.avatarUrl : profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {editingProfile && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium">Upload</span>
                  </div>
                )}
              </div>
            </div>
            {editingProfile && (
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            )}
          </div>
          
          <div className="flex-grow w-full">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-4xl font-bold neon-text-blue">{profile.name}</h1>
              <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                {editingProfile ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {editingProfile ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input 
                    label="Designation" 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Biographical Data</label>
                    <textarea
                      value={profileData.bio}
                      onChange={e => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full bg-[#0d111a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] resize-none"
                      rows="3"
                      placeholder="Enter system parameters..."
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} className="w-full sm:w-auto">
                    Save Configuration
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-2xl"
                >
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {profile.bio || <span className="text-slate-500 italic">No biographical data found. Update configuration.</span>}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card variant="glass" className="flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="text-[#00f0ff]" /> Known Skills
            </h2>
            <Button variant="secondary" size="sm" onClick={() => { setSkillType('KNOWN'); setShowAddSkill(true); }}>
              Add Node
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-auto">
            {(!profile.knownSkills || profile.knownSkills.length === 0) ? (
              <p className="text-slate-500 italic w-full text-center py-4">No skill nodes active.</p>
            ) : (
              profile.knownSkills.map(ks => (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={ks.id} 
                  className="relative group px-4 py-2 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-xl flex items-center gap-2 hover:bg-[#00f0ff]/20 transition-colors"
                >
                  <span className="font-semibold text-[#00f0ff]">{ks.skill.name}</span>
                  <button 
                    onClick={() => handleRemoveKnown(ks.skillId)}
                    className="opacity-0 group-hover:opacity-100 text-[#00f0ff]/50 hover:text-[#00f0ff] transition-all ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        <Card variant="glass" className="flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crosshair className="text-[#b026ff]" /> Learning Goals
            </h2>
            <Button variant="secondary" size="sm" onClick={() => { setSkillType('LEARNING'); setShowAddSkill(true); }}>
              Target Node
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-auto">
            {(!profile.learningSkills || profile.learningSkills.length === 0) ? (
              <p className="text-slate-500 italic w-full text-center py-4">No targets locked.</p>
            ) : (
              profile.learningSkills.map(ls => (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={ls.id} 
                  className="relative group px-4 py-2 bg-[#b026ff]/10 border border-[#b026ff]/30 rounded-xl flex items-center gap-2 hover:bg-[#b026ff]/20 transition-colors"
                >
                  <span className="font-semibold text-[#b026ff]">{ls.skill.name}</span>
                  <button 
                    onClick={() => handleRemoveLearning(ls.skillId)}
                    className="opacity-0 group-hover:opacity-100 text-[#b026ff]/50 hover:text-[#b026ff] transition-all ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        title={skillType === 'KNOWN' ? 'Activate Known Skill' : 'Lock Learning Target'}
      >
        <form onSubmit={handleAddSkill} className="space-y-4">
          <Input 
            placeholder="E.g., Python, UI Design, AWS" 
            value={newSkillName}
            onChange={e => setNewSkillName(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">
            Integrate Protocol
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
