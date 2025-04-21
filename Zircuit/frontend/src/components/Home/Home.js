import React, { useState } from 'react';
import backgroundImage from '../../assets/pagesbackground.jpg';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // You can add filtering logic here
  };

  return (
    <div
      style={{
        minHeight: '89vh',
        padding: '2rem',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Centered Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search Learning Plans..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '300px',
            padding: '10px 15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      {/* Header and Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
            margin: 0,
          }}
        >
          My Learning Plans
        </h1>
        <button
          onClick={() => (window.location.href = '/additem')}
          style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          + New Learning Plan
        </button>
      </div>
    </div>
  );
}

export default Home;
