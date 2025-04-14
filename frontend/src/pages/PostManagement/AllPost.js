import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { FaCommentAlt } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import './ModernUI.css';
Modal.setAppElement('#root');

function AllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        setPosts(response.data);
        setFilteredPosts(response.data); // Initially show all posts

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                // Handle case where user is deleted
                console.warn(`User with ID ${userID} not found. Removing their posts.`);
                setPosts((prevPosts) => prevPosts.filter((post) => post.userID !== userID));
                setFilteredPosts((prevFilteredPosts) => prevFilteredPosts.filter((post) => post.userID !== userID));
              } else {
                console.error(`Error fetching user details for userID ${userID}:`, error);
              }
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

  

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      // Show all posts
      setFilteredPosts(posts);
    } else {
      // Filter posts by logged-in user ID
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts); // Toggle the state
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      


  
      
      
     
  

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <div className="modern-page">
      <NavBar />
      <div className='modern-container'>
        <div className='modern-header'>
          <h1 className="modern-title">Skill Posts</h1>
          <p className="modern-subtitle">Discover and share knowledge with the community</p>
        </div>
        
        <div className='modern-search-container'>
          <div className='modern-search-box'>
            <IoSearchOutline className="modern-search-icon" />
            <input
              type="text"
              className="modern-search-input"
              placeholder="Search posts by title, description, or category"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className='modern-add-btn' onClick={() => (window.location.href = '/addNewPost')}>
          <IoIosCreate className='modern-add-icon' />
          <span className="modern-add-text">Create Post</span>
        </div>
        
        <div className='modern-posts-container'>
          {filteredPosts.length === 0 ? (
            <div className='modern-empty-state'>
              <div className='modern-empty-illustration'></div>
              <h2 className='modern-empty-title'>No posts found</h2>
              <p className='modern-empty-message'>Start by creating a new post to share with the community</p>
              <button className='modern-empty-create-btn' onClick={() => (window.location.href = '/addNewPost')}>
                <IoIosCreate className='modern-btn-icon' />
                <span>Create New Post</span>
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className='modern-card'>
                <div className='modern-card-header'>
                  <div className='modern-user-info'>
                    <div className='modern-avatar'>{(postOwners[post.userID] || 'A')[0].toUpperCase()}</div>
                    <div className='modern-user-name'>{postOwners[post.userID] || 'Anonymous'}</div>
                  </div>
                  
                  {post.userID !== loggedInUserID ? (
                    <button
                      className={followedUsers.includes(post.userID) ? 'modern-btn-outlined' : 'modern-btn-primary'}
                      onClick={() => handleFollowToggle(post.userID)}
                    >
                      {followedUsers.includes(post.userID) ? 'Unfollow' : 'Follow'}
                    </button>
                  ) : (
                    <div className='modern-actions'>
                      <button className='modern-icon-btn' onClick={() => handleUpdate(post.id)}>
                        <FaEdit />
                      </button>
                      <button className='modern-icon-btn modern-delete-btn' onClick={() => handleDelete(post.id)}>
                        <RiDeleteBin6Fill />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className='modern-card-content'>
                  <h2 className='modern-post-title'>{post.title}</h2>
                  <p className='modern-post-description'>{post.description}</p>
                  <div className='modern-post-category'>
                    <span className='modern-category-tag'>{post.category || 'Uncategorized'}</span>
                  </div>
                </div>
                
                {post.media && post.media.length > 0 && (
                  <div className="modern-media-grid" 
                       style={{ gridTemplateColumns: post.media.length === 1 ? '1fr' : 
                                                   post.media.length === 2 ? '1fr 1fr' :
                                                   post.media.length >= 3 ? '1fr 1fr 1fr' : '1fr' }}>
                    {post.media.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`modern-media-item ${post.media.length > 4 && index === 3 ? 'modern-media-overlay' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <video className="modern-media">
                            <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          </video>
                        ) : (
                          <img className="modern-media" src={`http://localhost:8080${mediaUrl}`} alt="Post content" />
                        )}
                        {post.media.length > 4 && index === 3 && (
                          <div className="modern-overlay-count">+{post.media.length - 4}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="modern-modal"
        overlayClassName="modern-modal-overlay"
      >
        <button className="modern-close-btn" onClick={closeModal}>×</button>
        {selectedMedia && (
          <div className="modern-modal-content">
            {selectedMedia.endsWith('.mp4') ? (
              <video controls className="modern-modal-media">
                <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={`http://localhost:8080${selectedMedia}`} alt="Media content" className="modern-modal-media" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AllPost;
