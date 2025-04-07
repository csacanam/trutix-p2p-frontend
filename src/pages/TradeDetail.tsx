import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, AlertTriangle, Copy } from 'lucide-react';

// Mock data - In a real app, this would come from your API
const mockTrades = {
  '1a': {
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
    seller: {
      name: 'John D.',
      rating: 4.8,
    },
    buyer: {
      name: 'Sarah M.',
      email: 'sarah.m@example.com',
      phone: '+1 (555) 123-4567'
    },
    createdAt: '2024-03-15T10:00:00Z',
  },
  '1b': {
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
    buyer: {
      name: 'Sarah M.',
      email: 'sarah.m@example.com',
      phone: '+1 (555) 123-4567'
    },
    createdAt: '2024-03-15T10:00:00Z',
  },
  '2a': {
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
    seller: {
      name: 'John D.',
      rating: 4.8,
    },
    buyer: {
      name: 'Mike R.',
      email: 'mike.r@example.com',
      phone: '+1 (555) 234-5678'
    },
    createdAt: '2024-03-14T15:30:00Z',
  },
  '2b': {
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
    buyer: {
      name: 'Mike R.',
      email: 'mike.r@example.com',
      phone: '+1 (555) 234-5678'
    },
    createdAt: '2024-03-14T15:30:00Z',
  },
  '3a': {
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
    seller: {
      name: 'John D.',
      rating: 4.8,
    },
    buyer: {
      name: 'Lisa K.',
      email: 'lisa.k@example.com',
      phone: '+1 (555) 345-6789'
    },
    createdAt: '2024-03-13T09:15:00Z',
  },
  '3b': {
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
    buyer: {
      name: 'Lisa K.',
      email: 'lisa.k@example.com',
      phone: '+1 (555) 345-6789'
    },
    createdAt: '2024-03-13T09:15:00Z',
  },
  '4a': {
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
    seller: {
      name: 'John D.',
      rating: 4.8,
    },
    buyer: {
      name: 'Emma W.',
      email: 'emma.w@example.com',
      phone: '+1 (555) 456-7890'
    },
    createdAt: '2024-03-10T14:20:00Z',
  },
  '4b': {
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
    buyer: {
      name: 'Emma W.',
      email: 'emma.w@example.com',
      phone: '+1 (555) 456-7890'
    },
    createdAt: '2024-03-10T14:20:00Z',
  },
};

