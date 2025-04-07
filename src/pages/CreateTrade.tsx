import React, { useState } from 'react';
import { ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateTrade() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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
  });

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
          <ol role="list" className="flex items-center justify-between">
            {[
              { id: 1, name: 'Ticket Info' },
              { id: 2, name: 'Set Price' },
              { id: 3, name: 'Buyer Info' },
              { id: 4, name: 'Review' },
            ].map((s, index) => (
              <li key={s.id} className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  {index !== 0 && (
                    <div 
                      className="absolute right-full mx-8 w-24 h-0.5 bg-gray-200"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: step > s.id - 1 ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                  <div
                    className={`${
                      step >= s.id
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } h-8 w-8 rounded-full flex items-center justify-center z-10`}
                  >
                    <span className={`text-sm ${step >= s.id ? 'text-white' : 'text-gray-600'}`}>
                      {s.id}
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900">{s.name}</span>
              </li>
            ))}
          </ol>
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

        {/* Step 3: Buyer Information */}
        {step === 3 && (
          <div className="space-y-6 bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">Buyer Information</h2>

            <div>
              <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="buyerName"
                id="buyerName"
                value={formData.buyerName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.buyerName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter buyer's full name"
              />
              {errors.buyerName && (
                <p className="mt-1 text-sm text-red-600">{errors.buyerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="buyerEmail"
                id="buyerEmail"
                value={formData.buyerEmail}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.buyerEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter buyer's email address"
              />
              {errors.buyerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.buyerEmail}</p>
              )}
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Make sure the buyer's information is correct:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
                    <li>Full name must match their ID for ticket transfer</li>
                    <li>Email address will be used for ticket transfer and communication</li>
                    <li>Double-check spelling to avoid transfer issues</li>
                  </ul>
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
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Review Trade
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
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
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{formData.city}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Date</dt>
                    <dd className="text-sm text-gray-900">{formData.date}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Section & Row</dt>
                    <dd className="text-sm text-gray-900">{formData.locality}</dd>
                  </div>
                </dl>
              </div>

              <div className="border-b border-gray-200 pb-4">
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
              </div>

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
                onClick={() => setStep(3)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {/* Handle trade creation */}}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Trade
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}