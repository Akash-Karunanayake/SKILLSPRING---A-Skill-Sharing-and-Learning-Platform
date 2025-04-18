import React, { useEffect, useState } from 'react';
import { FaUserGraduate } from "react-icons/fa";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { BiSolidDashboard } from "react-icons/bi";
import { FaGraduationCap, FaTrophy } from "react-icons/fa";
import axios from 'axios';
import './NavBar.css';
import Logo from './img/logocover.png';
import { fetchUserDetails } from '../../Pages/UserManagement/UserProfile';
import { useLocation } from 'react-router-dom';

function NavBar() {
    const [allRead, setAllRead] = useState(true);
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [activeMenu, setActiveMenu] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const userId = localStorage.getItem('userID');
    
    // Detect current page for active menu highlighting
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('Post')) {
            setActiveMenu('posts');
        } else if (path.includes('Learning')) {
            setActiveMenu('learning');
        } else if (path.includes('Achievements')) {
            setActiveMenu('achievements');
        } else if (path.includes('notifications')) {
            setActiveMenu('notifications');
        } else if (path.includes('Profile') || path.includes('googalUserPro')) {
            setActiveMenu('profile');
        }
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
                const unreadNotifications = response.data.some(notification => !notification.read);
                setAllRead(!unreadNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    useEffect(() => {
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        if (storedUserType === 'google') {
            const googleImage = localStorage.getItem('googleProfileImage');
            setGoogleProfileImage(googleImage);
        } else if (userId) {
            fetchUserDetails(userId).then((data) => {
                if (data && data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
                }
            });
        }
    }, [userId]);

    const navigateTo = (path, menuItem) => {
        setActiveMenu(menuItem);
        window.location.href = path;
        setMobileOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const toggleMobileMenu = () => {
        setMobileOpen(!mobileOpen);
    };

    const getProfileImage = () => {
        if (googleProfileImage) {
            return googleProfileImage;
        } else if (userProfileImage) {
            return userProfileImage;
        }
        return null;
    };

    const getProfilePath = () => {
        return userType === 'google' ? '/googalUserPro' : '/userProfile';
    };

    return (
        <>
            <header className="navbar">
                <div className="container">
                    <div className="logo" onClick={() => navigateTo('/allPost', 'posts')}>
                        <img src={Logo} alt="SkillHub" />
                    </div>
                    
                    <button className="mobile-toggle" onClick={toggleMobileMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    
                    <nav className={`nav ${mobileOpen ? 'active' : ''}`}>
                        <ul className="nav-list">
                            <li>
                                <a 
                                    className={activeMenu === 'posts' ? 'active' : ''}
                                    onClick={() => navigateTo('/allPost', 'posts')}
                                >
                                    <BiSolidDashboard className="nav-icon" />
                                    <span>Skill Posts</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    className={activeMenu === 'learning' ? 'active' : ''}
                                    onClick={() => navigateTo('/allLearningPlan', 'learning')}
                                >
                                    <FaGraduationCap className="nav-icon" />
                                    <span>Learning Plans</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    className={activeMenu === 'achievements' ? 'active' : ''}
                                    onClick={() => navigateTo('/allAchievements', 'achievements')}
                                >
                                    <FaTrophy className="nav-icon" />
                                    <span>Achievements</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                    
                    <div className="actions">
                        <button 
                            className={`action-btn ${activeMenu === 'notifications' ? 'active' : ''}`}
                            onClick={() => navigateTo('/notifications', 'notifications')}
                        >
                            {allRead ? (
                                <MdNotifications />
                            ) : (
                                <div className="notification-badge">
                                    <MdNotificationsActive />
                                </div>
                            )}
                        </button>
                        
                        <button className="action-btn" onClick={handleLogout}>
                            <IoLogOut />
                        </button>
                        
                        <button 
                            className={`profile ${activeMenu === 'profile' ? 'active' : ''}`}
                            onClick={() => navigateTo(getProfilePath(), 'profile')}
                        >
                            {getProfileImage() ? (
                                <img src={getProfileImage()} alt="Profile" />
                            ) : (
                                <FaUserGraduate />
                            )}
                        </button>
                    </div>
                </div>
            </header>
            <div className="navbar-spacer"></div>
        </>
    );
}

export default NavBar;
