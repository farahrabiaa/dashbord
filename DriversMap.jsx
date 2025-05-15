import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 31.5017, // مركز فلسطين
  lng: 34.4668
};

const DriversMap = ({ drivers }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const getMarkerIcon = (status) => {
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      fillColor: status === 'متاح' ? '#22c55e' : '#ef4444',
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#fff',
      scale: 1.5,
    };
  };

  const handleMarkerClick = useCallback((driver) => {
    setSelectedDriver(driver);
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyBk-1pxq7SxaWYeLhUWwGa9YSARZlmVSZ4">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={10}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            position={{ lat: driver.location.lat, lng: driver.location.lng }}
            icon={getMarkerIcon(driver.status)}
            onClick={() => handleMarkerClick(driver)}
          />
        ))}

        {selectedDriver && (
          <InfoWindow
            position={{ lat: selectedDriver.location.lat, lng: selectedDriver.location.lng }}
            onCloseClick={() => setSelectedDriver(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold mb-1">{selectedDriver.name}</h3>
              <p className="text-sm text-gray-600">الحالة: {selectedDriver.status}</p>
              <p className="text-sm text-gray-600">التقييم: {selectedDriver.rating} ★</p>
              <p className="text-sm text-gray-600">الطلبات المكتملة: {selectedDriver.completedOrders}</p>
              {selectedDriver.currentOrder && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm font-medium">الطلب الحالي:</p>
                  <p className="text-sm text-gray-600">#{selectedDriver.currentOrder.id}</p>
                  <p className="text-sm text-gray-600">
                    من: {selectedDriver.currentOrder.pickup}
                  </p>
                  <p className="text-sm text-gray-600">
                    إلى: {selectedDriver.currentOrder.dropoff}
                  </p>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default DriversMap;