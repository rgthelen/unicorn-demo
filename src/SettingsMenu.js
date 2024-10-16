// src/SettingsMenu.js
import React, { useState } from 'react';
import { useRownd } from '@rownd/react';
import './App.css'; // Ensure you have a CSS file for styling

function SettingsMenu() {
  const { manageAccount, passkeys, signOut, setUserValue } = useRownd();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+1'); // Start with +1 for country code

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const submitPhoneNumber = () => {
    if (phoneNumber) {
      setUserValue("phone_number", phoneNumber);
      closeModal();
    }
  };

  return (
    <div className="settings-menu">
      <button className="hamburger-icon" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </button>
      {isMenuOpen && (
        <div className="menu">
          <button onClick={() => manageAccount()}>Profile</button>
          <button onClick={() => passkeys.register()}>Add Passkey</button>
          <button onClick={() => signOut()}>Logout</button>
          <button onClick={openModal}>Add Phone Number</button>
        </div>
      )}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Your Phone Number</h2>
            <input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="+1"
            />
            <p className="terms">
              By entering a phone number, you agree to receive up to 10 messages a day from your favorite unicorn. You can opt-out at any time.
            </p>
            <button onClick={submitPhoneNumber}>Submit</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsMenu;
