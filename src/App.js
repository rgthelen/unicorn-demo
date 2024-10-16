import React, { useEffect } from 'react';
import { useRownd } from '@rownd/react';

function App() {
  const { 
    is_authenticated, 
    is_initializing, 
    user, 
    requestSignIn,
    signOut
  } = useRownd();

  useEffect(() => {
    console.log("Authentication state:", { is_authenticated, is_initializing });
  }, [is_authenticated, is_initializing]);

  const handleSignIn = () => {
    requestSignIn({
      auto_sign_in: true,
      // You can optionally provide an identifier (email or phone number) here
      // identifier: "user@example.com"
    });
  };

  if (is_initializing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>My Rownd-Authenticated App</h1>
        {is_authenticated ? (
          <div>
            <p>Welcome, {user?.data?.email || user?.data?.first_name || 'User'}!</p>
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <div>
            <p>Please sign in to continue.</p>
            <button onClick={handleSignIn}>Sign In</button>
          </div>
        )}
      </header>
      <main>
        {is_authenticated && user?.data && (
          <div>
            <h2>User Profile</h2>
            <pre>{JSON.stringify(user.data, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
