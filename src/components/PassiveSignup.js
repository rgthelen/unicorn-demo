// src/components/PassiveSignup.js
import React, { useState, useEffect } from 'react';
import './PassiveSignup.css'; // Import CSS for styling
import { useRownd } from '@rownd/react';

const PassiveSignup = ({ trigger }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const { requestSignIn, user } = useRownd();

  useEffect(() => {
    // Check if the user already has an email
    const userHasEmail = user?.data?.email;

    if (trigger && !userHasEmail) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        if (!email) {
          setIsVisible(false);
        }
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [trigger, email, user]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      requestSignIn({
        identifier: email,
        auto_sign_in: true, // Automatically attempt sign-in
      });
      setIsVisible(false);
    }
  };

  return (
    <div className={`passive-signup ${isVisible ? 'visible' : ''}`}>
      <h2 className="passive-signup-title">Sign Up to make Sparkle Happy</h2>
      <form onSubmit={handleEmailSubmit}>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PassiveSignup;
