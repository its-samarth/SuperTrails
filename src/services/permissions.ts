import { Platform } from 'react-native';
  import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
  import Geolocation from '@react-native-community/geolocation';
import { Coordinates } from '../types/address';
  
  export const checkLocationPermission = async (): Promise<boolean> => {
    const permission: Permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    })!;
  
    try {
      const result = await check(permission);
      
      if (result === RESULTS.DENIED) {
        const permissionResult = await request(permission);
        return permissionResult === RESULTS.GRANTED;
      }
      
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };
  
  
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
      
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922, 
          longitudeDelta: 0.0421, 
        });
      },
      (error) => {
        // Log the error for debugging purposes
        console.error('Error fetching current location:', error);

        // Provide user-friendly error messages based on the error code
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            reject(new Error('Location permission is denied. Please enable it in your device settings.'));
            break;
          case 2: // POSITION_UNAVAILABLE
            reject(new Error('Unable to determine your location. Please try again.'));
            break;
          case 3: // TIMEOUT
            reject(new Error('Location request timed out. Please ensure your device has a stable connection.'));
            break;
          default:
            reject(new Error('An unknown error occurred while fetching your location.'));
        }
      },
      {
        enableHighAccuracy: false, // Use GPS for higher accuracy
        timeout: 15000, // Timeout after 15 seconds
        maximumAge: 10000, // Cache location data for up to 10 seconds
      }
    );
  });
};
  