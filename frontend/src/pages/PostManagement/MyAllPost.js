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
Modal.setAppElement('#root');

function MyAllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        const userID = localStorage.getItem('userID'); // Get the logged-in user's ID

        // Filter posts to include only those with the logged-in user's ID
        const userPosts = response.data.filter((post) => post.userID === userID);

        setPosts(userPosts);
        setFilteredPosts(userPosts); // Initially show filtered posts

        // Fetch post owners' names
        const userIDs = [...new Set(userPosts.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
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

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
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

      // Update the specific post's likes in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = newComment[postId] || ''; // Get the comment content for the specific post
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });

      // Update the comment in state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setEditingComment({}); // Clear editing state
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter posts based on title, description, or category
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

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
          <h1 className="modern-title">My Skill Posts</h1>
          <p className="modern-subtitle">Manage and share your knowledge with the community</p>
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
              <button 
                className='modern-empty-state-btn' 
                onClick={() => (window.location.href = '/addNewPost')}
              >
                <IoIosCreate className='btn-icon' />
                Create New Post
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
                  
                  {post.userID === loggedInUserID && (
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
                            Your browser does not support the video tag.
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
                
                <div className='modern-card-footer'>
                  <div className='modern-interactions'>
                    <div className='modern-interaction-btn' onClick={() => handleLike(post.id)}>
                      <BiSolidLike
                        className={post.likes?.[localStorage.getItem('userID')] ? 'modern-liked' : ''}
                      />
                      <span>{Object.values(post.likes || {}).filter((liked) => liked).length}</span>
                    </div>
                    
                    <div className='modern-interaction-btn'>
                      <FaCommentAlt />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className='modern-comments-section'>
                    <div className='modern-comment-form'>
                      <input
                        type="text"
                        className='modern-comment-input'
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [post.id]: e.target.value })
                        }
                      />
                      <button className='modern-send-btn' onClick={() => handleAddComment(post.id)}>
                        <IoSend />
                      </button>
                    </div>
                    
                    <div className='modern-comments-list'>
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className='modern-comment'>
                          <div className='modern-comment-header'>
                            <div className='modern-comment-avatar'>
                              {comment.userFullName[0].toUpperCase()}
                            </div>
                            <div className='modern-comment-info'>
                              <span className='modern-comment-username'>{comment.userFullName}</span>
                              {editingComment.id === comment.id ? (
                                <div className='modern-edit-comment'>
                                  <input
                                    type="text"
                                    className='modern-edit-input'
                                    value={editingComment.content}
                                    onChange={(e) =>
                                      setEditingComment({ ...editingComment, content: e.target.value })
                                    }
                                    autoFocus
                                  />
                                  <div className='modern-edit-actions'>
                                    <button className='modern-icon-btn modern-save-btn'
                                      onClick={() => handleSaveComment(post.id, comment.id, editingComment.content)}>
                                      <FiSave />
                                    </button>
                                    <button className='modern-icon-btn modern-cancel-btn'
                                      onClick={() => setEditingComment({})}>
                                      <TbPencilCancel />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className='modern-comment-content'>{comment.content}</p>
                              )}
                            </div>
                            
                            {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                              <div className='modern-comment-actions'>
                                {comment.userID === loggedInUserID && !editingComment.id && (
                                  <button className='modern-icon-btn'
                                    onClick={() => setEditingComment({ id: comment.id, content: comment.content })}>
                                    <GrUpdate />
                                  </button>
                                )}
                                
                                {(comment.userID === loggedInUserID || post.userID === loggedInUserID) && (
                                  <button className='modern-icon-btn modern-delete-btn'
                                    onClick={() => handleDeleteComment(post.id, comment.id)}>
                                    <MdDelete />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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

export default MyAllPost;
