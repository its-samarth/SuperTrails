import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapScreen'>;

interface MapScreenProps {
  navigation: MapScreenNavigationProp;
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [address, setAddress] = useState<AddressDetails | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const checkLocationPermission = async (): Promise<boolean> => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (!permission) {
      setLocationError('Location permission not available for this platform');
      return false;
    }

    try {
      const result = await check(permission);
      
      switch (result) {
        case RESULTS.DENIED:
          const permissionResult = await request(permission);
          return permissionResult === RESULTS.GRANTED;
        
        case RESULTS.BLOCKED:
          setPermissionBlocked(true);
          return false;
        
        case RESULTS.GRANTED:
          return true;
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setLocationError('Failed to check location permissions');
      return false;
    }
  };

  const fetchLocation = async (): Promise<void> => {
    setIsLoading(true);
    setLocationError(null);
    
    try {
      const currentLocation = await getCurrentLocation();
      setRegion(currentLocation);
      
      const addressData = await getAddressFromCoordinates(
        currentLocation.latitude,
        currentLocation.longitude
      );
      setAddress(addressData);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      const hasPermission = await checkLocationPermission();
      if (hasPermission) {
        await fetchLocation();
      } else {
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const onRegionChangeComplete = async (newRegion: Region): Promise<void> => {
    setRegion(newRegion);
    try {
      const addressData = await getAddressFromCoordinates(
        newRegion.latitude,
        newRegion.longitude
      );
      setAddress(addressData);
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Failed to  fetch address for this location');
    }
  };

  const confirmLocation = (): void => {
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
  };

  const requestPermissionAgain = async () => {
    setPermissionBlocked(false);
    const permissionGranted = await checkLocationPermission();
    if (permissionGranted) {
      await fetchLocation();
    }
  };

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
      >
      </MapView>
      
      <View style={styles.markerFixed}>
        <Image
          source={require('../../assets/marker.png')}
          style={styles.marker}
        />
      </View>

      {permissionBlocked && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Location access has been blocked.  Please enable it to proceed.
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