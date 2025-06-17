import React, { useState, useEffect } from 'react';
import DeliveryMap from './DeliveryMap';
import { LatLngTuple } from 'leaflet';
import { formatDistance, formatTime } from '../../utils/formatters';

const SANTA_CRUZ_CENTER: LatLngTuple = [-17.7863, -63.1812];

const LOCATIONS = {
  cathedral: [-17.7834, -63.1822] as LatLngTuple,
  venturaMall: [-17.7662, -63.1947] as LatLngTuple,
  parqueUrbano: [-17.7698, -63.1540] as LatLngTuple,
  university: [-17.7732, -63.1958] as LatLngTuple,
  busTerminal: [-17.8082, -63.1649] as LatLngTuple,
  biocentroGuembe: [-17.7403, -63.1542] as LatLngTuple,
};

const DeliverySimulation: React.FC = () => {
  const [startPoint, setStartPoint] = useState<LatLngTuple>(LOCATIONS.cathedral);
  const [endPoint, setEndPoint] = useState<LatLngTuple>(LOCATIONS.venturaMall);
  const [progress, setProgress] = useState(0);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLngTuple[]>([]);

  useEffect(() => {
    const keys = Object.keys(LOCATIONS);
    let startKey = keys[Math.floor(Math.random() * keys.length)];
    let endKey = keys[Math.floor(Math.random() * keys.length)];
    while (startKey === endKey) {
      endKey = keys[Math.floor(Math.random() * keys.length)];
    }
    setStartPoint(LOCATIONS[startKey as keyof typeof LOCATIONS]);
    setEndPoint(LOCATIONS[endKey as keyof typeof LOCATIONS]);
  }, []);

  useEffect(() => {
    if (!routeCoordinates.length) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 0.5, 100);
        if (routeCoordinates.length > 1) {
          const routeIndex = Math.floor((newProgress / 100) * (routeCoordinates.length - 1));
          const nextIndex = Math.min(routeIndex + 1, routeCoordinates.length - 1);
          const segmentProgress = (newProgress / 100) * (routeCoordinates.length - 1) - routeIndex;

          const lat = routeCoordinates[routeIndex][0] +
            segmentProgress * (routeCoordinates[nextIndex][0] - routeCoordinates[routeIndex][0]);
          const lng = routeCoordinates[routeIndex][1] +
            segmentProgress * (routeCoordinates[nextIndex][1] - routeCoordinates[routeIndex][1]);

          setCurrentPosition([lat, lng]);
        }

        if (newProgress >= 100) {
          setCurrentPosition(endPoint);
          clearInterval(interval);
        }

        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [routeCoordinates, endPoint]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-3/4">
            <div className="h-[500px] md:h-[600px]">
              <DeliveryMap
                center={SANTA_CRUZ_CENTER}
                startPoint={startPoint}
                endPoint={endPoint}
                currentPosition={currentPosition}
                onRouteGenerated={(coords, distance, duration) => {
                  setRouteCoordinates(coords);
                  setRouteDistance(distance);
                  setRouteDuration(duration);
                  setCurrentPosition(coords[0]);
                }}
              />
            </div>
          </div>

          <div className="md:w-1/4 p-4 bg-gray-50 border-l border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Delivery Status</h2>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Distance:</span>
                  <span className="font-medium">{formatDistance(routeDistance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. Time:</span>
                  <span className="font-medium">{formatTime(routeDuration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">
                    {progress >= 100 ? 'Delivered' : 'In transit'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default DeliverySimulation;
