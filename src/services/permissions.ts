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
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };
  