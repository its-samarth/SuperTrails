import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { addAddress, updateAddress } from '../store/addressSlice';
import AddressInput from '../components/AddressInput';
import { fetchCityState } from '../services/pincode';
import { config } from '../config';
import { Address, AddressType } from '../types/address';

type AddressFormNavigationProp = StackNavigationProp<RootStackParamList, 'AddressForm'>;
type AddressFormRouteProp = RouteProp<RootStackParamList, 'AddressForm'>;

interface AddressFormProps {
  navigation: AddressFormNavigationProp;
  route: AddressFormRouteProp;
}

interface FormData extends Omit<Address, 'id'> {
  flatNumber: string;
  buildingName: string;
  addressLine1: string;
  pincode: string;
  city: string;
  state: string;
  type: AddressType;
  isDefault: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ navigation, route }) => {
  const { editMode, addressId } = route.params || {};
  const dispatch = useAppDispatch();
  const location = useAppSelector(state => state.address.currentLocation);
  const addresses = useAppSelector(state => state.address.addresses);
  
  const [formData, setFormData] = useState<FormData>({
    flatNumber: '',
    buildingName: '',
    addressLine1: '',
    pincode: '',
    city: '',
    state: '',
    type: 'Home',
    isDefault: false,
  });

  // Load existing address data if in edit mode
  useEffect(() => {
    if (editMode && addressId) {
      const existingAddress = addresses.find(addr => addr.id === addressId);
      if (existingAddress) {
        setFormData({
          flatNumber: existingAddress.flatNumber || '',
          buildingName: existingAddress.buildingName || '',
          addressLine1: existingAddress.addressLine1 || '',
          pincode: existingAddress.pincode || '',
          city: existingAddress.city || '',
          state: existingAddress.state || '',
          type: existingAddress.type || 'Home',
          isDefault: existingAddress.isDefault || false,
        });
      }
    }
  }, [editMode, addressId, addresses]);

  // Update form when location changes
  useEffect(() => {
    if (location?.address) {
      setFormData(prev => ({
        ...prev,
        addressLine1: location.address.formattedAddress || '',
        pincode: location.address.postalCode || '',
        city: location.address.city || '',
        state: location.address.state || '',
      }));

      if (location.address.postalCode) {
        fetchLocationData(location.address.postalCode);
      }
    }
  }, [location]);

  const fetchLocationData = async (pincode: string): Promise<void> => {
    try {
      const data = await fetchCityState(pincode);
      if (data) {
        setFormData(prev => ({
          ...prev,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }));
      }
    } catch (error) {
      console.error('Error fetching city/state:', error);
    }
  };

  const handleSubmit = (): void => {
    const addressData = {
      ...formData,
      coordinates: location?.coordinates,
    };

    if (editMode && addressId) {
      dispatch(updateAddress({ id: addressId, address: addressData }));
    } else {
      dispatch(addAddress(addressData));
    }
    navigation.navigate('AddressList');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <GooglePlacesAutocomplete
            placeholder="Search for address"
            onPress={(data, details = null) => {
              if (details) {
                // Extract address components
                const addressComponents = details.address_components || [];
                const postalCode = addressComponents.find(component => 
                  component.types.includes('postal_code'))?.long_name || '';
                const locality = addressComponents.find(component => 
                  component.types.includes('locality'))?.long_name || '';
                const state = addressComponents.find(component => 
                  component.types.includes('administrative_area_level_1'))?.long_name || '';

                // Update form data with place details
                setFormData(prev => ({
                  ...prev,
                  addressLine1: data.description || '',
                  pincode: postalCode,
                  city: locality,
                  state: state,
                }));

                // Navigate to map with the selected location
                if (details.geometry?.location) {
                  navigation.navigate('MapScreen', {
                    location: {
                      lat: details.geometry.location.lat,
                      lng: details.geometry.location.lng,
                    
                    }
                  });
                }
              }
            }}
            query={{
              key: config.googleMapsApiKey,
              language: 'en',
              components: 'country:in', // Restrict to India
            }}
            fetchDetails={true}
            enablePoweredByContainer={false}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.autocompleteInput,
              listView: styles.autocompleteList,
            }}
          />

          <AddressInput
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isEditMode={editMode}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  autocompleteContainer: {
    flex: 0,
    marginBottom: 16,
    zIndex: 1,
  },
  autocompleteInput: {
    fontSize: 16,
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  autocompleteList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
  },
});

export default AddressForm;