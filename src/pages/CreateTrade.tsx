import React, { useState, useEffect } from 'react';
import { ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import axios from 'axios';

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

interface UserExistsResponse {
  success: boolean;
  message: string;
}

export function CreateTrade() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userExists, setUserExists] = useState(false);
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
  const [formData, setFormData] = useState({
    eventName: '',
    city: '',
    date: '',
    locality: '',
    numTickets: 1,
    platform: 'ticketmaster',
    isTransferable: false,
    pricePerTicket: '',
    buyerName: '',
    buyerEmail: '',
    country: '',
  });

  const [errors, setErrors] = useState({
    eventName: '',
    city: '',
    date: '',
    locality: '',
    numTickets: '',
    isTransferable: '',
    pricePerTicket: '',
    buyerName: '',
    buyerEmail: '',
    country: '',
  });

  // Check if user exists when address changes
  useEffect(() => {
    const checkUserExists = async () => {
      if (address) {
        try {
          const response = await axios.get<UserExistsResponse>(`${import.meta.env.VITE_BACKEND_URL}/users/${address}`);
          setUserExists(response.data.success);
        } catch (error) {
          console.error('Error checking user:', error);
          setUserExists(false);
        }
      }
    };

    checkUserExists();
  }, [address]);

  const handleProfileSubmit = async () => {
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

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        address,
        ...profileForm
      });
      setUserExists(true);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const ProfileModal = () => {
    if (!isProfileModalOpen) return null;

    return (
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setIsProfileModalOpen(false)}
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                onClick={() => setIsProfileModalOpen(false)}
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
                  To participate in trades, we need a few details.
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
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
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
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
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
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
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
                    value={profileForm.countryCode}
                    onChange={(e) => setProfileForm({ ...profileForm, countryCode: e.target.value })}
                    className="flex-shrink-0 rounded-l-md border-r border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 sm:text-sm"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    {/* TODO: Add more country codes */}
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSubmit}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {
      eventName: '',
      city: '',
      date: '',
      locality: '',
      numTickets: '',
      isTransferable: '',
    };

    let isValid = true;

    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
      isValid = false;
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!formData.locality.trim()) {
      newErrors.locality = 'Section & Row is required';
      isValid = false;
    }

    if (formData.numTickets < 1) {
      newErrors.numTickets = 'Must have at least 1 ticket';
      isValid = false;
    }

    if (!formData.isTransferable) {
      newErrors.isTransferable = 'You must confirm tickets are transferable';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors = {
      pricePerTicket: '',
    };

    let isValid = true;

    if (!formData.pricePerTicket || Number(formData.pricePerTicket) <= 0) {
      newErrors.pricePerTicket = 'Please enter a valid price';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const validateStep3 = () => {
    const newErrors = {
      buyerName: '',
      buyerEmail: '',
    };

    let isValid = true;

    if (!formData.buyerName.trim()) {
      newErrors.buyerName = 'Full name is required';
      isValid = false;
    }

    if (!formData.buyerEmail.trim()) {
      newErrors.buyerEmail = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleCreateTrade = async () => {
    if (!address) {
      // Handle wallet not connected
      return;
    }

    if (!userExists) {
      setIsProfileModalOpen(true);
      return;
    }

    // Prepare trade data
    const tradeData = {
      eventName: formData.eventName,
      eventCity: formData.city,
      eventCountry: formData.country,
      eventDate: formData.date,
      eventSection: formData.locality,
      numberOfTickets: formData.numTickets,
      ticketPlatform: formData.platform,
      isTransferable: formData.isTransferable,
      pricePerTicket: formData.pricePerTicket,
    };

    console.log('Creating trade with data:', tradeData);
    // TODO: Call backend API with tradeData
    // navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header with Cancel */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Trade</h1>
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </button>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress">
          <div className="flex items-center justify-between">
            {[
              { id: 1, name: 'Ticket Info' },
              { id: 2, name: 'Set Price' },
              { id: 3, name: 'Review' },
            ].map((s, index, array) => (
              <>
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`${
                      step >= s.id
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } h-8 w-8 rounded-full flex items-center justify-center`}
                  >
                    <span className={`text-sm ${step >= s.id ? 'text-white' : 'text-gray-600'}`}>
                      {s.id}
                    </span>
                  </div>
                  <span className="mt-2 text-sm font-medium text-gray-900">{s.name}</span>
                </div>
                {index < array.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: step > s.id ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        </nav>

        {/* Step 1: Ticket Info */}
        {step === 1 && (
          <div className="space-y-6 bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">Ticket Information</h2>
            
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventName"
                id="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.eventName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.eventName && (
                <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="locality" className="block text-sm font-medium text-gray-700">
                Section & Row <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="locality"
                id="locality"
                placeholder="e.g., Section 102, Row F"
                value={formData.locality}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.locality ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.locality && (
                <p className="mt-1 text-sm text-red-600">{errors.locality}</p>
              )}
            </div>

            <div>
              <label htmlFor="numTickets" className="block text-sm font-medium text-gray-700">
                Number of Tickets <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numTickets"
                id="numTickets"
                min="1"
                value={formData.numTickets}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.numTickets ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.numTickets && (
                <p className="mt-1 text-sm text-red-600">{errors.numTickets}</p>
              )}
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                Ticket Platform <span className="text-red-500">*</span>
              </label>
              <select
                name="platform"
                id="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ticketmaster">Ticketmaster</option>
              </select>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Only official digital tickets that can be transferred through the platform are accepted.
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
                    <li>Screenshots, PDFs, or physical tickets are NOT accepted</li>
                    <li>You must be able to transfer the ticket through the official platform</li>
                    <li>The trade will be cancelled if non-transferable tickets are provided</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isTransferable"
                id="isTransferable"
                checked={formData.isTransferable}
                onChange={handleInputChange}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                  errors.isTransferable ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <label htmlFor="isTransferable" className="ml-2 block text-sm text-gray-700">
                I confirm these tickets can be transferred via the official platform
              </label>
            </div>
            {errors.isTransferable && (
              <p className="text-sm text-red-600">{errors.isTransferable}</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Next Step
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set Price */}
        {step === 2 && (
          <div className="space-y-6 bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">Set Your Price</h2>

            <div>
              <label htmlFor="pricePerTicket" className="block text-sm font-medium text-gray-700">
                Price per Ticket (USDC) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="pricePerTicket"
                  id="pricePerTicket"
                  value={formData.pricePerTicket}
                  onChange={handleInputChange}
                  className={`block w-full pl-7 pr-12 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.pricePerTicket ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USDC</span>
                </div>
              </div>
              {errors.pricePerTicket && (
                <p className="mt-1 text-sm text-red-600">{errors.pricePerTicket}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price per ticket</span>
                <span className="text-gray-900">${formData.pricePerTicket || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Number of tickets</span>
                <span className="text-gray-900">× {formData.numTickets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform fee (5%)</span>
                <span className="text-gray-900">
                  ${((Number(formData.pricePerTicket) * formData.numTickets * 0.05) || 0).toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900">You'll receive</span>
                  <span className="text-gray-900">
                    ${((Number(formData.pricePerTicket) * formData.numTickets * 0.95) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Next Step
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6 bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">Review Your Trade</h2>

            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                <dl className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Event</dt>
                    <dd className="text-sm text-gray-900">{formData.eventName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">City</dt>
                    <dd className="text-sm text-gray-900">{formData.city}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Country</dt>
                    <dd className="text-sm text-gray-900">{formData.country}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">{formData.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Section & Row</dt>
                    <dd className="text-sm text-gray-900">{formData.locality}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Ticket Platform</dt>
                    <dd className="text-sm text-gray-900">{formData.platform.charAt(0).toUpperCase() + formData.platform.slice(1)}</dd>
                  </div>
                </dl>
              </div>

              {/* Buyer Information - Commented out for future use */}
              {/* <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Buyer Information</h3>
                <dl className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">{formData.buyerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{formData.buyerEmail}</dd>
                  </div>
                </dl>
              </div> */}

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Price Details</h3>
                <dl className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Price per ticket</dt>
                    <dd className="text-sm text-gray-900">${formData.pricePerTicket}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Number of tickets</dt>
                    <dd className="text-sm text-gray-900">{formData.numTickets}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Platform fee</dt>
                    <dd className="text-sm text-gray-900">
                      ${((Number(formData.pricePerTicket) * formData.numTickets * 0.05) || 0).toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between font-medium">
                    <dt className="text-sm text-gray-900">You'll receive</dt>
                    <dd className="text-sm text-gray-900">
                      ${((Number(formData.pricePerTicket) * formData.numTickets * 0.95) || 0).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> By creating this trade, you confirm that:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
                      <li>You own these tickets and they are valid</li>
                      <li>The tickets can be transferred through the official platform</li>
                      <li>You will transfer the tickets within 24 hours of payment</li>
                      <li>Screenshots, PDFs, or physical tickets are NOT accepted and will result in trade cancellation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCreateTrade}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Trade
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      <ProfileModal />
    </div>
  );
}