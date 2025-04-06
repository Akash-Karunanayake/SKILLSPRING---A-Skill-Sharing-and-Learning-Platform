import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './post.css';
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosCreate } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { motion } from 'framer-motion';

function MyLearningPlan() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchOwnerName, setSearchOwnerName] = useState('');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/learningPlan');
        const userPosts = response.data.filter(post => post.postOwnerID === userId); // Filter posts by userID
        setPosts(userPosts);
        setFilteredPosts(userPosts); // Initially show filtered posts
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []); // Ensure this runs only once on component mount

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
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/learningPlan/${id}`);
        alert('Post deleted successfully!');
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id)); // Update the list after deletion
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/updateLearningPlan/${id}`;
  };

  const renderPostByTemplate = (post) => {
    console.log('Rendering post:', post);
    if (!post.templateID) {
      console.warn('Missing templateID for post:', post);
      return <div className="template template-default">Invalid template ID</div>;
    }

    switch (post.templateID) {
      case 1:
        return (
          <div className="luxe-card">
            <div className="luxe-card-banner">
              <span className="luxe-category">{post.category}</span>
            </div>
            <div className="luxe-card-content">
              <div className="luxe-author-row">
                <div className="luxe-author">
                  <div className="luxe-avatar-ring">
                    <FaUserCircle className="luxe-avatar-icon" />
                  </div>
                  <div>
                    <h5 className="luxe-author-name">{post.postOwnerName}</h5>
                    <div className="luxe-date">
                      <HiCalendarDateRange />
                      <span>{post.startDate} - {post.endDate}</span>
                    </div>
                  </div>
                </div>
                
                {post.postOwnerID === localStorage.getItem('userID') && (
                  <div className="luxe-controls">
                    <motion.button 
                      className="luxe-control-btn luxe-edit"
                      onClick={() => handleUpdate(post.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button 
                      className="luxe-control-btn luxe-delete"
                      onClick={() => handleDelete(post.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RiDeleteBin6Fill />
                    </motion.button>
                  </div>
                )}
              </div>
              
              <h2 className="luxe-title">{post.title}</h2>
              
              <div className="luxe-description-container">
                <p className="luxe-description">{post.description}</p>
              </div>
              
              {post.tags?.length > 0 && (
                <div className="luxe-tags">
                  {post.tags.map((tag, index) => (
                    <motion.span 
                      key={index} 
                      className="luxe-tag"
                      whileHover={{ y: -3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              )}
              
              <div className="luxe-preview-part">
                <div className="luxe-preview-part-sub">
                  {post.imageUrl && (
                    <img
                      src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                      alt={post.title}
                      className="luxe-iframe-preview"
                    />
                  )}
                </div>
                <div className="luxe-preview-part-sub">
                  {post.contentURL && (
                    <iframe
                      src={getEmbedURL(post.contentURL)}
                      title={post.title}
                      className="luxe-iframe-preview"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="luxe-card">
            <div className="luxe-card-banner">
              <span className="luxe-category">{post.category}</span>
            </div>
            <div className="luxe-card-content">
              <div className="luxe-author-row">
                <div className="luxe-author">
                  <div className="luxe-avatar-ring">
                    <FaUserCircle className="luxe-avatar-icon" />
                  </div>
                  <div>
                    <h5 className="luxe-author-name">{post.postOwnerName}</h5>
                    <div className="luxe-date">
                      <HiCalendarDateRange />
                      <span>{post.startDate} - {post.endDate}</span>
                    </div>
                  </div>
                </div>
                
                {post.postOwnerID === localStorage.getItem('userID') && (
                  <div className="luxe-controls">
                    <motion.button 
                      className="luxe-control-btn luxe-edit"
                      onClick={() => handleUpdate(post.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button 
                      className="luxe-control-btn luxe-delete"
                      onClick={() => handleDelete(post.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RiDeleteBin6Fill />
                    </motion.button>
                  </div>
                )}
              </div>
              
              <h2 className="luxe-title">{post.title}</h2>
              
              <div className="luxe-description-container">
                <p className="luxe-description">{post.description}</p>
              </div>
              
              {post.tags?.length > 0 && (
                <div className="luxe-tags">
                  {post.tags.map((tag, index) => (
                    <motion.span 
                      key={index} 
                      className="luxe-tag"
                      whileHover={{ y: -3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              )}
              
              <div className="luxe-side-media">
                <div className="luxe-media-grid">
                  {post.imageUrl && (
                    <motion.div 
                      className="luxe-img-container"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                        alt={post.title}
                      />
                    </motion.div>
                  )}
                  
                  {post.contentURL && (
                    <motion.div 
                      className="luxe-video-container"
                      whileHover={{ scale: 1.02 }}
                    >
                      <iframe
                        src={getEmbedURL(post.contentURL)}
                        title={post.title}
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="luxe-card">
            <div className="luxe-card-banner">
              <span className="luxe-category">{post.category}</span>
            </div>
            <div className="luxe-card-content">
              <div className="luxe-author-row">
                <div className="luxe-author">
                  <div className="luxe-avatar-ring">
                    <FaUserCircle className="luxe-avatar-icon" />
                  </div>
                  <div>
                    <h5 className="luxe-author-name">{post.postOwnerName}</h5>
                  </div>
                </div>
                
                {post.postOwnerID === localStorage.getItem('userID') && (
                  <div className="luxe-controls">
                    <motion.button 
                      className="luxe-control-btn luxe-edit"
                      onClick={() => handleUpdate(post.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button 
                      className="luxe-control-btn luxe-delete"
                      onClick={() => handleDelete(post.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RiDeleteBin6Fill />
                    </motion.button>
                  </div>
                )}
              </div>
              
              {post.imageUrl && (
                <div className="luxe-media-top">
                  <img
                    src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                    alt={post.title}
                    className="luxe-media-full"
                  />
                </div>
              )}
              
              {post.contentURL && (
                <div className="luxe-media-top">
                  <iframe
                    src={getEmbedURL(post.contentURL)}
                    title={post.title}
                    className="luxe-media-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              <h2 className="luxe-title">{post.title}</h2>
              
              <div className="luxe-date-row">
                <HiCalendarDateRange />
                <span>{post.startDate} - {post.endDate}</span>
              </div>
              
              <div className="luxe-description-container">
                <p className="luxe-description">{post.description}</p>
              </div>
              
              {post.tags?.length > 0 && (
                <div className="luxe-tags">
                  {post.tags.map((tag, index) => (
                    <motion.span 
                      key={index} 
                      className="luxe-tag"
                      whileHover={{ y: -3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 10 }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        console.warn('Unknown templateID:', post.templateID);
        return (
          <div className="template template-default">
            <p>Unknown template ID: {post.templateID}</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className='continer'>
        <NavBar />
        <div className='continSection'>
          <div className='search-section'>
            <div className='searchinput'>
              <input
                type="text"
                placeholder="Search by title"
                value={searchOwnerName}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchOwnerName(value);
                  setFilteredPosts(
                    posts.filter((post) =>
                      post.title.toLowerCase().includes(value.toLowerCase())
                    )
                  );
                }}
                className="Auth_input modern-search"
              />
            </div>
            <motion.div 
              className='add_new_btn' 
              onClick={() => (window.location.href = '/addLearningPlan')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IoIosCreate className='add_new_btn_icon' />
            </motion.div>
          </div>
          <div className='post_card_continer'>
            {filteredPosts.length === 0 ? (
              <div className='not_found_box modern-not-found'>
                <div className='not_found_img'></div>
                <p className='not_found_msg'>No posts found. Please create a new post.</p>
                <motion.button 
                  className='not_found_btn'
                  onClick={() => (window.location.href = '/addLearningPlan')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create New Post
                </motion.button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <motion.div 
                  key={post.id} 
                  className='post_card_new'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPostByTemplate(post)}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyLearningPlan;
