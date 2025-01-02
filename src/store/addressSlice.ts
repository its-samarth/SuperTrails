import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address, Location } from '../types/address';

interface AddressState {
  addresses: Address[];
  currentLocation: Location | null;
}

const initialState: AddressState = {
  addresses: [],
  currentLocation: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    addAddress: (state, action: PayloadAction<Omit<Address, 'id'>>) => {
      state.addresses.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    updateAddress: (state, action: PayloadAction<{ id: string; address: Partial<Address> }>) => {
      const index = state.addresses.findIndex(
        addr => addr.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = {
          ...state.addresses[index],
          ...action.payload.address,
        };
      }
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(
        addr => addr.id !== action.payload
      );
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === action.payload,
      }));
    },
  },
});

export const {
  setLocation,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = addressSlice.actions;

export default addressSlice.reducer;