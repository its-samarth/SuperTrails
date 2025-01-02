import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
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

  useEffect(() => {
    if (location?.address) {
      setFormData(prev => ({
        ...prev,
        addressLine1: location.address.formattedAddress,
        pincode: location.address.postalCode || '',
      }));
      
      if (location.address.postalCode) {
        fetchLocationData(location.address.postalCode);
      }
    }
  }, [location]);

  const fetchLocationData = async (pincode: string): Promise<void> => {
    const data = await fetchCityState(pincode);
    if (data) {
      setFormData(prev => ({
        ...prev,
        city: data.city,
        state: data.state,
      }));
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
    <FlatList
      data={[1]} // A dummy data array to enable FlatList rendering
      renderItem={() => (
        <View style={styles.container}>
          <GooglePlacesAutocomplete
            placeholder="Search for address"
            onPress={(data, details = null) => {
              if (details?.geometry?.location) {
                navigation.navigate('MapScreen', {
                  location: details.geometry.location,
                });
              }
            }}
            query={{
              key: config.googleMapsApiKey,
              language: 'en',
            }}
            fetchDetails={true}
            styles={{
              container: styles.autocompleteContainer,
              textInput: styles.autocompleteInput,
            }}
          />

          <AddressInput
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
          />
        </View>
      )}
      keyExtractor={(item) => item.toString()}
      
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  autocompleteContainer: {
    flex: 0,
    marginBottom: 16,
  },
  autocompleteInput: {
    fontSize: 16,
  },
});

export default AddressForm;