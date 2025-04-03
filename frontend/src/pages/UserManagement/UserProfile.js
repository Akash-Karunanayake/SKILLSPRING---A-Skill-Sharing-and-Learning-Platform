import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaUser, FaEdit, FaTrashAlt } from 'react-icons/fa';
import './UserProfile.css'
import NavBar from '../../Components/NavBar/NavBar';
export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            const userId = localStorage.getItem('userID');
            fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile.");
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    return (
        <div className="profile-page">
            <NavBar />
            <div className="profile-container">
                {userData && userData.id === localStorage.getItem('userID') && (
                    <div className="modern-profile-card">
                        <div className="profile-header">
                            <div className="profile-image-container">
                                {userData.profilePicturePath ? (
                                    <img
                                        src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                        alt="Profile"
                                        className="modern-profile-image"
                                    />
                                ) : (
                                    <div className="profile-avatar">
                                        <FaUser className="avatar-icon" />
                                    </div>
                                )}
                            </div>
                            <div className="profile-title">
                                <h2 className="user-fullname">{userData.fullname}</h2>
                                <p className="user-bio">{userData.bio || "No bio available"}</p>
                            </div>
                        </div>
                        
                        <div className="profile-content">
                            <div className="info-section">
                                <div className="info-item">
                                    <FaEnvelope className="info-icon" />
                                    <div>
                                        <p className="info-label">Email</p>
                                        <p className="info-value">{userData.email}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FaPhone className="info-icon" />
                                    <div>
                                        <p className="info-label">Phone</p>
                                        <p className="info-value">{userData.phone || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <FaTools className="info-icon" />
                                    <div>
                                        <p className="info-label">Skills</p>
                                        <p className="info-value">{userData.skills && userData.skills.length > 0 ? userData.skills.join(', ') : "No skills listed"}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profile-actions">
                                <button onClick={() => navigate(`/updateUserProfile/${userData.id}`)} className="action-button edit-button">
                                    <FaEdit className="button-icon" /> Edit Profile
                                </button>
                                <button onClick={handleDelete} className="action-button delete-button">
                                    <FaTrashAlt className="button-icon" /> Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="quick-access-section">
                    <h3 className="section-title">Quick Access</h3>
                    <div className="quick-access-cards">
                        <div className="quick-card learning-plan" onClick={() => navigate('/myLearningPlan')}>
                            <div className="card-icon learning-icon"></div>
                            <p className="card-title">My Learning Plan</p>
                        </div>
                        <div className="quick-card skill-posts" onClick={() => navigate('/myAllPost')}>
                            <div className="card-icon posts-icon"></div>
                            <p className="card-title">My Skill Posts</p>
                        </div>
                        <div className="quick-card achievements" onClick={() => navigate('/myAchievements')}>
                            <div className="card-icon achievements-icon"></div>
                            <p className="card-title">My Achievements</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
