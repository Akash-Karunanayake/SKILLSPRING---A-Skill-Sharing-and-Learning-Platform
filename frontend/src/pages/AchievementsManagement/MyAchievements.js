import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import Modal from 'react-modal';
import '../PostManagement/ModernUI.css';

Modal.setAppElement('#root');

function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, [userId]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter achievements based on title or description
    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievements?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievements deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievements.');
        }
      } catch (error) {
        console.error('Error deleting Achievements:', error);
      }
    }
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  return (
    <div className="modern-page">
      <NavBar />
      <div className='modern-container'>
        <div className='modern-header'>
          <h1 className="modern-title">My Achievements</h1>
          <p className="modern-subtitle">Track and showcase your professional accomplishments</p>
        </div>
        
        <div className='modern-search-container'>
          <div className='modern-search-box'>
            <IoSearchOutline className="modern-search-icon" />
            <input
              type="text"
              className="modern-search-input"
              placeholder="Search your achievements by title or description"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className='modern-add-btn' onClick={() => (window.location.href = '/addAchievements')}>
          <IoIosCreate className='modern-add-icon' />
          <span className="modern-add-text">Add Achievement</span>
        </div>
        
        <div className='modern-posts-container'>
          {filteredData.length === 0 ? (
            <div className='modern-empty-state'>
              <div className='modern-empty-illustration'>
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60 15L71.3 38L97 41.5L78.5 59.2L83 85L60 73L37 85L41.5 59.2L23 41.5L48.7 38L60 15Z" stroke="#8BA4FE" strokeWidth="6" fill="#EEF2FF"/>
                  <path d="M40 95H80M50 105H70" stroke="#8BA4FE" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className='modern-empty-title'>No achievements found</h2>
              <p className='modern-empty-message'>Start by adding a new achievement to showcase your skills</p>
              <button 
                className='modern-enhanced-btn' 
                onClick={() => (window.location.href = '/addAchievements')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#4D7CFE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(77, 124, 254, 0.3)',
                  marginTop: '16px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(77, 124, 254, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(77, 124, 254, 0.3)';
                }}
              >
                <IoIosCreate size={18} />
                Add New Achievement
              </button>
            </div>
          ) : (
            filteredData.map((achievement) => (
              <div key={achievement.id} className='modern-card'>
                <div className='modern-card-header'>
                  <div className='modern-user-info'>
                    <div className='modern-avatar'>{achievement.postOwnerName[0].toUpperCase()}</div>
                    <div className='modern-user-name'>{achievement.postOwnerName}</div>
                  </div>
                  
                  <div className='modern-actions'>
                    <button className='modern-icon-btn' onClick={() => (window.location.href = `/updateAchievements/${achievement.id}`)}>
                      <FaEdit />
                    </button>
                    <button className='modern-icon-btn modern-delete-btn' onClick={() => handleDelete(achievement.id)}>
                      <RiDeleteBin6Fill />
                    </button>
                  </div>
                </div>
                
                <div className='modern-card-content'>
                  <h2 className='modern-post-title'>{achievement.title}</h2>
                  <p className='modern-post-description' style={{ whiteSpace: "pre-line" }}>{achievement.description}</p>
                  <div className='modern-post-date'>
                    <span className='modern-date-tag'>{achievement.date}</span>
                  </div>
                </div>
                
                {achievement.imageUrl && (
                  <div className="modern-media-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div 
                      className="modern-media-item"
                      onClick={() => openModal(`http://localhost:8080/achievements/images/${achievement.imageUrl}`)}
                    >
                      <img 
                        className="modern-media" 
                        src={`http://localhost:8080/achievements/images/${achievement.imageUrl}`} 
                        alt="Achievement" 
                      />
                    </div>
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
        contentLabel="Image Modal"
        className="modern-modal"
        overlayClassName="modern-modal-overlay"
      >
        <button className="modern-close-btn" onClick={closeModal}>×</button>
        {selectedImage && (
          <div className="modern-modal-content">
            <img src={selectedImage} alt="Achievement" className="modern-modal-media" />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MyAchievements;
