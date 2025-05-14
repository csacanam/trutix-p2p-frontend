import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, AlertTriangle, Copy, X, XCircle, RotateCcw, ArrowLeft, Send, Scale, Lock } from 'lucide-react';
import { useAccount, useConnect, useBalance, useWriteContract, useTransaction } from 'wagmi';
import axios from 'axios';
import { ProfileModal } from '../components/ProfileModal';
import { InsufficientBalanceModal } from '../components/InsufficientBalanceModal';
import { PaymentModal } from '../components/PaymentModal';
import { TRUTIX_ABI } from '../constants/trutixAbi';
import { decodeEventLog, encodeEventTopics } from 'viem';

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
  const [transferStatus, setTransferStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transferTxHash, setTransferTxHash] = useState<`0x${string}` | undefined>();
  const [transferError, setTransferError] = useState('');
  const { data: transferTx } = useTransaction({ hash: transferTxHash });
  const [sentTimeLeft, setSentTimeLeft] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [claimError, setClaimError] = useState('');
  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | undefined>();
  const { data: claimTx } = useTransaction({ hash: claimTxHash });
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeStatus, setDisputeStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [disputeError, setDisputeError] = useState('');
  const [disputeTxHash, setDisputeTxHash] = useState<`0x${string}` | undefined>();
  const { data: disputeTx } = useTransaction({ hash: disputeTxHash });

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
          console.log('Trade data received:', {
            id: data.id,
            status: data.status,
            createdAt: data.createdAt,
            sellerInfo: data.sellerInfo,
            buyerInfo: data.buyerInfo,
            amount: data.amount,
            ticketDetails: data.ticketDetails
          });
          setTrade(data);
          
          // Determine user role based on the connected wallet
          if (connectedWallet) {
            console.log('Connected wallet:', connectedWallet);
            console.log('Seller wallet:', data.sellerInfo?.address);
            console.log('Trade status:', data.status);
            
            if (data.sellerInfo?.address && connectedWallet.toLowerCase() === data.sellerInfo.address.toLowerCase()) {
              console.log('User is the seller');
              setUserRole('seller');
            } else if (data.buyerInfo?.address && connectedWallet.toLowerCase() === data.buyerInfo.address.toLowerCase()) {
              console.log('User is the buyer');
              setUserRole('buyer');
            } else {
              console.log('User is not the seller or buyer');
              setUserRole(null);
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

  // Add a useEffect to handle the countdown for 'Sent' state
  useEffect(() => {
    if (!trade || trade.status !== 'Sent' || !trade.sentAt) {
      setSentTimeLeft(null);
      return;
    }
    const sentAt = new Date(trade.sentAt).getTime();
    const deadline = sentAt + 12 * 60 * 60 * 1000; // 12 hours in ms

    const updateSentTimer = () => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setSentTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setSentTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateSentTimer();
    const interval = setInterval(updateSentTimer, 1000);
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
    // Mostrar badge Expired para todos los expirados
    if (
      trade?.status === 'Expired' ||
      trade?.status === 'ExpiredNoTransfer' ||
      (trade?.status === 'Created' && trade?.createdAt && (Date.now() > new Date(trade.createdAt).getTime() + 12 * 60 * 60 * 1000)) ||
      (trade?.status === 'Paid' && trade?.paidAt && (Date.now() > new Date(trade.paidAt).getTime() + 12 * 60 * 60 * 1000))
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Expired
        </span>
      );
    }
    switch (trade?.status) {
      case 'Dispute':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Scale className="w-4 h-4 mr-1" />
            In Dispute
          </span>
        );
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
      case 'Sent':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            <Send className="w-4 h-4 mr-1 text-blue-700" />
            {userRole === 'seller' ? 'Waiting for Confirmation' : userRole === 'buyer' ? 'Tickets Sent' : ''}
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
                  <strong>Important:</strong> Only confirm the transfer after completing all of the following steps:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700">
                  <li>You've logged into the official ticketing platform.</li>
                  <li>You've successfully transferred the ticket(s) to the buyer's email.</li>
                  <li>The platform confirms the transfer is complete.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>⚠️ Warning:</strong> False confirmation may result in penalties or account suspension.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTransferModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={transferStatus === 'pending'}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setTransferStatus('pending');
                setTransferError('');
                try {
                  const hash = await writeContractAsync({
                    address: TRUTIX_CONTRACT_ADDRESS as `0x${string}`,
                    abi: TRUTIX_ABI,
                    functionName: 'markAsSent',
                    args: [BigInt(trade.tradeId)],
                  });
                  setTransferTxHash(hash);
                } catch (error) {
                  setTransferStatus('error');
                  setTransferError('Transaction failed. Please try again.');
                }
              }}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={transferStatus === 'pending'}
            >
              {transferStatus === 'pending' ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin inline" /> Processing...
                </>
              ) : transferStatus === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400 inline" /> Confirmed!
                </>
              ) : transferStatus === 'error' ? (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-400 inline" /> Try Again
                </>
              ) : (
                'Confirm Transfer'
              )}
            </button>
          </div>
          {transferStatus === 'error' && (
            <div className="mt-4 text-red-600 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {transferError}
            </div>
          )}
          {transferStatus === 'success' && (
            <div className="mt-4 text-green-600 text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Transfer confirmed successfully!
            </div>
          )}
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

  // Add a helper to determine if Sent is expired
  const isSentExpired = trade?.status === 'Sent' && trade?.sentAt && (Date.now() > new Date(trade.sentAt).getTime() + 12 * 60 * 60 * 1000);

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

  // Add effect to handle transfer transaction
  useEffect(() => {
    if (transferTx?.blockHash) {
      console.log('Smart contract transfer successful, blockHash:', transferTx.blockHash);
      setTransferStatus('success');
      
      // Update backend trade status to Sent
      (async () => {
        try {
          // Fetch the user's Airtable recordId
          let recordId = connectedWallet;
          try {
            const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${connectedWallet}`);
            const userData = await userRes.json();
            if (userData.recordId) {
              recordId = userData.recordId;
            }
          } catch (err) {
            console.error('Error fetching user recordId:', err);
          }

          console.log('Invoking backend to update trade status to Sent...');
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Sent',
              sentAt: new Date().toISOString(),
              lastUpdatedBy: recordId
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log('Backend update successful');
          setShowTransferModal(false);
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } catch (err) {
          console.error('Error updating trade in backend:', err);
          setTransferStatus('error');
          setTransferError('Transfer succeeded but failed to update backend. Please refresh.');
        }
      })();
    } else if (transferTx?.blockHash === null) {
      console.log('Smart contract transfer failed.');
      setTransferStatus('error');
      setTransferError('Transaction failed. Please try again.');
    }
  }, [transferTx, tradeId, connectedWallet]);

  // Add effect to handle claim payment transaction
  useEffect(() => {
    if (claimTx?.blockHash) {
      console.log('Smart contract claim successful, blockHash:', claimTx.blockHash);
      setClaimStatus('success');
      
      // Update backend to Completed
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

          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Completed',
              lastUpdatedBy: recordId,
              confirmedAt: new Date().toISOString(),
              paymentClaimed: true,
              paymentClaimedAt: new Date().toISOString(),
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log('Backend update successful');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } catch (err) {
          console.error('Error updating trade in backend:', err);
          setClaimStatus('error');
          setClaimError('Payment claim succeeded but failed to update backend. Please refresh.');
        }
      })();
    } else if (claimTx?.blockHash === null) {
      console.log('Smart contract claim failed.');
      setClaimStatus('error');
      setClaimError('Transaction failed. Please try again.');
    }
  }, [claimTx, tradeId, connectedWallet]);

  // Add effect to handle dispute transaction
  useEffect(() => {
    if (disputeTx?.blockHash) {
      console.log('Smart contract dispute successful, blockHash:', disputeTx.blockHash);
      
      // Update backend to Dispute
      (async () => {
        try {
          // Fetch the user's Airtable recordId
          let recordId = connectedWallet;
          try {
            const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${connectedWallet}`);
            const userData = await userRes.json();
            if (userData.recordId) {
              recordId = userData.recordId;
            }
          } catch (err) {
            console.error('Error fetching user recordId:', err);
          }

          console.log('Invoking backend to update trade status to Dispute...');
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Dispute',
              disputedAt: new Date().toISOString(),
              lastUpdatedBy: recordId
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend update failed:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const updatedTrade = await response.json();
          console.log('Backend update successful:', updatedTrade);
          
          setDisputeStatus('success');
          setShowDisputeModal(false);
          
          // Esperar un momento y recargar la página
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } catch (err) {
          console.error('Error updating trade in backend:', err);
          setDisputeStatus('error');
          setDisputeError('Dispute succeeded but failed to update backend. Please refresh.');
        }
      })();
    } else if (disputeTx?.blockHash === null) {
      console.log('Smart contract dispute failed.');
      setDisputeStatus('error');
      setDisputeError('Transaction failed. Please try again.');
    }
  }, [disputeTx, tradeId, connectedWallet]);

  // Modify the dispute button click handler
  const handleDisputeClick = async () => {
    if (!writeContractAsync) {
      console.error('writeContractAsync is not available');
      setDisputeError('Wallet connection error. Please try again.');
      return;
    }

    try {
      console.log('Environment check:', {
        isTestnet: import.meta.env.VITE_USE_TESTNET,
        contractAddress: TRUTIX_CONTRACT_ADDRESS,
        usdcAddress: USDC_ADDRESS,
        backendUrl: import.meta.env.VITE_BACKEND_URL
      });

      console.log('Initiating dispute transaction...');
      console.log('Contract address:', TRUTIX_CONTRACT_ADDRESS);
      console.log('Trade ID:', trade.tradeId);
      console.log('Connected wallet:', connectedWallet);
      console.log('Current balance:', balance?.formatted);
      
      setDisputeStatus('pending');
      setDisputeError('');

      const hash = await writeContractAsync({
        address: TRUTIX_CONTRACT_ADDRESS as `0x${string}`,
        abi: TRUTIX_ABI,
        functionName: 'disputeTrade',
        args: [BigInt(trade.tradeId)],
      });

      console.log('Dispute transaction hash:', hash);
      setDisputeTxHash(hash);
    } catch (error) {
      console.error('Error in dispute transaction:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      setDisputeStatus('error');
      setDisputeError('Transaction failed. Please try again.');
    }
  };

  // 2. Modal de disputa
  const DisputeModal = () => {
    if (!showDisputeModal) return null;
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-bold text-red-600 mb-2">🚨 Report a Problem</h3>
          <p className="text-gray-700 mb-4">
            You're about to initiate a dispute for this trade. Please use this only if you didn't receive the tickets or there's a serious issue with the transfer.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 flex items-start">
            <span className="text-2xl mr-2">⚠️</span>
            <span className="text-sm text-yellow-700 font-medium">False reports may result in penalties or account suspension.</span>
          </div>
          {disputeError && (
            <div className="mb-3 text-red-600 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {disputeError}
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                if (disputeStatus !== 'pending') setShowDisputeModal(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={disputeStatus === 'pending'}
            >
              Cancel
            </button>
            <button
              onClick={handleDisputeClick}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 ${disputeStatus === 'pending' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={disputeStatus === 'pending'}
            >
              {disputeStatus === 'pending' ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin inline" /> Submitting...
                </>
              ) : (
                'Submit Dispute'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the mobile styles to reposition elements on mobile
  const mobileStatusStyles = `
    @media (max-width: 640px) {
      .status-container {
        display: none;
      }
      .title-container {
        width: 100%;
      }
      .mobile-status-badge {
        display: flex;
        margin-top: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .mobile-status-badge span {
        display: inline-flex;
        justify-content: center;
        width: auto;
      }
      .timer-container {
        width: 100%;
        display: flex;
        justify-content: flex-start;
      }
    }
    @media (min-width: 641px) {
      .mobile-status-badge {
        display: none;
      }
      .status-container {
        align-self: flex-start;
        margin-top: 0.25rem;
      }
    }
  `;

  // Add new component for private trade view
  const PrivateTradeView = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
    return (
      <div className="text-center py-8">
        <Lock className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          {isAuthenticated ? "You are not a participant in this trade" : "This trade is private"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isAuthenticated 
            ? "Only the buyer and seller can access this trade's details."
            : "This trade has already been taken. Please log in to check if you're the buyer or the seller involved."
          }
        </p>
        {!isAuthenticated && (
          <div className="mt-6">
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Login to view the trade
            </button>
          </div>
        )}
      </div>
    );
  };

  // Add debug logs for balance and contract addresses
  useEffect(() => {
    if (connectedWallet) {
      console.log('Environment check:', {
        isTestnet: import.meta.env.VITE_USE_TESTNET,
        contractAddress: TRUTIX_CONTRACT_ADDRESS,
        usdcAddress: USDC_ADDRESS,
        backendUrl: import.meta.env.VITE_BACKEND_URL
      });

      console.log('Balance check:', {
        address: connectedWallet,
        balance: balance?.formatted,
        symbol: balance?.symbol,
        decimals: balance?.decimals,
        raw: balance?.value
      });
    }
  }, [connectedWallet, balance]);

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
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Trades
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

  // Add this function before the return statement of the component
  function renderStatusSection() {
    // Completed or Sent Expired
    if (trade.status === 'Completed' || isSentExpired) {
      return (
        <div className="text-center space-y-3">
          <CheckCircle className="mx-auto h-12 w-12 text-green-700" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Completed</h3>
          <p className="mt-1 text-sm text-gray-500">
            {userRole === 'buyer'
              ? 'The tickets have been successfully transferred and the trade is now closed.'
              : trade.paymentClaimed
                ? 'The trade is complete and your payment has been released.'
                : 'The trade is complete. You can now claim your payment.'}
          </p>
          {userRole === 'seller' && (
            trade.paymentClaimed ? (
              <div className="flex items-center justify-center text-green-700 font-medium text-sm gap-1">
                <CheckCircle className="w-5 h-5 text-green-700" /> Payment received
              </div>
            ) : (
              <button
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  setClaimStatus('pending');
                  setClaimError('');
                  try {
                    const hash = await writeContractAsync({
                      address: TRUTIX_CONTRACT_ADDRESS as `0x${string}`,
                      abi: TRUTIX_ABI,
                      functionName: 'expireTrade',
                      args: [BigInt(trade.tradeId)],
                    });
                    setClaimTxHash(hash);
                  } catch (error) {
                    setClaimStatus('error');
                    setClaimError('Transaction failed. Please try again.');
                  }
                }}
                disabled={claimStatus === 'pending'}
              >
                {claimStatus === 'pending' ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" /> Processing...
                  </>
                ) : claimStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" /> Payment claimed!
                  </>
                ) : claimStatus === 'error' ? (
                  <>
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-400" /> Try Again
                  </>
                ) : (
                  'Get My Payment'
                )}
              </button>
            )
          )}
          {claimStatus === 'error' && (
            <div className="mt-2 text-red-600 text-sm flex items-center"><AlertTriangle className="h-4 w-4 mr-1" />{claimError}</div>
          )}
        </div>
      );
    }

    // Refunded
    if (trade.status === 'Refunded') {
      return (
        <div className="text-center space-y-3">
          <RotateCcw className="mx-auto h-12 w-12 text-amber-700" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Refunded</h3>
          <p className="mt-1 text-sm text-gray-500">
            This trade has been refunded and is no longer active.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {userRole === 'buyer' 
                    ? 'Your payment has been refunded to your balance.'
                    : 'The buyer has received their refund.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Expired
    if (isPaidExpired || isCreatedExpired) {
      return (
        <div className="text-center space-y-3">
          <XCircle className="mx-auto h-12 w-12 text-red-700" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Expired</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isPaidExpired
              ? 'The seller did not transfer the tickets within the 12-hour time limit after payment. This trade is no longer active.'
              : 'No payment was received within the 12-hour time limit. This trade is no longer active.'}
          </p>
          {isPaidExpired && userRole === 'buyer' && (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You can now get a full refund.
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
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
            </>
          )}
          {isPaidExpired && userRole === 'seller' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm text-yellow-700">
                    This trade has expired and can no longer be completed. The buyer may now request a refund.
                  </p>
                </div>
              </div>
            </div>
          )}
          {isCreatedExpired && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    To proceed, the seller must generate a new trade link.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Created
    if (trade.status === 'Created' && !isCreatedExpired) {
      if (userRole === 'seller') {
        return (
          <div className="text-center space-y-6">
            <Clock className="mx-auto h-12 w-12 text-yellow-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Payment</h3>
            <p className="mt-1 text-sm text-gray-500">
              Share the trade link with your buyer. You'll be notified once payment is received.
            </p>
            
            {/* Share Link Section */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Share Trade Link</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={tradeUrl}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => handleCopy(tradeUrl, 'link')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  {copiedField === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Send this link to your buyer. They'll be able to view the trade details and make the payment.
              </p>
            </div>
          </div>
        );
      }
      // Mostrar la misma UI para buyer y usuarios no logueados (userRole === 'buyer' || userRole === null)
      if (userRole === 'buyer' || userRole === null) {
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Clock className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Required</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete your payment to secure these tickets. The seller will be notified once payment is received.
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Important Information</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Payment is held in escrow until you confirm ticket receipt</li>
                    <li>Seller must transfer tickets within 24 hours</li>
                    <li>Full refund if tickets aren't transferred</li>
                  </ul>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!isConnected) {
                  // Si no está conectado, mostrar el modal de conexión
                  connect({ connector: connectors[0] });
                } else {
                  handlePaymentClick();
                }
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {!isConnected ? (
                <>
                  Login to Pay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Pay ${finalPrice.toFixed(2)} USDC
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        );
      }
    }

    // Paid
    if (trade.status === 'Paid') {
      if (userRole === 'seller') {
        return (
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
                        className="ml-2 text-gray-400 hover:text-gray-500"
                        title="Copy name"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Some platforms may ask for it.</p>
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
                  <p className="mt-1 text-xs text-gray-500">Required for most official ticket transfers.</p>
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
                  <p className="mt-1 text-xs text-gray-500">May help if you need to contact the buyer.</p>
                  {copiedField === 'phone' && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
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
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Mark as Transferred
                <CheckCircle className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        );
      }
      // Buyer
      if (userRole === 'buyer') {
        return (
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-blue-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Ticket Transfer</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your payment has been received. The seller has been notified and will transfer your tickets within 24 hours.
            </p>
          </div>
        );
      }
    }

    // Sent
    if (trade.status === 'Sent') {
      if (userRole === 'seller') {
        // ... Waiting for Buyer Confirmation block ...
        return (
          <div className="text-center">
            <Send className="mx-auto h-12 w-12 text-blue-700" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Buyer Confirmation</h3>
            <p className="mt-1 text-sm text-gray-500">
              You've marked the tickets as transferred.<br />
              The buyer now has up to 12 hours to report a problem.
            </p>
          </div>
        );
      }
      if (userRole === 'buyer') {
        // ... Tickets Have Been Sent block ...
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Send className="mx-auto h-12 w-12 text-blue-700" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Tickets Have Been Sent</h3>
              <p className="mt-1 text-sm text-gray-500">
                The seller has marked the tickets as transferred.<br />
                Please check your email or the official platform to verify the transfer.
              </p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start rounded-lg">
              <span className="text-2xl mr-2">⚠️</span>
              <span className="text-sm text-yellow-700 font-medium text-left">
                If you didn't receive the tickets, you have 12 hours to report it.<br />
                After that, the trade will be completed and refunds will no longer be possible.
              </span>
            </div>
            <button
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              onClick={() => setShowDisputeModal(true)}
            >
              Report a Problem
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Use this only if you didn't receive the tickets or there's a serious issue with the transfer.
            </p>
            <DisputeModal />
          </div>
        );
      }
    }

    // Dispute
    if (trade.status === 'Dispute') {
      return (
        <div className="text-center space-y-3">
          <Scale className="mx-auto h-12 w-12 text-yellow-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Under Review</h3>
          <p className="mt-1 text-sm text-gray-500">
            {userRole === 'buyer'
              ? 'You reported a problem with this trade. Our team is reviewing your case. Please wait for a resolution.'
              : 'The buyer reported a problem. Our team is currently reviewing the dispute. You may be contacted for evidence.'}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <span className="text-sm text-yellow-700 text-left">
              Disputes are handled manually. Both parties may be asked to provide evidence. A decision will be made soon.
            </span>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="text-center">
        <Send className="mx-auto h-12 w-12 text-blue-700" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Buyer Confirmation</h3>
        <p className="mt-1 text-sm text-gray-500">
          You've marked the tickets as transferred.<br />
          The buyer now has up to 12 hours to report a problem.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <style dangerouslySetInnerHTML={{ __html: mobileStatusStyles }}></style>
      <div className="space-y-8">
        {/* Back to trades link */}
        <div className="mb-2">
          <a
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to trades
          </a>
        </div>

        {/* Status Section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="title-container">
              <h1 className="text-2xl font-bold text-gray-900">Trade #{trade?.tradeId ?? ''}</h1>
            </div>
          </div>

          {/* Show private view for non-Created trades when user is not logged in or not a participant */}
          {(!connectedWallet && trade?.status !== 'Created' && timeLeft !== 'Expired') && (
            <PrivateTradeView isAuthenticated={false} />
          )}

          {/* Show private view for authenticated users who are not participants */}
          {(connectedWallet && userRole === null && trade?.status !== 'Created' && timeLeft !== 'Expired') && (
            <PrivateTradeView isAuthenticated={true} />
          )}

          {/* Show full trade details for Created trades or for participants */}
          {((trade?.status === 'Created' && timeLeft !== 'Expired') || 
            (connectedWallet && (userRole === 'buyer' || userRole === 'seller'))) && (
            <>
              <div className="flex justify-between items-start mb-6">
                <div className="title-container">
                  {/* Mobile-only status badge - moved before timers */}
                  <div className="mobile-status-badge">
                    {timeLeft === 'Expired' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4 mr-1" />
                        Expired
                      </span>
                    ) : (
                      <StatusBadge />
                    )}
                  </div>
                
                  {trade.status === 'Created' && timeLeft && timeLeft !== 'Expired' && (
                    <div className="mt-2 inline-flex items-center text-sm text-red-600 bg-red-50 rounded px-2 py-1 timer-container">
                      <Clock className="w-4 h-4 mr-1 text-red-400" />
                      Time left to pay: {timeLeft}
                    </div>
                  )}
                  {userRole === 'seller' && trade.status === 'Paid' && paidTimeLeft && paidTimeLeft !== 'Expired' && (
                    <div className="mt-2 inline-flex items-center text-sm text-red-600 bg-red-50 rounded px-2 py-1 timer-container">
                      <Clock className="w-4 h-4 mr-1 text-red-400" />
                      Time left to transfer the tickets: {paidTimeLeft}
                    </div>
                  )}
                  {userRole === 'buyer' && trade.status === 'Paid' && paidTimeLeft && paidTimeLeft !== 'Expired' && (
                    <>
                      <div className="mt-2 inline-flex items-center text-sm text-red-600 bg-red-50 rounded px-2 py-1 timer-container">
                        <Clock className="w-4 h-4 mr-1 text-red-400" />
                        Time left to receive your tickets: {paidTimeLeft}
                      </div>
                    </>
                  )}
                  {userRole === 'seller' && trade.status === 'Sent' && sentTimeLeft && sentTimeLeft !== 'Expired' && (
                    <div className="mt-2 inline-flex items-center text-sm text-blue-700 bg-blue-50 rounded px-2 py-1 timer-container">
                      <Clock className="w-4 h-4 mr-1 text-blue-400" />
                      Time left to claim payment: {sentTimeLeft}
                    </div>
                  )}
                  {userRole === 'buyer' && trade.status === 'Sent' && sentTimeLeft && sentTimeLeft !== 'Expired' && (
                    <div className="mt-2 inline-flex items-center text-sm text-yellow-700 bg-yellow-50 rounded px-2 py-1 timer-container">
                      <Clock className="w-4 h-4 mr-1 text-yellow-400" />
                      Time left to report a problem: {sentTimeLeft}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 status-container">
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
              {renderStatusSection()}
            </>
          )}
        </div>

        {/* Only show these sections for Created trades or for participants */}
        {((trade?.status === 'Created' && timeLeft !== 'Expired') || 
          (connectedWallet && (userRole === 'buyer' || userRole === 'seller'))) && (
          <>
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
                  <span className="text-gray-900">{trade.eventLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Section & Row</span>
                  <span className="text-gray-900">{trade.eventSection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Number of Tickets</span>
                  <span className="text-gray-900">{trade.numberOfTickets}</span>
                </div>
              </div>
            </div>

            {/* Price Details */}
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
          </>
        )}

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