import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './AddNewPost.css'; 

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [categories, setCategories] = useState('');
  const userID = localStorage.getItem('userID');

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        // Validate video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      // Add file preview object with type and URL
      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  // Add function to handle removing media items
  const handleRemoveMedia = (indexToRemove) => {
    // Create new arrays without the item at the specified index
    const updatedMedia = media.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = mediaPreviews.filter((_, index) => index !== indexToRemove);
    
    // Update state with the new arrays
    setMedia(updatedMedia);
    setMediaPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  return (
    <div className="add-post-page">
      <NavBar />
      <div className="add-post-container">
        <div className="post-form-card">
          <h1 className="form-title">Create New Post</h1>
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Tell your story..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="form-textarea"
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                required
                className="form-select"
              >
                <option value="" disabled>Select Category</option>
                <option value="Web Designing">Web Designing</option>
                <option value="Programming">Programming</option>
                <option value="Data Science">Data Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Media</label>
              <div className="file-upload-container">
                <label className="file-upload-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Choose Files
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,video/mp4"
                    multiple
                    onChange={handleMediaChange}
                    className="hidden-input"
                  />
                </label>
                <span className="file-limit-info">Max: 3 images, 1 video up to 30s (50MB each)</span>
              </div>
              
              {mediaPreviews.length > 0 && (
                <div className="media-preview-grid">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="media-preview-item">
                      {preview.type.startsWith('video/') ? (
                        <video controls className="media-preview video-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          className="media-preview image-preview" 
                          src={preview.url} 
                          alt={`Preview ${index}`} 
                        />
                      )}
                      <button 
                        type="button" 
                        className="remove-media-btn" 
                        onClick={() => handleRemoveMedia(index)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button type="submit" className="submit-btn">
              <span>Publish Post</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;
