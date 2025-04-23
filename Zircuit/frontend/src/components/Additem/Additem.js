import React, { useState } from 'react';
import './Additem.css';
import { useNavigate } from 'react-router-dom';
import myPlanImage from '../../assets/myplan.jpg'; // Importing the image

function Additem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: '',
    timePeriod: '',
    topic: '',
    subTopics: '',
    description: '',
    resources: ''
  });

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Learning Plan Created Successfully');
    // Add your Axios call here
  };

  const onCancel = () => {
    navigate('/'); // Change path based on your need
  };

  return (
    <div
      className="additem-container"
      style={{
        backgroundImage: `url(${myPlanImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <p className="auth_topic">My Learning Plan</p>
      <div className="from_vontiner">
        <div className="from_sub_coon">
          <form onSubmit={onSubmit}>

            <div className="date-time-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={onInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timePeriod">Time Period</label>
                <input
                  type="text"
                  name="timePeriod"
                  placeholder="e.g., 2 weeks"
                  value={formData.timePeriod}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            <label htmlFor="topic">Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={onInputChange}
              required
            />

            <label htmlFor="subTopics">Sub Topics</label>
            <textarea
              name="subTopics"
              value={formData.subTopics}
              onChange={onInputChange}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
            />

            <label htmlFor="resources">Resources</label>
            <textarea
              name="resources"
              value={formData.resources}
              onChange={onInputChange}
              required
            />

            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
              <button type="submit" className="create-btn">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Additem;
