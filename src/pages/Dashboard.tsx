import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wallet, X, CreditCard, ArrowRight, Copy, ExternalLink, ChevronDown, Ban as Bank, QrCode, CheckCircle, Clock, AlertTriangle, ArrowUpRight, PlusCircle, ArrowDownCircle, ArrowUpCircle, XCircle, RotateCcw, Send } from 'lucide-react';
import { useAccount, useConnect, useBalance, useWriteContract, useTransaction } from 'wagmi';
import { cbWalletConnector } from '../wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';
import { Transaction } from '@coinbase/onchainkit/transaction';
import { QRCodeSVG } from 'qrcode.react';
import trutixLogo from '../assets/trutix-logo.png';
import axios from 'axios';
import { countryCodes } from '../constants/countryCodes';
import { TRUTIX_ABI } from '../constants/trutixAbi';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';

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

interface CreateUserResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
  };
  message?: string;
}

interface Trade {
  id: string;
  tradeId: string;
  status: string;
  eventName: string;
  eventCity: string;
  eventDate: string;
  eventSection: string;
  numberOfTickets: number;
  pricePerTicket: number;
  totalPaidByBuyer: number;
  sellerFee: number;
  totalEarnedBySeller: number;
  createdAt: string;
  lastUpdate: string;
  eventCountry: string;
  ticketPlatform: string;
  lastUpdatedBy: string[];
  buyer: string[];
  seller: string[];
  isTransferable: boolean;
  buyerFee: number;
  totalEarnedByTrutix: number;
  paidAt?: string;
  sentAt?: string;
  buyerInfo: {
    address: string;
    firstname: string;
    lastname: string;
  } | null;
  sellerInfo: {
    address: string;
    firstname: string;
    lastname: string;
  } | null;
}

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