export function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [trade, setTrade] = useState<typeof mockTrades[keyof typeof mockTrades] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (id) {
      if (mockTrades[id]) {
        setTrade(mockTrades[id]);
      } else {
        setTrade(null);
      }
    }
    setLoading(false);
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const StatusBadge = () => {
    switch (trade?.status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            {trade.role === 'seller' ? 'Awaiting Payment' : 'Payment Required'}
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            {trade.role === 'seller' ? 'Transfer Tickets Now' : 'Waiting for Transfer'}
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {trade.role === 'seller' ? 'Awaiting Confirmation' : 'Confirm Receipt'}
          </span>
        );
      case 'completed':
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
              onClick={() => {
                // Handle confirmation
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
              onClick={() => {
                // Handle transfer confirmation
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

  const totalPrice = trade.event.pricePerTicket * trade.event.numTickets;
  const buyerFee = totalPrice * 0.05;
  const finalPrice = totalPrice + buyerFee;
  const tradeUrl = `${window.location.origin}/trade/${trade.id}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Status Section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Trade #{id}</h1>
            <StatusBadge />
          </div>

          {/* Status Messages and CTAs */}
          {trade.status === 'pending_payment' && trade.role === 'buyer' && (
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

              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Pay ${finalPrice.toFixed(2)} USDC
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}

          {trade.status === 'pending_payment' && trade.role === 'seller' && (
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Payment</h3>
              <p className="mt-1 text-sm text-gray-500">
                We've sent the trade details to {trade.buyer.email}. You'll be notified once payment is received.
              </p>
            </div>
          )}

          {trade.status === 'paid' && trade.role === 'seller' && (
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
                        <li>Select the tickets for {trade.event.name}</li>
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
                        <span className="text-gray-900 font-medium">{trade.buyer.name}</span>
                        <button
                          onClick={() => copyToClipboard(trade.buyer.name)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy name"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must match exactly for transfer</p>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email Address</span>
                      <div className="flex items-center">
                        <span className="text-gray-900">{trade.buyer.email}</span>
                        <button
                          onClick={() => copyToClipboard(trade.buyer.email)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy email"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Transfer notification will be sent here</p>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone Number</span>
                      <div className="flex items-center">
                        <span className="text-gray-900">{trade.buyer.phone}</span>
                        <button
                          onClick={() => copyToClipboard(trade.buyer.phone)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Copy phone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Required for ticket transfer verification</p>
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
                      <strong>Important:</strong> You must complete the transfer within 24 hours or the trade will be automatically cancelled and the payment refunded.
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
          )}

          {trade.status === 'paid' && trade.role === 'buyer' && (
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-blue-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Ticket Transfer</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your payment has been received. The seller has been notified and will transfer your tickets within 24 hours.
              </p>
            </div>
          )}

          {trade.status === 'transferred' && trade.role === 'buyer' && (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Tickets Have Been Transferred</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The seller has transferred your tickets. Please verify and confirm receipt to complete the trade.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3 text-left">
                      <p className="text-sm text-yellow-700">
                        <strong>IMPORTANT: Before confirming receipt</strong>
                      </p>
                      <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-yellow-700">
                        <li>Check your email for the ticket transfer notification</li>
                        <li>Accept the transfer in the official event platform</li>
                        <li>Verify the tickets match exactly what you paid for (event, date, section, row)</li>
                        <li>Ensure they are official digital tickets, not screenshots or PDFs</li>
                        <li><strong>WARNING:</strong> Once you confirm receipt, the payment will be released to the seller immediately and cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Confirm Ticket Receipt
                <CheckCircle className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}

          {trade.status === 'transferred' && trade.role === 'seller' && (
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-blue-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Waiting for Buyer Confirmation</h3>
              <p className="mt-1 text-sm text-gray-500">
                The tickets have been transferred successfully. Once the buyer confirms receipt, your payment will be released.
              </p>
            </div>
          )}

          {trade.status === 'completed' && (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Trade Completed</h3>
              <p className="mt-1 text-sm text-gray-500">
                This trade has been completed successfully. The tickets have been transferred and payment has been released.
              </p>
            </div>
          )}
        </div>

        {/* Share Instructions (Only shown for seller when status is pending_payment) */}
        {trade.role === 'seller' && trade.status === 'pending_payment' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Share with Buyer</h2>
            
            <div className="space-y-6">
              {/* Trade Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade Link
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-50 p-3 rounded-md font-mono text-sm break-all">
                    {tradeUrl}
                  </div>
                  <button
                    onClick={() => copyToClipboard(tradeUrl)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                    title="Copy link"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                {showCopiedMessage && (
                  <p className="mt-1 text-sm text-green-600">Copied to clipboard!</p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Next Steps:</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Share this link with your buyer</li>
                        <li>We've sent an email to {trade.buyer.email} with the trade details</li>
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
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> This trade link will expire in 24 hours if no payment is received.
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
              <span className="text-gray-900 font-medium">{trade.event.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-900">{trade.event.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span className="text-gray-900">{trade.event.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Section & Row</span>
              <span className="text-gray-900">{trade.event.locality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Number of Tickets</span>
              <span className="text-gray-900">{trade.event.numTickets}</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Price Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Price per Ticket</span>
              <span className="text-gray-900">${trade.event.pricePerTicket.toFixed(2)}</span>
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

        {/* Seller Info */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {trade.role === 'seller' ? 'Buyer Information' : 'Seller Information'}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {trade.role === 'seller' ? trade.buyer.name[0] : trade.seller.name[0]}
                </span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">
                  {trade.role === 'seller' ? trade.buyer.name : trade.seller.name}
                </p>
                {trade.role === 'buyer' && (
                  <p className="text-gray-500 text-sm">Rating: {trade.seller.rating}/5</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <ConfirmationModal />
        <TransferConfirmationModal />
      </div>
    </div>
  );
}