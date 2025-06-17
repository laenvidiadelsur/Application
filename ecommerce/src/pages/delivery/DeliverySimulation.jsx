import React from 'react';
import Header from '@/components/layout/Header';
import DeliverySimulation from '@/components/map/DeliverySimulation';

const DeliverySimulationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DeliverySimulation />
      </main>
    </div>
  );
};

export default DeliverySimulationPage; 