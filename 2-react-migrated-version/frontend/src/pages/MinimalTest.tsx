import React from 'react';

const MinimalTest: React.FC = () => {
  console.log('MinimalTest component rendered');
  
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <h1>MINIMAL TEST COMPONENT</h1>
      <p>If you see this, React is working!</p>
    </div>
  );
};

export default MinimalTest;