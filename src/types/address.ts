export interface Coordinates {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
  
  export interface AddressDetails {
    formattedAddress: string;
    postalCode?: string;
    city?: string;
    state?: string;
  }
  
  export interface Location {
    coordinates: Coordinates;
    address: AddressDetails;
  }
  
  export type AddressType = 'Home' | 'Office' | 'Other';
  
  export interface Address {
    id: string;
    flatNumber: string;
    buildingName: string;
    addressLine1: string;
    pincode: string;
    city: string;
    state: string;
    type: AddressType;
    isDefault: boolean;
    coordinates?: Coordinates;
  }