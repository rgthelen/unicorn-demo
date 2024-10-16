// src/SettingsMenu.js
import React, { useState } from 'react';
import { useRownd } from '@rownd/react';

function SettingsMenu() {
  const { manageAccount, passkeys, signOut } = useRownd();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
        </div>
      )}
    </div>
  );
}

export default SettingsMenu;
