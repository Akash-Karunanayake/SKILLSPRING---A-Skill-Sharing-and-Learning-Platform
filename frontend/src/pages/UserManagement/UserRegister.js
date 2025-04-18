import React, { useState } from 'react';
import { FaUserCircle, FaEnvelope, FaLock, FaPhone, FaUser, FaArrowRight, FaArrowLeft, FaCode, FaInfoCircle } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png'
import { IoMdAdd } from "react-icons/io";


function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        bio: '', // Added bio field
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // State for previewing the selected image
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }
        if (!isValid) {
            return; // Stop execution if validation fails
        }

        try {
            // Step 1: Create the user
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio, // Include bio in the request
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id; // Get the user ID from the response

                // Step 2: Upload the profile picture
                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email); // Send verification code
                setIsVerificationModalOpen(true); // Open verification modal
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Add state for tracking the current step
    const [currentStep, setCurrentStep] = useState(1);
    
    // Function to move to the next step
    const nextStep = () => {
        let isValid = true;
        
        // Validate first step fields before proceeding
        if (currentStep === 1) {
            if (!formData.fullname.trim()) {
                alert("Full name is required");
                isValid = false;
            }
            
            if (!formData.email) {
                alert("Email is required");
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                alert("Email is invalid");
                isValid = false;
            }
            
            if (!formData.password || formData.password.length < 6) {
                alert("Password should be at least 6 characters");
                isValid = false;
            }
            
            if (!formData.phone || formData.phone.length !== 10) {
                alert("Phone number should be exactly 10 digits");
                isValid = false;
            }
            
            if (!profilePicture) {
                alert("Profile picture is required");
                isValid = false;
            }
        }
        
        if (isValid && currentStep < 2) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };
    
    // Function to move to the previous step
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    return (
        <div>
            <div className="login-container-new">
                <div className="login-left-panel">
                    <div className="brand-message">
                        <h1>Join Our Community</h1>
                        <p>Create an account to share your expertise and connect with others.</p>
                    </div>
                </div>
                
                <div className="login-right-panel">
                    <div className="login-form-container register-form-container">
                        <div className="login-header-new">
                            <h2>Create Your Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>
                        
                        {/* Stepper UI */}
                        <div className="form-stepper">
                            <div className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
                                <div className="step-number">1</div>
                                <div className="step-label">Personal Info</div>
                            </div>
                            <div className="step-line"></div>
                            <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                                <div className="step-number">2</div>
                                <div className="step-label">Additional Info</div>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="login-form-new">
                            {/* Step 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="form-step">
                                    <div className="profile-upload-container">
                                        <div className="profile-preview" onClick={triggerFileInput}>
                                            {previewImage ? (
                                                <img
                                                    src={previewImage}
                                                    alt="Selected Profile"
                                                    className="preview-image"
                                                />
                                            ) : (
                                                <FaUserCircle className="default-profile-icon" />
                                            )}
                                            <div className="upload-overlay">
                                                <span>Upload Photo</span>
                                            </div>
                                        </div>
                                        <input
                                            id="profilePictureInput"
                                            className="hidden-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                        />
                                    </div>

                                    <div className="input-field">
                                        <FaUser className="field-icon" />
                                        <input
                                            type="text"
                                            name="fullname"
                                            placeholder="Full Name"
                                            value={formData.fullname}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="input-field">
                                        <FaEnvelope className="field-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="input-field">
                                        <FaLock className="field-icon" />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="input-field">
                                        <FaPhone className="field-icon" />
                                        <input
                                            type="text"
                                            name="phone"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const re = /^[0-9\b]{0,10}$/;
                                                if (re.test(e.target.value)) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            maxLength="10"
                                            pattern="[0-9]{10}"
                                            title="Please enter exactly 10 digits."
                                            required
                                        />
                                    </div>
                                    
                                    <button 
                                        type="button" 
                                        className="signin-btn register-btn next-btn"
                                        onClick={nextStep}
                                    >
                                        Continue <FaArrowRight className="btn-icon-right" />
                                    </button>
                                </div>
                            )}
                            
                            {/* Step 2: Additional Information */}
                            {currentStep === 2 && (
                                <div className="form-step">
                                    <div className="input-field">
                                        <FaCode className="field-icon" />
                                        <input
                                            type="text"
                                            name="skillInput"
                                            placeholder="Add a skill"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if(e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSkill();
                                                }
                                            }}
                                        />
                                        <button 
                                            type="button" 
                                            className="icon-button"
                                            onClick={handleAddSkill}
                                        >
                                            <IoMdAdd />
                                        </button>
                                    </div>
                                    
                                    <div className="skills-display">
                                        {formData.skills.map((skill, index) => (
                                            <span className="skill-tag" key={index}>
                                                {skill}
                                                <span className="remove-skill" onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        skills: formData.skills.filter((_, i) => i !== index)
                                                    });
                                                }}>×</span>
                                            </span>
                                        ))}
                                        {formData.skills.length < 2 && (
                                            <p className="hint-text">Minimum 2 skills required</p>
                                        )}
                                    </div>

                                    <div className="input-field">
                                        <FaInfoCircle className="field-icon" />
                                        <textarea
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="button-group">
                                        <button 
                                            type="button" 
                                            className="signin-btn back-btn"
                                            onClick={prevStep}
                                        >
                                            <FaArrowLeft className="btn-icon-left" /> Back
                                        </button>
                                        
                                        <button type="submit" className="signin-btn register-btn">
                                            Create Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="social-divider">
                                <span>or register with</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                                className="google-btn"
                            >
                                <img src={GoogalLogo} alt='Google' className='provider-icon' />
                                Google
                            </button>

                            <p className="register-prompt">
                                Already have an account?
                                <span onClick={() => (window.location.href = '/')} className="register-link">
                                    Sign In
                                </span>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {isVerificationModalOpen && (
                <div className="verification-modal">
                    <div className="modal-content modern-modal">
                        <h3>Verify Your Email</h3>
                        <p>We've sent a verification code to your email address. Please enter it below.</p>
                        <div className="verification-input-container">
                            <input
                                type="text"
                                value={userEnteredCode}
                                onChange={(e) => setUserEnteredCode(e.target.value)}
                                placeholder="Enter verification code"
                                className="verification-input modern-input"
                            />
                        </div>
                        <button onClick={handleVerifyCode} className="verification-button modern-button">
                            Verify & Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
