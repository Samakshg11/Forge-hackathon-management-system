import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const showToast = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        ...formData,
        skills: skillsArray,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 bg-surface border border-border-subtle p-6 rounded-xl">
        <Avatar src={user.avatarUrl} name={user.name} size="xl" />
        <div>
          <h1 className="text-xl font-bold font-display text-text-primary">{user.name}</h1>
          <p className="text-xs text-text-secondary">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge role={user.role} />
            <span className="text-xs font-mono text-accent-primary">Completion: {user.profileCompletion || 0}%</span>
          </div>
        </div>
      </div>

      <Card className="space-y-6">
        <h2 className="text-lg font-bold font-display text-text-primary">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Bio"
            placeholder="Tell organizers and teammates about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />

          <Input
            label="Skills (comma-separated)"
            placeholder="React, Node.js, Python, UI/UX"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />

          <Input
            label="GitHub Profile URL"
            placeholder="https://github.com/username"
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
          />

          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/username"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Save Profile
          </Button>
        </form>
      </Card>
    </div>
  );
}
