import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../api/authService';

export function ProtectedRoute() {
  const [status, setStatus] = useState(() =>
    authService.isAuthenticated() ? 'authenticated' : 'checking'
  );
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (authService.isAuthenticated()) {
        setStatus('authenticated');
        return;
      }

      try {
        const restored = await authService.refreshSession();

        if (isMounted) {
          setStatus(restored ? 'authenticated' : 'guest');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('guest');
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const [status, setStatus] = useState(() =>
    authService.isAuthenticated() ? 'authenticated' : 'checking'
  );

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (authService.isAuthenticated()) {
        setStatus('authenticated');
        return;
      }

      try {
        const restored = await authService.refreshSession();

        if (isMounted) {
          setStatus(restored ? 'authenticated' : 'guest');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('guest');
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
