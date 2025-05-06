import React, { useState } from 'react';
import { User, Mail, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only send username and email
      const updateData = {
        username: formData.username,
        email: formData.email
      };
      
      await updateUser(user.id, updateData);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <button 
          className="edit-button"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="avatar-section">
          <div className="avatar-container">
            <div className="avatar-ring">
              <div className="avatar-placeholder">
                {formData.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="avatar-status online"></div>
          </div>
          <div className="avatar-info">
            <h2>{formData.username}</h2>
            <span className="avatar-email">{formData.email}</span>
          </div>
        </div>

        <div className="form-group">
          <label>
            <User size={16} />
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={!editing}
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label>
            <Mail size={16} />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!editing}
            placeholder="Enter your email"
          />
        </div>

        {editing && (
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
              {!loading && <Save size={16} />}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setEditing(false)}
            >
              Cancel
              <X size={16} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;