export function Dashboard() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [depositMethod, setDepositMethod] = useState('crypto');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error' | 'cancelled'>('idle');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
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
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();
  const { connect } = useConnect();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  });

  const { writeContractAsync } = useWriteContract();

  const { data: transaction } = useTransaction({
    hash: transactionHash,
  });

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const checkUserExists = async (walletAddress: string): Promise<boolean> => {
    try {
      const response = await axios.get<UserExistsResponse>(`${import.meta.env.VITE_BACKEND_URL}/users/${walletAddress}`);
      const exists = response.data.success;
      setUserExists(exists);
      return exists;
    } catch (error) {
      console.error('Error checking user:', error);
      setUserExists(false);
      return false;
    }
  };

  useEffect(() => {
    console.log('Transaction data:', transaction);
    if (transaction?.blockHash) {
      console.log('Transaction successful! Block hash:', transaction.blockHash);
      setTransactionStatus('success');
      refetchBalance();
    } else if (transaction?.blockHash === null) {
      console.log('Transaction failed!');
      setTransactionStatus('error');
      setWithdrawError('Transaction failed. Please try again.');
    }
  }, [transaction, refetchBalance]);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

    setIsSubmitting(true);
    try {
      const response = await axios.post<CreateUserResponse>(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        address,
        firstname: profileForm.firstName,
        lastname: profileForm.lastName,
        email: profileForm.email,
        countryCode: profileForm.countryCode,
        phone: profileForm.phone
      });

      if (response.data.success) {
        setUserExists(true);
        setIsProfileModalOpen(false);
        setIsSuccessModalOpen(true);
      } else {
        setErrorMessage(response.data.error || 'Failed to create profile');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setErrorMessage('An error occurred while creating your profile');
      setIsErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!address) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!userExists) {
      const exists = await checkUserExists(address);
      if (!exists) {
        setIsProfileModalOpen(true);
        return;
      }
    }
    setIsWithdrawModalOpen(true);
  };

  const handleDeposit = async () => {
    if (!address) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!userExists) {
      const exists = await checkUserExists(address);
      if (!exists) {
        setIsProfileModalOpen(true);
        return;
      }
    }
    setIsDepositModalOpen(true);
  };

  const handleCreateTrade = async () => {
    if (!address) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!userExists) {
      const exists = await checkUserExists(address);
      if (!exists) {
        setIsProfileModalOpen(true);
        return;
      }
    }
    window.location.href = '/create-trade';
  };

  const handleMaxClick = () => {
    if (balance) {
      setWithdrawAmount(formatUnits(balance.value, balance.decimals));
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a wallet address');
      return;
    }
    if (!withdrawAddress.startsWith('0x') || withdrawAddress.length !== 42) {
      setWithdrawError('Please enter a valid Base network address');
      return;
    }
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount');
      return;
    }
    if (balance && parseFloat(withdrawAmount) > parseFloat(formatUnits(balance.value, balance.decimals))) {
      setWithdrawError('Insufficient balance');
      return;
    }

    console.log('Starting withdrawal...');
    setTransactionStatus('pending');
    try {
      console.log('Calling writeContractAsync...');
      const hash = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [
          withdrawAddress as `0x${string}`,
          withdrawAmount ? parseUnits(withdrawAmount, 6) : BigInt(0)
        ],
      });
      console.log('Transaction hash received:', hash);
      if (hash) {
        setTransactionHash(hash);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      if (error instanceof Error && error.message.includes('User rejected the request')) {
        setTransactionStatus('cancelled');
      } else {
        handleTransactionError(error);
      }
    }
  };

  const handleTransactionError = (error: unknown) => {
    if (error instanceof Error) {
      if (error.message.includes('User rejected the request')) {
        setWithdrawError('Transaction was rejected. Please try again.');
      } else if (error.message.includes('User denied transaction')) {
        setWithdrawError('Transaction was denied. Please try again.');
      } else {
        setWithdrawError('Transaction failed. Please try again.');
      }
    } else {
      setWithdrawError('Transaction failed. Please try again.');
    }
    setTransactionStatus('error');
  };

  const handleTransactionStatus = (status: any) => {
    console.log('Transaction status:', status);
    switch (status.statusName) {
      case 'transactionPending':
        setTransactionStatus('pending');
        break;
      case 'success':
        setTransactionStatus('success');
        break;
      case 'error':
        setTransactionStatus('error');
        setWithdrawError(status.statusData.message || 'Transaction failed. Please try again.');
        break;
    }
  };

  const LoginModal = () => {
    if (!isLoginModalOpen) return null;

        return (
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setIsLoginModalOpen(false)}
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  🔐 You need to log in
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      To continue, please log in or create your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await connect({ connector: cbWalletConnector });
                    setIsLoginModalOpen(false);
                    if (address) {
                      await checkUserExists(address);
                    }
                  } catch (error) {
                    console.error('Error connecting wallet:', error);
                  }
                }}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileModal = () => {
    if (!isProfileModalOpen) return null;

    const [localForm, setLocalForm] = useState<ProfileForm>({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+1'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setLocalForm(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async () => {
      // Validate form
      const newErrors = {
        firstName: !localForm.firstName ? 'First name is required' : '',
        lastName: !localForm.lastName ? 'Last name is required' : '',
        email: !localForm.email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localForm.email) ? 'Invalid email format' : '',
        phone: !localForm.phone ? 'Phone number is required' : ''
      };

      setProfileErrors(newErrors);

      if (Object.values(newErrors).some(error => error)) {
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await axios.post<CreateUserResponse>(`${import.meta.env.VITE_BACKEND_URL}/users`, {
          address,
          firstname: localForm.firstName,
          lastname: localForm.lastName,
          email: localForm.email,
          countryCode: localForm.countryCode,
          phone: localForm.phone
        });

        if (response.data.success) {
          setUserExists(true);
          setIsProfileModalOpen(false);
          setIsSuccessModalOpen(true);
        } else {
          setErrorMessage(response.data.error || 'Failed to create profile');
          setIsErrorModalOpen(true);
        }
      } catch (error) {
        console.error('Error creating user:', error);
        setErrorMessage('An error occurred while creating your profile');
        setIsErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    };

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
                  value={localForm.firstName}
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
                  value={localForm.lastName}
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
                  value={localForm.email}
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
                    value={localForm.countryCode}
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
                    value={localForm.phone}
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
                onClick={() => setIsProfileModalOpen(false)}
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
  };

  const SuccessModal = () => {
    if (!isSuccessModalOpen) return null;

    return (
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setIsSuccessModalOpen(false)}
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your profile has been created successfully.
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You can now start making trades.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ErrorModal = () => {
    if (!isErrorModalOpen) return null;

    return (
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setIsErrorModalOpen(false)}
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Error Creating Profile
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchTrades = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/wallet/${address}/trades`);
        setTrades(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load trades. Please try again later.');
        console.error('Error fetching trades:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [address]);

  const getUserRole = (trade: Trade) => {
    if (!address) return null;
    return trade.sellerInfo?.address === address ? 'seller' : 'buyer';
  };

  const getStatusBadge = (trade: Trade) => {
    const userRole = getUserRole(trade);
    if (!userRole) return null;

    // Always show Expired badge for these statuses
    if (trade.status === 'Expired' || trade.status === 'ExpiredNoTransfer') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Expired
        </span>
      );
    }

    // Check for Expired (Created + >12h)
    if (trade.status === 'Created' && trade.createdAt) {
      const createdAt = new Date(trade.createdAt).getTime();
      const now = Date.now();
      if (now - createdAt > 12 * 60 * 60 * 1000) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Expired
          </span>
        );
      }
    }

    // Check for Expired (Paid + >12h)
    if (trade.status === 'Paid' && trade.paidAt) {
      const paidAt = new Date(trade.paidAt).getTime();
      const now = Date.now();
      if (now - paidAt > 12 * 60 * 60 * 1000) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Expired
          </span>
        );
      }
    }

    // Add a helper to determine if Sent is expired
    const isSentExpired = trade.status === 'Sent' && trade.sentAt && (Date.now() > new Date(trade.sentAt).getTime() + 12 * 60 * 60 * 1000);

    switch (trade.status) {
      case 'Created':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            {userRole === 'seller' ? 'Awaiting Payment' : 'Payment Required'}
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            {userRole === 'seller' ? 'Transfer Tickets Now' : 'Waiting for Transfer'}
          </span>
        );
      case 'Transferred':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {userRole === 'seller' ? 'Awaiting Confirmation' : 'Confirm Receipt'}
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-4 h-4 mr-1 text-green-700" />
            Completed
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
            <RotateCcw className="w-4 h-4 mr-1 text-amber-700" />
            Refunded
          </span>
        );
      case 'Sent':
        if (isSentExpired) {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <CheckCircle className="w-4 h-4 mr-1 text-green-700" />
              Completed
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            <Send className="w-4 h-4 mr-1 text-blue-700" />
            {userRole === 'seller' ? 'Waiting for Confirmation' : 'Tickets Sent'}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && address) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 flex items-center justify-between">
            <div>
            <h2 className="text-base font-medium text-gray-900 mb-1">Your Balance</h2>
            {address ? (
              <p className="text-3xl font-bold text-gray-900">
                {balance ? `${formatUnits(balance.value, balance.decimals)} USDC` : '0.00 USDC'}
              </p>
            ) : (
              <p className="text-base text-gray-600 font-medium">Log in to see your balance</p>
            )}
            </div>
          <div className="flex space-x-3">
              <button 
              onClick={handleWithdraw}
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
              >
              <ArrowUpCircle className="w-5 h-5 mr-2" />
                Withdraw
              </button>
              <button 
              onClick={handleDeposit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
              <ArrowDownCircle className="w-5 h-5 mr-2" />
                Deposit
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Trades</h1>
          {address ? (
            <Link
              to="/create-trade"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Trade
            </Link>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Trade
            </button>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {address ? (
          trades.length > 0 ? (
            trades.map((trade) => {
              const userRole = getUserRole(trade);
              return (
              <Link
                key={trade.id}
                  to={`/trade/${trade.tradeId}`}
                className="block hover:bg-gray-50"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                            {trade.eventName}
                        </p>
                          {getStatusBadge(trade)}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <p>{trade.eventCity} • {new Date(trade.eventDate).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <div className="text-gray-500">
                              {trade.eventSection} • {trade.numberOfTickets} {trade.numberOfTickets === 1 ? 'ticket' : 'tickets'}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                                ${(trade.pricePerTicket * trade.numberOfTickets).toFixed(2)} USDC
                            </div>
                            <div className="text-xs text-gray-500">
                                ${trade.pricePerTicket.toFixed(2)} USDC per ticket
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                        {userRole === 'seller' ? (
                          <>Buyer: {trade.buyerInfo ? `${trade.buyerInfo.firstname} ${trade.buyerInfo.lastname}` : 'Not assigned'}</>
                      ) : (
                          <>Seller: {trade.sellerInfo ? `${trade.sellerInfo.firstname} ${trade.sellerInfo.lastname}` : 'Unknown'}</>
                      )}
                    </div>
                    <div className="text-gray-500">
                      Created {new Date(trade.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">
              No trades yet. Create your first trade to get started!
            </div>
          )
        ) : (
          <div className="p-6 text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">Log in to view your trades.</p>
            <p className="text-sm text-gray-500">Create or access your account to see your activity.</p>
          </div>
                  )}
                </div>
      {/* Render modals */}
      <LoginModal />
      <ProfileModal />
      <SuccessModal />
      <ErrorModal />
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
      />
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)}
        USDC_ADDRESS={USDC_ADDRESS}
      />
        </div>
  );
}