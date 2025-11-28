"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getCookie, hasCookie } from 'cookies-next';
import { JSONParse } from '@/lib/utils';
import { showError } from '@/lib/toastUtils';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [hasTriedInit, setHasTriedInit] = useState(false);

  useEffect(() => {
    let canceled = false;
    let retryTimer = null;

    const tryInitSocket = () => {
      if (canceled) return;

      const token = hasCookie('agritech_token') ? JSONParse(getCookie('agritech_token')) : null;

      if (!token) {
        // Token may be set right after login/navigation; retry briefly
        if (!hasTriedInit) {
          retryTimer = setTimeout(tryInitSocket, 500);
        }
        return;
      }

      // Avoid creating multiple instances
      if (socket) return;

      const socketInstance = io(process.env.NEXT_PUBLIC_FILEURL || 'http://localhost:5000', {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setIsConnected(true);
        setConnectionError(null);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        
        if (error.message.includes('Authentication error')) {
          showError('Authentication failed. Please login again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
        setConnectionError(error.message);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setConnectionError('Unable to reconnect to server');
        showError('Connection lost. Please refresh the page.');
      });

      setSocket(socketInstance);
      setHasTriedInit(true);
    };

    tryInitSocket();

    return () => {
      canceled = true;
      if (retryTimer) clearTimeout(retryTimer);
      // Disconnect socket on unmount
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    disconnect,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
