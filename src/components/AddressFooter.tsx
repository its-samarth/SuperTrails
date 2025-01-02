import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AddressDetails } from '../types/address';

interface AddressFooterProps {
  address: AddressDetails | null;
  onConfirm: () => void;
}

const AddressFooter: React.FC<AddressFooterProps> = ({ address, onConfirm }) => {
  return (
    <View style={styles.footer}>
      {!address ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Fetching address...</Text>
        </View>
      ) : (
        <>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{address.formattedAddress}</Text>
            <Text style={styles.subText}>
              {address.city}, {address.state} {address.postalCode}
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressFooter;