import React, { createContext, useContext, useEffect, useState } from 'react';
import { createConsumer } from '@rails/actioncable';

const CableContext = createContext(null);

export const CableProvider = ({ children }) => {
  const [cable, setCable] = useState(null);

  useEffect(() => {
    const url = 'ws://localhost:3000/cable';
    const consumer = createConsumer(url);
    setCable(consumer);

    return () => {
      consumer.disconnect();
    };
  }, []);

  return (
    <CableContext.Provider value={cable}>
      {children}
    </CableContext.Provider>
  );
};

export const useCable = () => useContext(CableContext);
