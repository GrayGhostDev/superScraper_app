import React from 'react';
import { MapPin, Navigation, Clock, AlertTriangle, Building2, Car } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LocationData {
  center: [number, number];
  name: string;
  address: string;
  bbox?: [number, number, number, number];
  placeType?: string;
  context?: {
    neighborhood?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

interface LocationDetailsProps {
  location: LocationData;
  emergencyServices?: {
    policeStations: number;
    fireStations: number;
    hospitals: number;
    responseTime: number;
  };
  traffic?: {
    congestionLevel: number;
    incidents: number;
    averageSpeed: number;
  };
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  location,
  emergencyServices,
  traffic
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Location Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-medium">Location Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xl font-semibold">{location.name}</p>
            <p className="text-gray-600">{location.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Coordinates</p>
              <p className="font-medium">
                {location.center[1].toFixed(6)}°N, {location.center[0].toFixed(6)}°W
              </p>
            </div>
            {location.context?.postalCode && (
              <div>
                <p className="text-sm text-gray-500">ZIP Code</p>
                <p className="font-medium">{location.context.postalCode}</p>
              </div>
            )}
          </div>

          {location.context && (
            <div className="grid grid-cols-2 gap-4">
              {location.context.neighborhood && (
                <div>
                  <p className="text-sm text-gray-500">Neighborhood</p>
                  <p className="font-medium">{location.context.neighborhood}</p>
                </div>
              )}
              {location.context.district && (
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{location.context.district}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Services */}
      {emergencyServices && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-medium">Emergency Services</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">Nearby Facilities</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  Police Stations: <span className="font-medium">{emergencyServices.policeStations}</span>
                </p>
                <p className="text-sm">
                  Fire Stations: <span className="font-medium">{emergencyServices.fireStations}</span>
                </p>
                <p className="text-sm">
                  Hospitals: <span className="font-medium">{emergencyServices.hospitals}</span>
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Response Times</p>
              </div>
              <p className="text-sm">
                Average Response Time: <span className="font-medium">{emergencyServices.responseTime} minutes</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Information */}
      {traffic && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-medium">Traffic Conditions</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Congestion Level</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      traffic.congestionLevel > 66
                        ? 'bg-red-500'
                        : traffic.congestionLevel > 33
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${traffic.congestionLevel}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{traffic.congestionLevel}%</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Active Incidents</p>
              <p className="text-xl font-medium">{traffic.incidents}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Average Speed</p>
              <p className="text-xl font-medium">{traffic.averageSpeed} mph</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};