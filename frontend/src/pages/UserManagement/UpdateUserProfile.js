import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import '../PostManagement/AddNewPost.css'; // Import the AddNewPost styles

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [], // Added skills field
    bio: '', // Added bio field
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };
  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };
  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        window.location.href = '/userProfile'; // Redirect to user profile page
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="add-post-page">
      <NavBar />
      <div className="add-post-container">
        <div className="post-form-card">
          <h1 className="form-title">Update Your Profile</h1>
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-input"
                type="text"
                name="fullname"
                placeholder="Your full name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                className="form-input"
                type="text"
                name="phone"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
              />
            </div>
            
            <div className="form-group">
              <label>Bio</label>
              <textarea
                className="form-textarea"
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label>Skills</label>
              <div className="file-upload-container">
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flexGrow: 1 }}
                  />
                  <button 
                    type="button" 
                    className="file-upload-btn"
                    onClick={handleAddSkill}
                  >
                    <IoMdAdd /> Add
                  </button>
                </div>
              </div>
              {formData.skills.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px', 
                  marginTop: '12px'
                }}>
                  {formData.skills.map((skill, index) => (
                    <div key={index} style={{
                      background: '#e5e7eb',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {skill}
                      <button
                        type="button"
                        style={{
                          background: 'rgba(0,0,0,0.1)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '12px'
                        }}
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="file-upload-container">
                <label className="file-upload-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Choose Profile Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden-input"
                  />
                </label>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                {previewImage ? (
                  <div className="media-preview-item">
                    <img
                      src={previewImage}
                      alt="Selected Profile"
                      className="media-preview"
                      style={{ borderRadius: '50%', width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                ) : formData.profilePicturePath ? (
                  <div className="media-preview-item">
                    <img
                      src={`http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                      alt="Current Profile"
                      className="media-preview"
                      style={{ borderRadius: '50%', width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <p className="file-limit-info">No profile picture selected</p>
                )}
              </div>
            </div>
            
            <button type="submit" className="submit-btn">
              <span>Update Profile</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
