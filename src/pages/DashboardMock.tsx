import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Wallet, X } from 'lucide-react';
import { useAccount, useConnect, useBalance, useWriteContract, useTransaction } from 'wagmi';
import { cbWalletConnector } from '../wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';
import axios from 'axios';
import { LoginModal } from '../components/LoginModal';
import { ProfileModal } from '../components/ProfileModal';
import { SuccessModal } from '../components/SuccessModal';
import { ErrorModal } from '../components/ErrorModal';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

// Mock data for trades
const mockTrades = [
  // Created state - Seller view
  {
    id: '1a',
    status: 'Created',
    eventName: 'Taylor Swift',
    eventDate: '2025-05-30',
    eventCity: 'Miami',
    eventSection: 'VIP',
    numberOfTickets: 1,
    pricePerTicket: 1000,
    totalPaidByBuyer: 1050,
    sellerFee: 50,
    totalEarnedBySeller: 950,
    buyerInfo: null,
    sellerInfo: {
      firstname: 'Jane',
      lastname: 'Smith'
    }
  },
  // Created state - Buyer view
  {
    id: '1b',
    status: 'Created',
    eventName: 'Taylor Swift',
    eventDate: '2025-05-30',
    eventCity: 'Miami',
    eventSection: 'VIP',
    numberOfTickets: 1,
    pricePerTicket: 1000,
    totalPaidByBuyer: 1050,
    sellerFee: 50,
    totalEarnedBySeller: 950,
    buyerInfo: {
      firstname: 'John',
      lastname: 'Doe'
    },
    sellerInfo: {
      firstname: 'Jane',
      lastname: 'Smith'
    }
  },
  // Paid state - Seller view
  {
    id: '2a',
    status: 'Paid',
    eventName: 'Coldplay',
    eventDate: '2025-06-15',
    eventCity: 'New York',
    eventSection: 'Section A',
    numberOfTickets: 2,
    pricePerTicket: 500,
    totalPaidByBuyer: 1050,
    sellerFee: 50,
    totalEarnedBySeller: 950,
    buyerInfo: {
      firstname: 'Alice',
      lastname: 'Johnson'
    },
    sellerInfo: {
      firstname: 'Bob',
      lastname: 'Wilson'
    }
  },
  // Paid state - Buyer view
  {
    id: '2b',
    status: 'Paid',
    eventName: 'Coldplay',
    eventDate: '2025-06-15',
    eventCity: 'New York',
    eventSection: 'Section A',
    numberOfTickets: 2,
    pricePerTicket: 500,
    totalPaidByBuyer: 1050,
    sellerFee: 50,
    totalEarnedBySeller: 950,
    buyerInfo: {
      firstname: 'Alice',
      lastname: 'Johnson'
    },
    sellerInfo: {
      firstname: 'Bob',
      lastname: 'Wilson'
    }
  },
  // Transferred state - Seller view
  {
    id: '3a',
    status: 'Transferred',
    eventName: 'Ed Sheeran',
    eventDate: '2025-07-20',
    eventCity: 'Los Angeles',
    eventSection: 'Floor',
    numberOfTickets: 2,
    pricePerTicket: 750,
    totalPaidByBuyer: 1575,
    sellerFee: 75,
    totalEarnedBySeller: 1425,
    buyerInfo: {
      firstname: 'Michael',
      lastname: 'Brown'
    },
    sellerInfo: {
      firstname: 'Sarah',
      lastname: 'Davis'
    }
  },
  // Transferred state - Buyer view
  {
    id: '3b',
    status: 'Transferred',
    eventName: 'Ed Sheeran',
    eventDate: '2025-07-20',
    eventCity: 'Los Angeles',
    eventSection: 'Floor',
    numberOfTickets: 2,
    pricePerTicket: 750,
    totalPaidByBuyer: 1575,
    sellerFee: 75,
    totalEarnedBySeller: 1425,
    buyerInfo: {
      firstname: 'Michael',
      lastname: 'Brown'
    },
    sellerInfo: {
      firstname: 'Sarah',
      lastname: 'Davis'
    }
  },
  // Completed state - Seller view
  {
    id: '4a',
    status: 'Completed',
    eventName: 'Beyoncé',
    eventDate: '2025-08-10',
    eventCity: 'Chicago',
    eventSection: 'Balcony',
    numberOfTickets: 4,
    pricePerTicket: 300,
    totalPaidByBuyer: 1260,
    sellerFee: 60,
    totalEarnedBySeller: 1140,
    buyerInfo: {
      firstname: 'Emma',
      lastname: 'Wilson'
    },
    sellerInfo: {
      firstname: 'David',
      lastname: 'Miller'
    }
  },
  // Completed state - Buyer view
  {
    id: '4b',
    status: 'Completed',
    eventName: 'Beyoncé',
    eventDate: '2025-08-10',
    eventCity: 'Chicago',
    eventSection: 'Balcony',
    numberOfTickets: 4,
    pricePerTicket: 300,
    totalPaidByBuyer: 1260,
    sellerFee: 60,
    totalEarnedBySeller: 1140,
    buyerInfo: {
      firstname: 'Emma',
      lastname: 'Wilson'
    },
    sellerInfo: {
      firstname: 'David',
      lastname: 'Miller'
    }
  }
];

export function DashboardMock() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error' | 'cancelled'>('idle');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

  const { address } = useAccount();
  const { connect } = useConnect();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  });
  const { writeContractAsync } = useWriteContract();
  const { data: transaction } = useTransaction({ hash: transactionHash });

  useEffect(() => {
    if (transaction?.blockHash) {
      setTransactionStatus('success');
      refetchBalance();
    } else if (transaction?.blockHash === null) {
      setTransactionStatus('error');
      setWithdrawError('Transaction failed. Please try again.');
    }
  }, [transaction, refetchBalance]);

  const checkUserExists = async (walletAddress: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${walletAddress}`);
      const exists = response.data.success;
      setUserExists(exists);
      return exists;
    } catch (error) {
      setUserExists(false);
      return false;
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

  const getStatusBadge = (trade: typeof mockTrades[0]) => {
    // Determine role based on trade ID suffix (a = seller, b = buyer)
    const userRole = trade.id.endsWith('a') ? 'seller' : 'buyer';

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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-1">Your Balance</h2>
            <p className="text-3xl font-bold text-gray-900">
              {balance ? `${formatUnits(balance.value, balance.decimals)} USDC` : '0.00 USDC'}
            </p>
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
        <Link
          to="/create-trade"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Trade
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {mockTrades.map((trade) => {
          const userRole = trade.id.endsWith('a') ? 'seller' : 'buyer';
          return (
            <Link
              key={trade.id}
              to={`/trade-temp/${trade.id}`}
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
                    Created {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
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