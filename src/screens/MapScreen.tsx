import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Platform, Image, Text, Alert, Button, ActivityIndicator } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setLocation } from '../store/addressSlice';
import AddressFooter from '../components/AddressFooter';
import { getAddressFromCoordinates } from '../services/geocoding';
import { AddressDetails, Coordinates } from '../types/address';
import { getCurrentLocation } from '../services/permissions';
import { RouteProp } from '@react-navigation/native';

const LOCATION_TIMEOUT = 15000; // 15 seconds
const GEOCODING_TIMEOUT = 10000; // 10 seconds

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapScreen'>;

interface MapScreenProps {
  navigation: MapScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'MapScreen'>;  
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation, route  }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [address, setAddress] = useState<AddressDetails | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  
  // Refs for handling component unmounting and preventing state updates
  const isMounted = useRef(true);
  const geocodingDebounceTimeout = useRef<NodeJS.Timeout>();
  const locationTimeout = useRef<NodeJS.Timeout>();

  // Cleanup function
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (geocodingDebounceTimeout.current) {
        clearTimeout(geocodingDebounceTimeout.current);
      }
      if (locationTimeout.current) {
        clearTimeout(locationTimeout.current);
      }
    };
  }, []);

  const checkLocationPermission = useCallback(async (): Promise<boolean> => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (!permission) {
      if (isMounted.current) {
        setLocationError('Location permission not available for this platform');
      }
      return false;
    }

    try {
      const result = await check(permission);
      
      switch (result) {
        case RESULTS.DENIED:
          const permissionResult = await request(permission);
          return permissionResult === RESULTS.GRANTED;
        
        case RESULTS.BLOCKED:
          if (isMounted.current) {
            setPermissionBlocked(true);
          }
          return false;
        
        case RESULTS.GRANTED:
          return true;
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      if (isMounted.current) {
        setLocationError('Failed to check location permissions');
      }
      return false;
    }
  }, []);

  const fetchAddressWithTimeout = async (latitude: number, longitude: number): Promise<AddressDetails> => {
    return Promise.race([
      getAddressFromCoordinates(latitude, longitude),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Geocoding timeout')), GEOCODING_TIMEOUT)
      )
    ]) as Promise<AddressDetails>;
  };

  const fetchLocation = useCallback(async (): Promise<void> => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setLocationError(null);
    
    try {
      const locationPromise = getCurrentLocation();
      
      // Set up timeout for location fetch
      const timeoutPromise = new Promise((_, reject) => {
        locationTimeout.current = setTimeout(
          () => reject(new Error('Location fetch timeout')),
          LOCATION_TIMEOUT
        );
      });

      const currentLocation = await Promise.race([locationPromise, timeoutPromise]) as Region;
    
      
      
      if (!isMounted.current) return;
      
      setRegion(currentLocation);
      
      try {
        const addressData = await fetchAddressWithTimeout(
          currentLocation.latitude,
          currentLocation.longitude
        );

        
        if (isMounted.current) {
          setAddress(addressData);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        if (isMounted.current) {
          Alert.alert('Warning', 'Located you successfully, but failed to fetch address details');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (isMounted.current) {
        setLocationError(
          (error as Error).message === 'Location fetch timeout'
            ? 'Location request timed out. Please try again.'
            : 'Failed to get current location'
        );
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      if (locationTimeout.current) {
        clearTimeout(locationTimeout.current);
      }
    }
  }, []);

  const onRegionChangeComplete = useCallback(async (newRegion: Region): Promise<void> => {
    if (!isMounted.current) return;
    
    setRegion(newRegion);

    // Clear any existing debounce timeout
    if (geocodingDebounceTimeout.current) {
      clearTimeout(geocodingDebounceTimeout.current);
    }

    // Debounce the address fetch to prevent too many API calls
    geocodingDebounceTimeout.current = setTimeout(async () => {
      try {
        const addressData = await fetchAddressWithTimeout(
          newRegion.latitude,
          newRegion.longitude
        );
        if (isMounted.current) {
          setAddress(addressData);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        if (isMounted.current) {
          Alert.alert('Error', 'Failed to fetch address for this location');
        }
      }
    }, 500); // 500ms debounce
  }, []);

  const confirmLocation = useCallback((): void => {
    if (address && region) {
      dispatch(setLocation({ 
        coordinates: {
          latitude: region.latitude,
          longitude: region.longitude,
        } as Coordinates,
        address 
      }));
      navigation.navigate('AddressForm', { editMode: false, addressId: undefined });
    }
  }, [address, region, dispatch, navigation]);

  const requestPermissionAgain = useCallback(async () => {
    if (!isMounted.current) return;
    
    setPermissionBlocked(false);
    const permissionGranted = await checkLocationPermission();
    if (permissionGranted) {
      await fetchLocation();
    }
  }, [checkLocationPermission, fetchLocation]);

  useEffect(() => {
    const handleInitialLocation = async () => {
      if (route.params?.location) {
        // Use the location passed from AddressForm
        const providedLocation: Region = {
          latitude: route.params.location.lat,
          longitude: route.params.location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setRegion(providedLocation);
        setIsLoading(false);

        // Fetch address for the provided location
        try {
          const addressData = await fetchAddressWithTimeout(
            providedLocation.latitude,
            providedLocation.longitude
          );
          if (isMounted.current) {
            setAddress(addressData);
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          if (isMounted.current) {
            Alert.alert('Error', 'Failed to fetch address for this location');
          }
        }
      } else {
        // No location provided, fetch current location
        const hasPermission = await checkLocationPermission();
        if (hasPermission) {
          await fetchLocation();
        } else if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    handleInitialLocation();
  }, [checkLocationPermission, fetchLocation]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
        <Button title="Retry" onPress={fetchLocation} />
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Unable to get location</Text>
        <Button title="Try Again" onPress={fetchLocation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
      />
      
      <View style={styles.markerFixed}>
        <Image
          source={require('../../assets/marker.png')}
          style={styles.marker}
        />
      </View>

      {permissionBlocked && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Location access has been blocked. Please enable it in your device settings to proceed.
          </Text>
          <Button title="Enable Location Access" onPress={requestPermissionAgain} />
        </View>
      )}
  
      <AddressFooter
        address={address}
        onConfirm={confirmLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  permissionText: {
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
  },
  marker: {
    height: 48,
    width: 48,
  },
});

export default MapScreen;