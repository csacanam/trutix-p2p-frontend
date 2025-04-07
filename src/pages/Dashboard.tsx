import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wallet, X, CreditCard, ArrowRight, Copy, ExternalLink, ChevronDown, Ban as Bank, QrCode, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

export function Dashboard() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState('crypto');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const walletAddress = '0x1234...5678'; // Example address

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    // Could add a toast notification here
  };

  const handleWithdraw = () => {
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a wallet address');
      return;
    }
    if (!withdrawAddress.startsWith('0x') || withdrawAddress.length !== 42) {
      setWithdrawError('Please enter a valid Base network address');
      return;
    }
    // Handle withdraw
    setIsWithdrawModalOpen(false);
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
              <p className="text-3xl font-bold text-gray-900">0.00 USDC</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsWithdrawModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowUpRight className="h-5 w-5 mr-2" />
                Withdraw
              </button>
              <button 
                onClick={() => setIsDepositModalOpen(true)}
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
          <Link
            to="/create-trade"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Trade
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {trades.length > 0 ? (
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
                    <code className="text-sm text-gray-900">{walletAddress}</code>
                    <button
                      onClick={copyToClipboard}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                    >
                      <Copy className="h-5 w-5" />
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
                        Only send USDC on Base network. Minimum deposit: 10 USDC
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
              onClick={() => setIsWithdrawModalOpen(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <ArrowUpRight className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Withdraw USDC
                  </h3>
                </div>
              </div>

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
                  {withdrawError && (
                    <p className="mt-2 text-sm text-red-600">{withdrawError}</p>
                  )}
                </div>

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

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExternalLink className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Minimum withdrawal: 10 USDC. Network fee: 0.50 USDC
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}