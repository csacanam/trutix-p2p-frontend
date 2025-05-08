import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, AlertTriangle, Copy, X, XCircle, RotateCcw } from 'lucide-react';
import { useAccount, useConnect, useBalance, useWriteContract, useTransaction } from 'wagmi';
import axios from 'axios';
import { ProfileModal } from '../components/ProfileModal';
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal';
import { PaymentModal } from '../components/PaymentModal';
import { TRUTIX_ABI } from '../constants/trutixAbi';
import { decodeEventLog } from 'viem';

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

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

// Real implementation - This will fetch data from the API
export function TradeDetailReal() {
  console.log('TradeDetailReal component mounted');
  const params = useParams();
  console.log('All URL params:', params);
  const tradeId = params.id;
  console.log('Trade ID from params:', tradeId);
  const navigate = useNavigate();
  const { address: connectedWallet } = useAccount();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [userRole, setUserRole] = useState<'seller' | 'buyer' | null>(null);
  const { address: isConnected } = useAccount();
  const { connect, connectors } = useConnect();
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
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: connectedWallet,
    token: USDC_ADDRESS,
  });
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paidTimeLeft, setPaidTimeLeft] = useState<string | null>(null);
  const [refundStatus, setRefundStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [refundError, setRefundError] = useState('');
  const [refundTxHash, setRefundTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync } = useWriteContract();
  const { data: refundTx } = useTransaction({ hash: refundTxHash });
  const TRUTIX_CONTRACT_ADDRESS = import.meta.env.VITE_TRUTIX_CONTRACT_ADDRESS;

  useEffect(() => {
    if (!tradeId) {
      console.error('No trade ID provided');
      navigate('/dashboard');
      return;
    }

    const fetchTrade = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}`;
        console.log('Making API call to:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Trade data:', data);
          setTrade(data);
          
          // Determine user role based on the connected wallet
          if (connectedWallet) {
            console.log('Connected wallet:', connectedWallet);
            console.log('Seller wallet:', data.sellerInfo?.address);
            console.log('Trade status:', data.status);
            
            if (data.sellerInfo?.address && connectedWallet.toLowerCase() === data.sellerInfo.address.toLowerCase()) {
              console.log('User is the seller');
              setUserRole('seller');
            } else {
              console.log('User is not the seller');
              setUserRole('buyer');
            }
          } else {
            console.log('No wallet connected');
            setUserRole(null);
          }
        } else {
          const errorText = await response.text();
          console.error('Error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          setTrade(null);
        }
      } catch (error) {
        console.error('Error fetching trade:', error);
        setTrade(null);
      }
      setLoading(false);
    };

    fetchTrade();
  }, [tradeId, connectedWallet, navigate]);

  // Check if user exists when address changes
  useEffect(() => {
    const checkUserExists = async () => {
      if (isConnected) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${isConnected}`);
          setUserExists(response.data.success);
        } catch (error) {
          console.error('Error checking user:', error);
          setUserExists(false);
        }
      }
    };

    checkUserExists();
  }, [isConnected]);

  // Countdown timer effect
  useEffect(() => {
    if (!trade || trade.status !== 'Created' || !trade.createdAt) {
      setTimeLeft(null);
      return;
    }
    const createdAt = new Date(trade.createdAt).getTime();
    const deadline = createdAt + 12 * 60 * 60 * 1000; // 12 hours in ms

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [trade]);

  // Add a useEffect to handle the countdown for 'Paid' state
  useEffect(() => {
    if (!trade || trade.status !== 'Paid' || !trade.paidAt) {
      setPaidTimeLeft(null);
      return;
    }
    const paidAt = new Date(trade.paidAt).getTime();
    const deadline = paidAt + 12 * 60 * 60 * 1000; // 12 hours in ms

    const updatePaidTimer = () => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setPaidTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setPaidTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updatePaidTimer();
    const interval = setInterval(updatePaidTimer, 1000);
    return () => clearInterval(interval);
  }, [trade]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const handleCopy = (value: string, field: string) => {
    copyToClipboard(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const StatusBadge = () => {
    switch (trade?.status) {
      case 'Created':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            {userRole === 'seller' ? 'Awaiting Payment' : 'Payment Required'}
          </span>
        );
      case 'Paid':
        if (trade?.paidAt && (Date.now() > new Date(trade.paidAt).getTime() + 12 * 60 * 60 * 1000)) {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <XCircle className="w-4 h-4 mr-1" />
              Expired
            </span>
          );
        }
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-4 h-4 mr-1" />
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
      default:
        return null;
    }
  };

  const ConfirmationModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Ticket Receipt</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This action cannot be undone
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  By confirming, you acknowledge that:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700">
                  <li>You have received and accepted the tickets in the official event platform</li>
                  <li>The tickets match exactly what you paid for (event, date, section, row)</li>
                  <li>These are official digital tickets, not screenshots or PDFs</li>
                  <li>The payment will be released to the seller immediately and cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}/confirm`, {
                    method: 'POST',
                  });
                  if (response.ok) {
                    // Refresh trade data
                    const updatedTrade = await response.json();
                    setTrade(updatedTrade);
                  }
                } catch (error) {
                  console.error('Error confirming trade:', error);
                }
                setShowConfirmModal(false);
              }}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
            >
              Confirm Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TransferConfirmationModal = () => {
    if (!showTransferModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Ticket Transfer</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> Only mark as transferred after completing these steps:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700">
                  <li>You have logged into the official event platform</li>
                  <li>You have successfully transferred the tickets to {trade?.buyer.email}</li>
                  <li>The transfer has been completed and confirmed by the platform</li>
                  <li>The buyer has received the transfer notification</li>
                </ul>
                <p className="mt-2 text-sm text-yellow-700">
                  <strong>Warning:</strong> False confirmation may result in penalties and account suspension
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTransferModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}/transfer`, {
                    method: 'POST',
                  });
                  if (response.ok) {
                    // Refresh trade data
                    const updatedTrade = await response.json();
                    setTrade(updatedTrade);
                  }
                } catch (error) {
                  console.error('Error confirming transfer:', error);
                }
                setShowTransferModal(false);
              }}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Confirm Transfer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setProfileErrors(prev => ({
      ...prev,
      [name]: ''
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

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        address: isConnected,
        ...profileForm
      });
      setUserExists(true);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handlePaymentClick = async () => {
    if (!userExists) {
      setIsProfileModalOpen(true);
      return;
    }

    const numericBalance = Number(balance?.formatted);
    const numericPrice = Number(finalPrice);

    console.log('User Balance (numeric):', numericBalance);
    console.log('Final Price (numeric):', numericPrice);
    console.log('Comparison:', numericBalance < numericPrice);

    if (numericBalance < numericPrice) {
      setShowInsufficientBalanceModal(true);
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleDeposit = async () => {
    try {
      // Get the user's Airtable recordId
      const userResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${isConnected}`);
      if (!userResponse.data.success) {
        console.error('Error getting user data');
        return;
      }

      const userRecordId = userResponse.data.recordId;

      // Update the trade with buyer information
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}`, {
        buyer: userRecordId,
        lastUpdatedBy: userRecordId
      });

      if (response.data) {
        setShowInsufficientBalanceModal(false);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      // Still redirect to dashboard even if there's an error
      setShowInsufficientBalanceModal(false);
      navigate('/dashboard');
    }
  };

  // Calculate if the trade is expired due to no transfer after payment
  const isPaidExpired = (trade?.status === 'Paid' && trade?.paidAt && (Date.now() > new Date(trade.paidAt).getTime() + 12 * 60 * 60 * 1000)) || trade?.status === 'ExpiredNoTransfer';

  // Calculate if the trade is expired due to no payment after creation
  const isCreatedExpired = (trade?.status === 'Created' && trade?.createdAt && (Date.now() > new Date(trade.createdAt).getTime() + 12 * 60 * 60 * 1000)) || trade?.status === 'Expired';

  // Refund transaction effect (simplificado: éxito si hay blockHash, sin buscar eventos)
  useEffect(() => {
    if (refundTx?.blockHash && refundStatus === 'pending') {
      setRefundStatus('success');
      // Update backend to Refunded
      (async () => {
        try {
          let recordId = connectedWallet;
          try {
            const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${connectedWallet}`);
            const userData = await userRes.json();
            if (userData.recordId) {
              recordId = userData.recordId;
            }
          } catch (err) {
            console.error('Error getting user recordId:', err);
          }
          if (!trade) return;
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${trade?.tradeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Refunded',
              lastUpdatedBy: recordId,
              refundedAt: new Date().toISOString(),
            }),
          });
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } catch (err) {
          setRefundStatus('error');
          setRefundError('Refund succeeded but failed to update backend. Please refresh.');
        }
      })();
    } else if (refundTx?.blockHash === null && refundStatus === 'pending') {
      setRefundStatus('error');
      setRefundError('Transaction failed. Please try again.');
    }
  }, [refundTx, refundStatus, trade?.tradeId, connectedWallet]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The trade you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate prices based on the actual data structure
  const totalPrice = trade.pricePerTicket * trade.numberOfTickets;
  const buyerFee = totalPrice * 0.05;
  const finalPrice = totalPrice + buyerFee;
  const tradeUrl = `${window.location.origin}/trade/${trade.tradeId}`;

  // Update the Seller Info section
  const renderSellerInfo = () => {
    console.log('Trade object:', trade);
    console.log('User role:', userRole);
    console.log('Trade status:', trade?.status);
    console.log('Seller info:', trade?.sellerInfo);
    console.log('Buyer info:', trade?.buyerInfo);

    if (!trade) {
      return (
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">?</span>
          </div>
          <div>
            <p className="text-gray-900 font-medium">Unknown</p>
          </div>
        </div>
      );
    }

    const info = userRole === 'seller' && trade.status !== 'Created' ? trade.buyerInfo : trade.sellerInfo;
    console.log('Selected info object:', info);
    console.log('First name:', info?.firstname);
    console.log('Last name:', info?.lastname);

    const displayName = info?.firstname && info?.lastname 
      ? `${info.firstname} ${info.lastname}` 
      : 'Unknown';
    const initials = info?.firstname && info?.lastname 
      ? `${info.firstname[0]}${info.lastname[0]}` 
      : '?';

    console.log('Display name:', displayName);
    console.log('Initials:', initials);

    return (
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 font-medium">{initials}</span>
        </div>
        <div>
          <p className="text-gray-900 font-medium">{displayName}</p>
          {info?.rating && (
            <p className="text-gray-500 text-sm">Rating: {info.rating}/5</p>
          )}
        </div>
      </div>
    );
  };

  if (trade?.status === 'Refunded') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trade #{trade?.tradeId ?? ''}</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  <RotateCcw className="w-4 h-4 mr-1 text-amber-700" />
                  Refunded
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <RotateCcw className="mx-auto h-12 w-12 text-amber-700" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Refunded</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {userRole === 'seller'
                    ? 'This trade was automatically refunded because the ticket was not transferred within the required time. The buyer has been refunded.'
                    : "This trade was automatically refunded because the seller didn't transfer the ticket on time. You have received a full refund."}
                </p>
              </div>
            </div>
          </div>
          {/* Event Details */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Event</span>
                <span className="text-gray-900 font-medium">{trade.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900">{trade.eventDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900">{trade.eventCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Section & Row</span>
                <span className="text-gray-900">{trade.eventSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Number of Tickets</span>
                <span className="text-gray-900">{trade.numberOfTickets || 0}</span>
              </div>
            </div>
          </div>
          {/* Price Breakdown */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Price Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Price per Ticket</span>
                <span className="text-gray-900">${trade.pricePerTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${(trade.pricePerTicket * trade.numberOfTickets).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Fee (5%)</span>
                <span className="text-gray-900">${((trade.pricePerTicket * trade.numberOfTickets) * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="text-gray-900 font-medium">${((trade.pricePerTicket * trade.numberOfTickets) * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Seller/Buyer Info */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {userRole === 'seller' && trade.status !== 'Created' ? 'Buyer Information' : 'Seller Information'}
            </h2>
            <div className="flex items-center justify-between">
              {renderSellerInfo()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPaidExpired) {
    // Expired by no transfer (Paid + 12h) or ExpiredNoTransfer
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trade #{trade?.tradeId ?? ''}</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Expired
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Expired</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The seller did not transfer the tickets within the 12-hour time limit after payment. This trade is no longer active.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <span className="text-sm text-yellow-700 font-medium text-left">
                  <strong>Important:</strong> {userRole === 'buyer' ? 'You can now get a full refund.' : 'This trade has expired and can no longer be completed. The buyer may now request a refund.'}
                </span>
              </div>
              {userRole === 'buyer' && (
                <div className="w-full mt-4">
                  <button
                    className="w-full inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={async () => {
                      setRefundStatus('pending');
                      setRefundError('');
                      try {
                        const hash = await writeContractAsync({
                          address: TRUTIX_CONTRACT_ADDRESS as `0x${string}`,
                          abi: TRUTIX_ABI,
                          functionName: 'expireTrade',
                          args: [BigInt(trade.tradeId)],
                        });
                        setRefundTxHash(hash);
                      } catch (error) {
                        setRefundStatus('error');
                        setRefundError('Transaction failed. Please try again.');
                      }
                    }}
                    disabled={refundStatus === 'pending'}
                  >
                    {refundStatus === 'pending' ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" /> Processing...
                      </>
                    ) : refundStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2 text-green-400" /> Refunded!
                      </>
                    ) : refundStatus === 'error' ? (
                      <>
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-400" /> Try Again
                      </>
                    ) : (
                      'Get Your Refund'
                    )}
                  </button>
                  {refundStatus === 'error' && (
                    <div className="mt-2 text-red-600 text-sm flex items-center"><AlertTriangle className="h-4 w-4 mr-1" />{refundError}</div>
                  )}
                </div>
              )}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 flex items-start rounded-lg">
                <Clock className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <span className="text-sm text-blue-800 font-medium text-left block mb-1"><strong>Want to try again?</strong></span>
                  <span className="text-sm text-blue-700 text-left block">
                    If both parties are still interested, the seller can create a new trade link. Make sure to complete each step within the allowed time to avoid expiration.
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Event Details */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Event</span>
                <span className="text-gray-900 font-medium">{trade.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900">{trade.eventDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900">{trade.eventCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Section & Row</span>
                <span className="text-gray-900">{trade.eventSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Number of Tickets</span>
                <span className="text-gray-900">{trade.numberOfTickets || 0}</span>
              </div>
            </div>
          </div>
          {/* Price Breakdown */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Price Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Price per Ticket</span>
                <span className="text-gray-900">${trade.pricePerTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Fee (5%)</span>
                <span className="text-gray-900">${buyerFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="text-gray-900 font-medium">${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Seller/Buyer Info */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {userRole === 'seller' && trade.status !== 'Created' ? 'Buyer Information' : 'Seller Information'}
            </h2>
            <div className="flex items-center justify-between">
              {renderSellerInfo()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCreatedExpired) {
    // Expired by no payment (Created + 12h) or Expired
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trade #{trade?.tradeId ?? ''}</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Expired
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Expired</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payment was received within the 12-hour time limit. This trade is no longer active.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <span className="text-sm text-yellow-700 font-medium text-left">
                  <strong>Important:</strong> To proceed, the seller must generate a new trade link.
                </span>
              </div>
            </div>
          </div>
          {/* Event Details */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Event</span>
                <span className="text-gray-900 font-medium">{trade.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-900">{trade.eventDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900">{trade.eventCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Section & Row</span>
                <span className="text-gray-900">{trade.eventSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Number of Tickets</span>
                <span className="text-gray-900">{trade.numberOfTickets || 0}</span>
              </div>
            </div>
          </div>
          {/* Price Breakdown */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Price Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Price per Ticket</span>
                <span className="text-gray-900">${trade.pricePerTicket.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Fee (5%)</span>
                <span className="text-gray-900">${buyerFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="text-gray-900 font-medium">${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Seller/Buyer Info */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {userRole === 'seller' && trade.status !== 'Created' ? 'Buyer Information' : 'Seller Information'}
            </h2>
            <div className="flex items-center justify-between">
              {renderSellerInfo()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Status Section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trade #{trade?.tradeId ?? ''}</h1>
              {trade.status === 'Created' && timeLeft && timeLeft !== 'Expired' && (
                <div className="mt-2 inline-flex items-center text-sm text-red-600 bg-red-50 rounded px-2 py-1">
                  <Clock className="w-4 h-4 mr-1 text-red-400" />
                  Time left to pay: {timeLeft}
                </div>
              )}
              {userRole === 'seller' && trade.status === 'Paid' && paidTimeLeft && paidTimeLeft !== 'Expired' && (
                <div className="mt-2 inline-flex items-center text-sm text-red-600 bg-red-50 rounded px-2 py-1">
                  <Clock className="w-4 h-4 mr-1 text-red-400" />
                  Time left to transfer the tickets: {paidTimeLeft}
                </div>
              )}
              {userRole === 'buyer' && trade.status === 'Paid' && paidTimeLeft && paidTimeLeft !== 'Expired' && (
                <>
                  <div className="mt-2 inline-flex items-center text-sm text-red-600 bg-red-50 rounded px-2 py-1">
                    <Clock className="w-4 h-4 mr-1 text-red-400" />
                    Time left to receive your tickets: {paidTimeLeft}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {timeLeft === 'Expired' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Expired
                </span>
              ) : (
                <StatusBadge />
              )}
            </div>
          </div>

          {/* Status Messages and CTAs */}
          {timeLeft === 'Expired' ? (
            <div className="space-y-6">
              <div className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Expired</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payment was received within the 12-hour time limit. This trade is no longer active.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <span className="text-sm text-yellow-700 font-medium text-left">
                  <strong>Important:</strong> To proceed, the seller must generate a new trade link.
                </span>
              </div>
            </div>
          ) : userRole === 'seller' && trade.status === 'Paid' ? (
            <div className="space-y-6">
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-blue-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Transfer Tickets Now</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Payment has been received. Please transfer the tickets to the buyer using the official event platform.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Transfer Instructions</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Log in to your Ticketmaster account (or the official event platform)</li>
                        <li>Go to "My Tickets" or "Manage Tickets"</li>
                        <li>Select the tickets for {trade.eventName}</li>
                        <li>Choose "Transfer Tickets" option</li>
                        <li>Enter the buyer's information exactly as shown below</li>
                        <li>Complete the transfer process</li>
                        <li>Return here to mark the tickets as transferred</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer Details</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name</span>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-medium">{`${trade.buyerInfo?.firstname || ''} ${trade.buyerInfo?.lastname || ''}`.trim()}</span>
                        <button
                          onClick={() => handleCopy(`${trade.buyerInfo?.firstname || ''} ${trade.buyerInfo?.lastname || ''}`.trim(), 'name')}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy name"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must match exactly for transfer</p>
                    {copiedField === 'name' && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Address</span>
                      <div className="flex items-center">
                        <span className="text-gray-900">{trade.buyerInfo?.email || ''}</span>
                        <button
                          onClick={() => handleCopy(trade.buyerInfo?.email || '', 'email')}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy email"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Transfer notification will be sent here</p>
                    {copiedField === 'email' && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone Number</span>
                      <div className="flex items-center">
                        <span className="text-gray-900">{trade.buyerInfo?.phoneNumber || ''}</span>
                        <button
                          onClick={() => handleCopy(trade.buyerInfo?.phoneNumber || '', 'phone')}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy phone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Required for ticket transfer verification</p>
                    {copiedField === 'phone' && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> You must complete the transfer within 12 hours or the trade will be automatically cancelled and the payment refunded.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowTransferModal(true)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Mark as Transferred
                  <CheckCircle className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          ) : userRole === 'seller' ? (
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Payment</h3>
              <p className="mt-1 text-sm text-gray-500">
                Share the trade link with your buyer. You'll be notified once payment is received.
              </p>
            </div>
          ) : userRole === 'buyer' && trade.status === 'Paid' ? (
            <>
      
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-blue-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Ticket Transfer</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your payment has been received. The seller has been notified and will transfer your tickets within 12 hours.
                </p>
              </div>
              <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <span className="text-sm text-yellow-700 font-medium text-left">
                    <strong>Important:</strong> If the seller doesn't transfer the tickets in time, you'll be able to request a full refund.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-yellow-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Required</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete your payment to secure these tickets. The seller will be notified once payment is received.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Payment is held in escrow until you confirm ticket receipt</li>
                        <li>Seller must transfer tickets within 12 hours</li>
                        <li>Full refund if tickets aren't transferred</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {!isConnected ? (
                <div className="space-y-4">
                  <button
                    onClick={() => connect({ connector: connectors[0] })}
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Login to Pay
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Secure your ticket(s) now
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePaymentClick}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!(trade.buyerInfo && trade.buyerInfo.address && connectedWallet && trade.buyerInfo.address.toLowerCase() !== connectedWallet.toLowerCase())}
                  >
                    Pay ${finalPrice.toFixed(2)} USDC
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  {trade.buyerInfo && trade.buyerInfo.address && connectedWallet && trade.buyerInfo.address.toLowerCase() !== connectedWallet.toLowerCase() && (
                    <div className="mt-2 flex items-center justify-center text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      This trade is already assigned to another buyer. Payment is not possible.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {trade.status === 'Completed' && (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Completed</h3>
              <p className="mt-1 text-sm text-gray-500">
                This trade has been completed successfully. The tickets have been transferred and payment has been released.
              </p>
            </div>
          )}
        </div>

        {/* Share Instructions - Separate Card */}
        {userRole === 'seller' && trade.status === 'Created' && timeLeft !== 'Expired' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Share with Buyer</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade Link</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-50 p-3 rounded-md font-mono text-sm break-all">{tradeUrl}</div>
                  <button onClick={() => copyToClipboard(tradeUrl)} className="p-2 text-gray-400 hover:text-gray-500" title="Copy link">
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                {showCopiedMessage && <p className="mt-1 text-sm text-green-600">Copied to clipboard!</p>}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Next Steps:</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Share this link with your buyer</li>
                        <li>The buyer will need to deposit {finalPrice} USDC to secure the tickets</li>
                        <li>Once payment is received, you'll be notified to transfer the tickets</li>
                        <li>After successful transfer and buyer confirmation, you'll receive {(totalPrice * 0.95).toFixed(2)} USDC</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> This trade link will expire in 12 hours if no payment is received.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Event Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Event</span>
              <span className="text-gray-900 font-medium">{trade.eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-900">{trade.eventDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span className="text-gray-900">{trade.eventCity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Section & Row</span>
              <span className="text-gray-900">{trade.eventSection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Number of Tickets</span>
              <span className="text-gray-900">{trade.numberOfTickets || 0}</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Price Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Price per Ticket</span>
              <span className="text-gray-900">${trade.pricePerTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee (5%)</span>
              <span className="text-gray-900">${buyerFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Total</span>
                <span className="text-gray-900 font-medium">${finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller/Buyer Info */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {userRole === 'seller' && trade.status !== 'Created' ? 'Buyer Information' : 'Seller Information'}
          </h2>
          <div className="flex items-center justify-between">
            {renderSellerInfo()}
          </div>
        </div>

        <ConfirmationModal />
        <TransferConfirmationModal />
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSuccess={() => setUserExists(true)}
          address={isConnected || ''}
        />
        
        <InsufficientBalanceModal
          isOpen={showInsufficientBalanceModal}
          onClose={() => setShowInsufficientBalanceModal(false)}
          onDeposit={handleDeposit}
        />

        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          tradeId={tradeId || ''}
          amount={finalPrice}
        />
      </div>
    </div>
  );
} 