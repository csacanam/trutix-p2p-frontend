import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { countryCodes } from '../constants/countryCodes';

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
}

interface ProfileErrors {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address: string | undefined;
}

export function ProfileModal({ isOpen, onClose, onSuccess, address }: ProfileModalProps) {
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1'
  });
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    const newErrors = {
      firstName: !profileForm.firstName ? 'First name is required' : '',
      lastName: !profileForm.lastName ? 'Last name is required' : '',
      email: !profileForm.email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email) ? 'Invalid email format' : '',
      phone: !profileForm.phone ? 'Phone number is required' : ''
    };

    setProfileErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        address,
        firstname: profileForm.firstName,
        lastname: profileForm.lastName,
        email: profileForm.email,
        countryCode: profileForm.countryCode,
        phone: profileForm.phone
      });

      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Complete your profile to continue
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                To complete your transaction, we need a few details.
                This information helps us ensure secure and transparent trades between real people.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  profileErrors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {profileErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  profileErrors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {profileErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.lastName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  profileErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {profileErrors.email && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  name="countryCode"
                  value={profileForm.countryCode}
                  onChange={handleInputChange}
                  className="flex-shrink-0 rounded-l-md border-r border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.dialCode}>
                      {country.flag} {country.dialCode}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleInputChange}
                  className={`block w-full rounded-r-md focus:border-blue-500 focus:ring-blue-500 ${
                    profileErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {profileErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.phone}</p>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Your data is never shared publicly and is only used to support your transaction.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 