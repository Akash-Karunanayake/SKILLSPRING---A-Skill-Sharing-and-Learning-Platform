import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import '../PostManagement/AddNewPost.css'; // Import the CSS from AddNewPost

function UpdateAchievements() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/achievements/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setSelectedFile(null);
    setRemoveExistingImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = removeExistingImage ? '' : formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update achievement data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Achievement updated successfully!');
        window.location.href = '/allAchievements';
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  // Media delete button styling (same as in UpdatePost)
  const mediaDeleteBtnStyle = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '25px',
    height: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    zIndex: '5'
  };

  return (
    <div className="add-post-page">
      <NavBar />
      <div className="add-post-container">
        <div className="post-form-card">
          <h1 className="form-title">Update Achievement</h1>
          <form onSubmit={handleSubmit} className="post-form">
            {/* Image Upload Section */}
            <div className="form-group">
              <label>Current Image</label>
              {previewImage ? (
                <div className="media-preview-grid">
                  <div className="media-preview-item" style={{ position: 'relative' }}>
                    <img
                      src={previewImage}
                      alt="Current Achievement"
                      className="media-preview image-preview"
                    />
                    <button
                      type="button"
                      style={mediaDeleteBtnStyle}
                      onClick={handleRemoveImage}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <p className="no-media-message">
                  {removeExistingImage ? 'Image will be removed' : 'No image uploaded'}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Upload New Image</label>
              <div className="file-upload-container">
                <label className="file-upload-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-input"
                  />
                </label>
                <span className="file-limit-info">Recommended size: 800x600 pixels</span>
              </div>
            </div>

            {/* Title Input */}
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="Enter achievement title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Description Textarea */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe your achievement"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                required
              />
            </div>

            {/* Category Select */}
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            {/* Date Input */}
            <div className="form-group">
              <label>Achievement Date</label>
              <input
                className="form-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Updating...' : 'Update Achievement'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateAchievements;