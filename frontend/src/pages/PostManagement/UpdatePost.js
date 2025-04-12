import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './AddNewPost.css'; // Import the CSS from AddNewPost

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [existingMedia, setExistingMedia] = useState([]); // Initialize as an empty array
  const [newMedia, setNewMedia] = useState([]); // New media files to upload
  const [loading, setLoading] = useState(true); // Add loading state
  const [mediaPreviews, setMediaPreviews] = useState([]); // For storing new media previews

  useEffect(() => {
    // Fetch the post details
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || ''); // Ensure title is not undefined
        setDescription(post.description || ''); // Ensure description is not undefined
        setCategory(post.category || ''); // Set category
        setExistingMedia(post.media || []); // Ensure media is an array
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl)); // Remove from UI
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
        } else {
          resolve();
        }
      };

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
  };

  const handleNewMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;

    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
        if (imageCount > maxImageCount) {
          alert('You can upload a maximum of 3 images.');
          return;
        }
        // Add preview for image
        previews.push({ type: file.type, url: URL.createObjectURL(file) });
      } else if (file.type === 'video/mp4') {
        videoCount++;
        if (videoCount > 1) {
          alert('You can upload only 1 video.');
          return;
        }

        try {
          await validateVideoDuration(file);
          // Add preview for video
          previews.push({ type: file.type, url: URL.createObjectURL(file) });
        } catch (error) {
          alert(error);
          return;
        }
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
    }

    setNewMedia(files);
    setMediaPreviews(previews);
  };

  const handleRemovePreview = (index) => {
    // Create new arrays without the item at the specified index
    const updatedPreviews = mediaPreviews.filter((_, i) => i !== index);
    const updatedNewMedia = Array.from(newMedia).filter((_, i) => i !== index);
    
    // Update state
    setMediaPreviews(updatedPreviews);
    setNewMedia(updatedNewMedia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category); // Include category in the update
    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  if (loading) {
    return <div className="add-post-page"><div className="add-post-container">Loading...</div></div>;
  }

  // Make sure the CSS class is properly styled to make buttons visible
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
          <h1 className="form-title">Update Post</h1>
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label>Current Media</label>
              {existingMedia.length > 0 ? (
                <div className="media-preview-grid">
                  {existingMedia.map((mediaUrl, index) => (
                    <div key={index} className="media-preview-item" style={{ position: 'relative' }}>
                      {mediaUrl.endsWith('.mp4') ? (
                        <video controls className="media-preview video-preview">
                          <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          className="media-preview image-preview" 
                          src={`http://localhost:8080${mediaUrl}`} 
                          alt={`Media ${index}`}
                        />
                      )}
                      <button
                        type="button"
                        style={mediaDeleteBtnStyle}
                        onClick={() => handleDeleteMedia(mediaUrl)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-media-message">No existing media files</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Add New Media</label>
              <div className="file-upload-container">
                <label className="file-upload-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Choose Files
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,video/mp4"
                    multiple
                    onChange={handleNewMediaChange}
                    className="hidden-input"
                  />
                </label>
                <span className="file-limit-info">Max: 3 images, 1 video up to 30s (50MB each)</span>
              </div>
              
              {mediaPreviews.length > 0 && (
                <div className="media-preview-grid">
                  {mediaPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="media-preview-item" style={{ position: 'relative' }}>
                      {preview.type.startsWith('video/') ? (
                        <video controls className="media-preview video-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          className="media-preview image-preview" 
                          src={preview.url} 
                          alt={`New Preview ${index}`} 
                        />
                      )}
                      <button
                        type="button"
                        style={mediaDeleteBtnStyle}
                        onClick={() => handleRemovePreview(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button type="submit" className="submit-btn">
              <span>Update Post</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;
