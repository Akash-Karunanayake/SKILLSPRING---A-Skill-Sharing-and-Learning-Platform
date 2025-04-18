import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import Modal from 'react-modal';
import '../PostManagement/ModernUI.css'; // Import the ModernUI CSS

Modal.setAppElement('#root');

function AllAchievements() {
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
        setProgressData(data);
        setFilteredData(data); // Initially show all data
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

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
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievement deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete achievement.');
        }
      } catch (error) {
        console.error('Error deleting achievement:', error);
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
          <h1 className="modern-title">All Achievements</h1>
          <p className="modern-subtitle">Discover and share professional accomplishments with the community</p>
        </div>
        
        <div className='modern-search-container'>
          <div className='modern-search-box'>
            <IoSearchOutline className="modern-search-icon" />
            <input
              type="text"
              className="modern-search-input"
              placeholder="Search achievements by title or description"
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
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="#6c8cff"/>
                </svg>
              </div>
              <h2 className='modern-empty-title'>No achievements found</h2>
              <p className='modern-empty-message'>Start by adding a new achievement to share with the community</p>
              <button 
                className='modern-enhanced-btn' 
                onClick={() => (window.location.href = '/addAchievements')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#4170FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                  boxShadow: '0 2px 10px rgba(65, 112, 255, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(65, 112, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(65, 112, 255, 0.3)';
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
                  
                  {achievement.postOwnerID === userId && (
                    <div className='modern-actions'>
                      <button className='modern-icon-btn' onClick={() => (window.location.href = `/updateAchievements/${achievement.id}`)}>
                        <FaEdit />
                      </button>
                      <button className='modern-icon-btn modern-delete-btn' onClick={() => handleDelete(achievement.id)}>
                        <RiDeleteBin6Fill />
                      </button>
                    </div>
                  )}
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

export default AllAchievements;
