import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wallet, X, CreditCard, ArrowRight, Copy, ExternalLink, ChevronDown, Ban as Bank, QrCode, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useAccount, useConnect, useBalance, useWriteContract, useTransaction } from 'wagmi';
import { cbWalletConnector } from '../wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';
import { Transaction } from '@coinbase/onchainkit/transaction';

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

export function Dashboard() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState('crypto');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error' | 'cancelled'>('idle');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

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

  const handleWithdraw = () => {
    if (!address) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsWithdrawModalOpen(true);
  };

  const handleDeposit = () => {
    if (!address) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsDepositModalOpen(true);
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
                onClick={() => {
                  connect({ connector: cbWalletConnector });
                  setIsLoginModalOpen(false);
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

  const trades = [
    // Seller perspective - Pending Payment
    {
      id: '1a',
      role: 'seller',
      status: 'pending_payment',
      event: {
        name: 'Taylor Swift | The Eras Tour',
        date: '2024-08-15',
        city: 'Los Angeles, CA',
        locality: 'Section 102, Row F',
        numTickets: 2,
        pricePerTicket: 350,
      },
      buyer: {
        name: 'Sarah M.',
      },
      createdAt: '2024-03-15T10:00:00Z',
    },
    // Buyer perspective - Pending Payment
    {
      id: '1b',
      role: 'buyer',
      status: 'pending_payment',
      event: {
        name: 'Taylor Swift | The Eras Tour',
        date: '2024-08-15',
        city: 'Los Angeles, CA',
        locality: 'Section 102, Row F',
        numTickets: 2,
        pricePerTicket: 350,
      },
      seller: {
        name: 'John D.',
        rating: 4.8,
      },
      createdAt: '2024-03-15T10:00:00Z',
    },
    // Seller perspective - Paid
    {
      id: '2a',
      role: 'seller',
      status: 'paid',
      event: {
        name: 'Bad Bunny World Tour',
        date: '2024-07-20',
        city: 'Miami, FL',
        locality: 'Section 204, Row C',
        numTickets: 1,
        pricePerTicket: 250,
      },
      buyer: {
        name: 'Mike R.',
      },
      createdAt: '2024-03-14T15:30:00Z',
    },
    // Buyer perspective - Paid
    {
      id: '2b',
      role: 'buyer',
      status: 'paid',
      event: {
        name: 'Bad Bunny World Tour',
        date: '2024-07-20',
        city: 'Miami, FL',
        locality: 'Section 204, Row C',
        numTickets: 1,
        pricePerTicket: 250,
      },
      seller: {
        name: 'John D.',
        rating: 4.8,
      },
      createdAt: '2024-03-14T15:30:00Z',
    },
    // Seller perspective - Transferred
    {
      id: '3a',
      role: 'seller',
      status: 'transferred',
      event: {
        name: 'Beyoncé Renaissance Tour',
        date: '2024-09-01',
        city: 'New York, NY',
        locality: 'Section VIP, Row 2',
        numTickets: 2,
        pricePerTicket: 500,
      },
      buyer: {
        name: 'Lisa K.',
      },
      createdAt: '2024-03-13T09:15:00Z',
    },
    // Buyer perspective - Transferred
    {
      id: '3b',
      role: 'buyer',
      status: 'transferred',
      event: {
        name: 'Beyoncé Renaissance Tour',
        date: '2024-09-01',
        city: 'New York, NY',
        locality: 'Section VIP, Row 2',
        numTickets: 2,
        pricePerTicket: 500,
      },
      seller: {
        name: 'John D.',
        rating: 4.8,
      },
      createdAt: '2024-03-13T09:15:00Z',
    },
    // Seller perspective - Completed
    {
      id: '4a',
      role: 'seller',
      status: 'completed',
      event: {
        name: 'Coldplay Music of the Spheres',
        date: '2024-06-10',
        city: 'Chicago, IL',
        locality: 'Section 115, Row 10',
        numTickets: 3,
        pricePerTicket: 200,
      },
      buyer: {
        name: 'Emma W.',
      },
      createdAt: '2024-03-10T14:20:00Z',
    },
    // Buyer perspective - Completed
    {
      id: '4b',
      role: 'buyer',
      status: 'completed',
      event: {
        name: 'Coldplay Music of the Spheres',
        date: '2024-06-10',
        city: 'Chicago, IL',
        locality: 'Section 115, Row 10',
        numTickets: 3,
        pricePerTicket: 200,
      },
      seller: {
        name: 'John D.',
        rating: 4.8,
      },
      createdAt: '2024-03-10T14:20:00Z',
    },
  ];

  const StatusBadge = ({ status, role }) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            {role === 'seller' ? 'Awaiting Payment' : 'Payment Required'}
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {role === 'seller' ? 'Transfer Tickets' : 'Waiting for Transfer'}
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {role === 'seller' ? 'Awaiting Confirmation' : 'Confirm Receipt'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Your Balance</h2>
              {address ? (
                <p className="text-3xl font-bold text-gray-900">
                  {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(2)} USDC` : 'Loading...'}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Please login or sign up to view your balance.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleWithdraw}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowUpRight className="h-5 w-5 mr-2" />
                Withdraw
              </button>
              <button 
                onClick={handleDeposit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Wallet className="h-5 w-5 mr-2" />
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Trade
            </Link>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Trade
            </button>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {address ? (
            trades.length > 0 ? (
              trades.map((trade) => (
                <Link
                  key={trade.id}
                  to={`/trade/${trade.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {trade.event.name}
                          </p>
                          <StatusBadge status={trade.status} role={trade.role} />
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <p>{trade.event.city} • {new Date(trade.event.date).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <div className="text-gray-500">
                              {trade.event.locality} • {trade.event.numTickets} {trade.event.numTickets === 1 ? 'ticket' : 'tickets'}
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {(trade.event.pricePerTicket * trade.event.numTickets).toFixed(2)} USDC
                              </div>
                              <div className="text-xs text-gray-500">
                                {trade.event.pricePerTicket.toFixed(2)} USDC per ticket
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        {trade.role === 'seller' ? (
                          <>Buyer: {trade.buyer.name}</>
                        ) : (
                          <>Seller: {trade.seller.name}</>
                        )}
                      </div>
                      <div className="text-gray-500">
                        Created {new Date(trade.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
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
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsDepositModalOpen(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setIsDepositModalOpen(false)}
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
                    Deposit
                  </h3>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex justify-center mb-4">
                    <QrCode className="h-32 w-32 text-gray-900" />
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-md p-2">
                    <code className="text-sm text-gray-900">{address || '0x1234...5678'}</code>
                    <button
                      onClick={copyToClipboard}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                    >
                      {isCopied ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">How to Deposit USDC</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p className="font-medium mb-2">From an Exchange (Coinbase, Binance):</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Buy or convert to USDC on your exchange</li>
                          <li>Select withdraw/send USDC</li>
                          <li>Choose the Base network</li>
                          <li>Paste the address above</li>
                          <li>Confirm the withdrawal</li>
                        </ol>
                        
                        <p className="font-medium mt-4 mb-2">From a Wallet (MetaMask, Coinbase Wallet):</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Make sure you're on the Base network</li>
                          <li>Select send/transfer USDC</li>
                          <li>Paste the address above</li>
                          <li>Confirm the transaction</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExternalLink className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Only send USDC on Base network. No minimum deposit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                if (transactionStatus === 'idle') {
                  setIsWithdrawModalOpen(false);
                }
              }}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => {
                    if (transactionStatus === 'idle' || transactionStatus === 'success') {
                      setIsWithdrawModalOpen(false);
                      setTransactionStatus('idle');
                      setWithdrawError('');
                      setWithdrawAddress('');
                      setWithdrawAmount('');
                    }
                  }}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  disabled={transactionStatus === 'pending'}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  {transactionStatus === 'pending' ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  ) : transactionStatus === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : transactionStatus === 'cancelled' ? (
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {transactionStatus === 'pending' ? 'Processing Withdrawal...' :
                     transactionStatus === 'success' ? 'Withdrawal Successful!' :
                     transactionStatus === 'cancelled' ? 'Transaction Cancelled' :
                     'Withdraw USDC'}
                  </h3>
                </div>
              </div>

              {transactionStatus === 'success' ? (
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          Your withdrawal has been processed successfully!
                        </p>
                        {transactionHash && (
                          <a
                            href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:underline mt-1 block"
                          >
                            View on Basescan
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Your new balance will be updated shortly.
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setIsWithdrawModalOpen(false);
                        setTransactionStatus('idle');
                        setWithdrawError('');
                        setWithdrawAddress('');
                        setWithdrawAmount('');
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : transactionStatus === 'cancelled' ? (
                <div className="mt-6 space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Transaction was cancelled.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Please close this window and try again.
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setIsWithdrawModalOpen(false);
                        setTransactionStatus('idle');
                        setWithdrawError('');
                        setWithdrawAddress('');
                        setWithdrawAmount('');
                      }}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : transactionStatus === 'pending' ? (
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Please confirm the transaction in your wallet.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          If you don't see the wallet popup, check your browser's popup blocker.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setTransactionStatus('idle');
                        setWithdrawError('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={withdrawAddress}
                      onChange={(e) => {
                        setWithdrawAddress(e.target.value);
                        setWithdrawError('');
                      }}
                      placeholder="0x..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount
                      </label>
                      <div className="text-sm text-gray-500">
                        Available: {balance ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(2) : '0.00'} USDC
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        id="amount"
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value);
                          setWithdrawError('');
                        }}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-20"
                      />
                      <button
                        onClick={handleMaxClick}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {withdrawError && (
                    <div className="text-sm text-red-600">
                      {withdrawError}
                    </div>
                  )}

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Important Instructions</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Only withdraw to a wallet address on the Base network</li>
                            <li>Make sure your wallet supports Base network and USDC</li>
                            <li>Double check the address before confirming</li>
                            <li>Withdrawals are processed within 5 minutes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transactionStatus === 'idle' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdrawSubmit}
                    disabled={transactionStatus !== 'idle'}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transactionStatus === 'pending' ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal />
    </>
  );
}