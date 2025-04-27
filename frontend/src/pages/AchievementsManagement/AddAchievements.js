import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import '../../Pages/PostManagement/AddNewPost.css'; // Import the CSS from AddNewPost

function AddAchievements() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert(`Only image files are allowed.`);
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove preview image
  const handleRemoveImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        imageUrl = await uploadResponse.text();
      }

      const response = await fetch('http://localhost:8080/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl }),
      });
      
      if (response.ok) {
        alert('Achievement added successfully!');
        window.location.href = '/myAchievements';
      } else {
        throw new Error('Failed to add Achievement');
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
      alert('Failed to add Achievement: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-post-page">
      <NavBar />
      <div className="add-post-container">
        <div className="post-form-card">
          <h1 className="form-title">Add Achievement</h1>
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter achievement title..."
                value={formData.title}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your achievement..."
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="form-textarea"
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Image</label>
              <div className="file-upload-container">
                <label className="file-upload-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Choose Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    className="hidden-input"
                    required={!imagePreview}
                  />
                </label>
                <span className="file-limit-info">Max: Image size 50MB</span>
              </div>
              
              {imagePreview && (
                <div className="media-preview-grid">
                  <div className="media-preview-item">
                    <img 
                      className="media-preview image-preview" 
                      src={imagePreview} 
                      alt="Achievement Preview" 
                    />
                    <button 
                      type="button" 
                      className="remove-media-btn" 
                      onClick={handleRemoveImage}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Achievement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAchievements;
