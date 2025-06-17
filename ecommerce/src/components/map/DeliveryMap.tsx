import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngTuple, LatLngExpression } from 'leaflet';
import 'leaflet-routing-machine';
import { TruckIcon } from 'lucide-react';

// Custom marker icons
const createIcon = (color: string, iconSize: [number, number] = [25, 41]) => {
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: iconSize,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Create truck icon for current position
const createTruckIcon = () => {
  // Create a div element for the custom icon
  const iconHtml = document.createElement('div');
  iconHtml.className = 'truck-icon';
  iconHtml.style.backgroundColor = '#f97316'; // Orange background
  iconHtml.style.color = 'white';
  iconHtml.style.borderRadius = '50%';
  iconHtml.style.width = '32px';
  iconHtml.style.height = '32px';
  iconHtml.style.display = 'flex';
  iconHtml.style.justifyContent = 'center';
  iconHtml.style.alignItems = 'center';
  iconHtml.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  iconHtml.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/></svg>`;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-truck-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Icons
const startIcon = createIcon('green');
const endIcon = createIcon('red');
const truckIcon = createTruckIcon();

interface RouteControllerProps {
  startPoint: LatLngTuple;
  endPoint: LatLngTuple;
  onRouteGenerated: (coordinates: LatLngTuple[], distance: number, duration: number) => void;
}

// Component to handle routing functionality
const RouteController: React.FC<RouteControllerProps> = ({ 
  startPoint, 
  endPoint,
  onRouteGenerated 
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const onRouteGeneratedRef = useRef(onRouteGenerated);

  // Keep the callback ref up to date
  useEffect(() => {
    onRouteGeneratedRef.current = onRouteGenerated;
  }, [onRouteGenerated]);

  // Create routing control only once
  useEffect(() => {
    // Create the routing control with a reliable OSRM server
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(startPoint[0], startPoint[1]),
        L.latLng(endPoint[0], endPoint[1])
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
        timeout: 30000 // 30 second timeout
      }),
      routeWhileDragging: true,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [
          { color: '#3498db', opacity: 0.7, weight: 6 },
          { color: '#2980b9', opacity: 0.9, weight: 4 }
        ]
      },
      createMarker: () => { return null; } // Disable default markers
    }).addTo(map);

    // Handle route calculation
    const handleRouteFound = (e: L.Routing.RoutingResultEvent) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const coordinates: LatLngTuple[] = route.coordinates.map(coord => [coord.lat, coord.lng]);
        
        // Use the current callback from ref
        onRouteGeneratedRef.current(
          coordinates,
          route.summary.totalDistance,
          route.summary.totalTime
        );
        
        // Fit map to the route
        map.fitBounds(L.latLngBounds(route.coordinates), { 
          padding: [50, 50],
          maxZoom: 15
        });
      }
    };

    routingControlRef.current.on('routesfound', handleRouteFound);
    
    // Cleanup function
    return () => {
      if (routingControlRef.current) {
        routingControlRef.current.off('routesfound', handleRouteFound);
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map]); // Only depend on map instance

  // Update waypoints when start or end points change
  useEffect(() => {
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints([
        L.latLng(startPoint[0], startPoint[1]),
        L.latLng(endPoint[0], endPoint[1])
      ]);
    }
  }, [startPoint, endPoint]);
  
  return null;
};

interface DeliveryMapProps {
  center: LatLngTuple;
  startPoint: LatLngTuple;
  endPoint: LatLngTuple;
  currentPosition: LatLngTuple | null;
  onRouteGenerated: (coordinates: LatLngTuple[], distance: number, duration: number) => void;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ 
  center, 
  startPoint, 
  endPoint, 
  currentPosition,
  onRouteGenerated 
}) => {
  return (
    <MapContainer 
      center={center as LatLngExpression} 
      zoom={13} 
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Start point marker */}
      <Marker position={startPoint} icon={startIcon}>
        <Popup>
          Starting Point<br />
          <small>{startPoint[0].toFixed(6)}, {startPoint[1].toFixed(6)}</small>
        </Popup>
      </Marker>
      
      {/* End point marker */}
      <Marker position={endPoint} icon={endIcon}>
        <Popup>
          Destination<br />
          <small>{endPoint[0].toFixed(6)}, {endPoint[1].toFixed(6)}</small>
        </Popup>
      </Marker>
      
      {/* Current position marker (delivery vehicle) */}
      {currentPosition && (
        <Marker position={currentPosition} icon={truckIcon}>
          <Popup>
            Delivery in progress<br />
            <small>{currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}</small>
          </Popup>
        </Marker>
      )}
      
      {/* Route controller */}
      <RouteController
        startPoint={startPoint}
        endPoint={endPoint}
        onRouteGenerated={onRouteGenerated}
      />
    </MapContainer>
  );
};

export default DeliveryMap;