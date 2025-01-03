import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { deleteAddress, setDefaultAddress } from '../store/addressSlice';
import { Address } from '../types/address';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

type AddressListNavigationProp = StackNavigationProp<RootStackParamList, 'AddressList'>;

interface AddressListProps {
  navigation: AddressListNavigationProp;
}

const AddressList: React.FC<AddressListProps> = ({ navigation }) => {
  const addresses = useAppSelector(state => state.address.addresses);
  const dispatch = useAppDispatch();
  const [isLocationEnabled,setIsLocationEnabled]=useState(false)
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    let previousStatus = isLocationEnabled;

    const checkLocationAndPermissionStatus = async () => {
      try {
        // Check if location is enabled
        const currentStatus = DeviceInfo.isLocationEnabledSync();
        if (currentStatus !== previousStatus) {
          setIsLocationEnabled(currentStatus);
          previousStatus = currentStatus;
        }

        // Check and request location permission
        const permission = Platform.select({
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        });

        if (permission) {
          const result = await check(permission);

          switch (result) {
            case RESULTS.GRANTED:
              setHasLocationPermission(true);
              break;
            case RESULTS.DENIED:
              const requestResult = await request(permission);
              setHasLocationPermission(requestResult === RESULTS.GRANTED);
              break;
            case RESULTS.BLOCKED:
              setHasLocationPermission(false);
              Alert.alert(
                'Permission Blocked',
                'Location permission is blocked. Please enable it in your device settings to proceed.'
              );
              break;
            default:
              setHasLocationPermission(false);
              break;
          }
        } else {
          Alert.alert('Error', 'Location permission is not available on this platform.');
        }
      } catch (error) {
        console.error('Error checking location or permission status:', error);
      }
    };

    const interval = setInterval(checkLocationAndPermissionStatus, 1000); // Check every second

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, []);

  


  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>{item.type}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddressForm', { 
            editMode: true, 
            addressId: item.id 
          })}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.addressText}>
        {item.flatNumber}, {item.buildingName}
      </Text>
      <Text style={styles.addressText}>{item.addressLine1}</Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} - {item.pincode}
      </Text>

      <View style={styles.actionButtons}>
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.setDefaultButton}
            onPress={() => dispatch(setDefaultAddress(item.id))}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => dispatch(deleteAddress(item.id))}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
       <View style={styles.statusContainer}>
  <View style={styles.statusRow}>
    <Text style={styles.statusLabel}>Location:</Text>
    <Text style={[styles.statusValue, isLocationEnabled ? styles.statusEnabled : styles.statusDisabled]}>
      {isLocationEnabled ? 'Enabled' : 'Disabled'}
    </Text>
  </View>
  <View style={styles.statusRow}>
    <Text style={styles.statusLabel}>Permission:</Text>
    <Text style={[styles.statusValue, hasLocationPermission ? styles.statusEnabled : styles.statusDisabled]}>
      {hasLocationPermission ? 'Granted' : 'Not Granted'}
    </Text>
  </View>
</View>
    
    <View style={styles.container}>
      
      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={async () => {
          
          if (hasLocationPermission && isLocationEnabled) {
            // Navigate to MapScreen if permission is granted
            navigation.navigate('MapScreen', { location: undefined });
          } else {
            // Navigate to AddressForm if permission is not granted
            navigation.navigate('AddressForm', {
              editMode: false, 
            });
          }
        }}
      >
       
       
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    color: '#1976d2',
    fontSize: 12,
  },
  editText: {
    color: '#f4511e',
    fontSize: 14,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  setDefaultButton: {
    marginRight: 12,
  },
  setDefaultText: {
    color: '#f4511e',
    fontSize: 14,
  },
  deleteButton: {},
  deleteText: {
    color: '#f44336',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#f4511e',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    padding: 16,
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusEnabled: {
    color: '#4caf50', // Green for enabled or granted
  },
  statusDisabled: {
    color: '#f44336', // Red for disabled or not granted
  },
});

export default AddressList;