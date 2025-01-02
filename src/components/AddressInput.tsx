import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Address, AddressType } from '../types/address';

interface AddressInputProps {
  formData: Omit<Address, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Address, 'id'>>>;
  onSubmit: () => void;
}

const addressTypes: AddressType[] = ['Home', 'Office', 'Other'];

const AddressInput: React.FC<AddressInputProps> = ({ formData, setFormData, onSubmit }) => {
  const updateField = (field: keyof Omit<Address, 'id'>) => (value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Flat/House Number</Text>
        <TextInput
          style={styles.input}
          value={formData.flatNumber}
          onChangeText={updateField('flatNumber')}
          placeholder="Enter flat or house number"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Building Name</Text>
        <TextInput
          style={styles.input}
          value={formData.buildingName}
          onChangeText={updateField('buildingName')}
          placeholder="Enter building name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Line 1</Text>
        <TextInput
          style={styles.input}
          value={formData.addressLine1}
          onChangeText={updateField('addressLine1')}
          placeholder="Enter street address"
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode</Text>
        <TextInput
          style={styles.input}
          value={formData.pincode}
          onChangeText={updateField('pincode')}
          placeholder="Enter pincode"
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={formData.city}
          onChangeText={updateField('city')}
          placeholder="Enter city"
          editable={!formData.pincode}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={formData.state}
          onChangeText={updateField('state')}
          placeholder="Enter state"
          editable={!formData.pincode}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address Type</Text>
        <View style={styles.typeContainer}>
          {addressTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                formData.type === type && styles.selectedType,
              ]}
              onPress={() => updateField('type')(type)}
            >
              <Text
                style={[
                  styles.typeText,
                  formData.type === type && styles.selectedTypeText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={[
            styles.defaultButton,
            formData.isDefault && styles.selectedDefault,
          ]}
          onPress={() => updateField('isDefault')(!formData.isDefault)}
        >
          <Text
            style={[
              styles.defaultText,
              formData.isDefault && styles.selectedDefaultText,
            ]}
          >
            Set as default address
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
        <Text style={styles.submitButtonText}>Save Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    color: '#333',
    fontSize: 14,
  },
  selectedTypeText: {
    color: 'white',
  },
  defaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedDefault: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  defaultText: {
    color: '#333',
    fontSize: 14,
  },
  selectedDefaultText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressInput;
