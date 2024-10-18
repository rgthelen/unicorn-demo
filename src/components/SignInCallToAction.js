// src/components/SignInCallToAction.js
import React from 'react';
import { useRownd } from '@rownd/react';
import './SignInCallToAction.css'; // Ensure you create this CSS file

const SignInCallToAction = ({ text }) => {
  const { requestSignIn } = useRownd();

  const handleClick = () => {
    requestSignIn();
  };

  const renderTextWithCTA = (text) => {
    const regex = /\b(signing up|sign-up|sign-in)\b/gi;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="cta" onClick={handleClick}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return <span>{renderTextWithCTA(text)}</span>;
};

export default SignInCallToAction;

