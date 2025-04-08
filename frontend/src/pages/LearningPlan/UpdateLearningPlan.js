import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css'
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { FaTimes } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { motion } from "framer-motion";

function UpdateLearningPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize UI state based on existing data
  useEffect(() => {
    if (contentURL) {
      setShowContentURLInput(true);
    }
    if (existingImage) {
      setShowImageUploadInput(true);
    }
  }, [contentURL, existingImage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="modern-ui-container">
      <NavBar />
      <div className="modern-content-container">
        <motion.div 
          className="modern-form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="modern-heading">Update Learning Plan</h1>
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="modern-form-group">
              <label className="modern-label">Title</label>
              <input
                className="modern-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter a compelling title"
              />
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Description</label>
              <textarea
                className="modern-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your learning plan in detail"
                required
                rows={4}
              />
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Tags</label>
              <div className="modern-tags-container">
                {tags.map((tag, index) => (
                  <div className="modern-tag" key={index}>
                    <span>#{tag}</span>
                    <FaTimes 
                      className="modern-tag-remove" 
                      onClick={() => handleDeleteTag(index)} 
                    />
                  </div>
                ))}
              </div>
              <div className="modern-tag-input-container">
                <input
                  className="modern-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags and press Enter"
                />
                <button 
                  type="button" 
                  className="modern-tag-add-btn" 
                  onClick={handleAddTag}
                >
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="modern-form-row">
              <div className="modern-form-group">
                <label className="modern-label">Start Date</label>
                <input
                  className="modern-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="modern-form-group">
                <label className="modern-label">End Date</label>
                <input
                  className="modern-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Category</label>
              <select
                className="modern-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            <div className="modern-media-section">
              <h3>Enhance Your Post</h3>
              <div className="modern-media-buttons">
                <button 
                  type="button" 
                  className={`modern-media-btn ${showContentURLInput ? 'active' : ''}`}
                  onClick={() => setShowContentURLInput(!showContentURLInput)}
                >
                  <FaVideo /> Add Video
                </button>
                <button 
                  type="button" 
                  className={`modern-media-btn ${showImageUploadInput ? 'active' : ''}`}
                  onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                >
                  <FaImage /> Add Image
                </button>
              </div>
              
              {showContentURLInput && (
                <motion.div 
                  className="modern-form-group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="modern-label">Content URL</label>
                  <input
                    className="modern-input"
                    type="url"
                    value={contentURL}
                    onChange={(e) => setContentURL(e.target.value)}
                    placeholder="Enter YouTube or other video URL"
                  />
                </motion.div>
              )}
              
              {showImageUploadInput && (
                <motion.div 
                  className="modern-form-group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="modern-label">Upload Image</label>
                  {imagePreview && (
                    <div className="modern-image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                  {!imagePreview && existingImage && (
                    <div className="modern-image-preview">
                      <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" />
                    </div>
                  )}
                  <div className="modern-file-input">
                    <label className="modern-file-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="modern-file-hidden"
                      />
                      <span>Choose File</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="modern-template-selector">
              <h3>Choose Template Style</h3>
              <div className="modern-templates-grid">
                {[1, 2, 3].map(id => (
                  <div 
                    key={id}
                    className={`modern-template-card ${templateID === id ? 'selected' : ''}`}
                    onClick={() => setTemplateID(id)}
                  >
                    <div className="modern-template-preview">
                      <div className="modern-template-thumbnail"></div>
                      <h4>Template {id}</h4>
                      <p className="modern-template-description">
                        {id === 1 && "Classic layout with content first"}
                        {id === 2 && "Split layout with media side by side"}
                        {id === 3 && "Media showcase with content below"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="modern-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="modern-spinner"></span>
                  <span>Updating...</span>
                </>
              ) : (
                "Update Learning Plan"
              )}
            </button>
          </form>
        </motion.div>

        <motion.div 
          className="modern-preview-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="modern-preview-heading">Preview</h2>
          <div className="modern-preview-container">
            {templateID === 1 && (
              <div className="modern-template-preview template-1">
                <h3 className="preview-title">{title || "Title Preview"}</h3>
                <p className="preview-dates">
                  <HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}
                </p>
                <p className="preview-category">{category || "Category"}</p>
                <hr />
                <p className="preview-description">{description || "Description Preview"}</p>
                <div className="preview-tags">
                  {tags.map((tag, index) => (
                    <span key={index} className="preview-tag">#{tag}</span>
                  ))}
                </div>
                {(imagePreview || existingImage) && (
                  <div className="preview-media">
                    <img 
                      src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
                      alt="Preview" 
                    />
                  </div>
                )}
                {contentURL && (
                  <div className="preview-media">
                    <iframe
                      src={getEmbedURL(contentURL)}
                      title="Content Preview"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            )}
            
            {templateID === 2 && (
              <div className="modern-template-preview template-2">
                <h3 className="preview-title">{title || "Title Preview"}</h3>
                <p className="preview-dates">
                  <HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}
                </p>
                <p className="preview-category">{category || "Category"}</p>
                <hr />
                <p className="preview-description">{description || "Description Preview"}</p>
                <div className="preview-tags">
                  {tags.map((tag, index) => (
                    <span key={index} className="preview-tag">#{tag}</span>
                  ))}
                </div>
                <div className="preview-media-split">
                  {(imagePreview || existingImage) && (
                    <div className="preview-media-item">
                      <img 
                        src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
                        alt="Preview" 
                      />
                    </div>
                  )}
                  {contentURL && (
                    <div className="preview-media-item">
                      <iframe
                        src={getEmbedURL(contentURL)}
                        title="Content Preview"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {templateID === 3 && (
              <div className="modern-template-preview template-3">
                {(imagePreview || existingImage) && (
                  <div className="preview-media">
                    <img 
                      src={imagePreview || `http://localhost:8080/learningPlan/planImages/${existingImage}`} 
                      alt="Preview" 
                    />
                  </div>
                )}
                {contentURL && (
                  <div className="preview-media">
                    <iframe
                      src={getEmbedURL(contentURL)}
                      title="Content Preview"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                <h3 className="preview-title">{title || "Title Preview"}</h3>
                <p className="preview-dates">
                  <HiCalendarDateRange /> {startDate || "Start"} to {endDate || "End"}
                </p>
                <p className="preview-category">{category || "Category"}</p>
                <hr />
                <p className="preview-description">{description || "Description Preview"}</p>
                <div className="preview-tags">
                  {tags.map((tag, index) => (
                    <span key={index} className="preview-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {!templateID && (
              <div className="template-placeholder">
                <p>Select a template to see preview</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;
