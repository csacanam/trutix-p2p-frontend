import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { useWriteContract, useTransaction, useAccount } from 'wagmi';
import { TRUTIX_ABI } from '../constants/trutixAbi';
import { decodeEventLog, erc20Abi, parseUnits } from 'viem';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  amount: number;
}

type TransactionStatus = 'idle' | 'authorizing' | 'paying' | 'pending' | 'success' | 'error' | 'cancelled';

export function PaymentModal({ isOpen, onClose, tradeId, amount }: PaymentModalProps) {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [errorMessage, setErrorMessage] = useState('');

  const { writeContractAsync } = useWriteContract();
  const { data: transaction } = useTransaction({ hash: transactionHash });
  const { address: connectedWallet } = useAccount();

  const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
  const TRUTIX_CONTRACT_ADDRESS = import.meta.env.VITE_TRUTIX_CONTRACT_ADDRESS;

  useEffect(() => {
    if (transaction?.blockHash) {
      console.log('Smart contract payment successful, blockHash:', transaction.blockHash);
      console.log('Full transaction object:', transaction);
      // Try to decode TradePaid event from logs
      if (transaction && Array.isArray((transaction as any).logs)) {
        for (const log of (transaction as any).logs) {
          try {
            const decoded = decodeEventLog({
              abi: TRUTIX_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'TradePaid') {
              console.log('TradePaid event:', decoded.args);
            }
          } catch (err) {
            // Ignore decode errors for non-matching logs
          }
        }
      }
      setTransactionStatus('success');
      // Update backend trade status to Paid
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
          console.log('Invoking backend to update trade status to Paid...');
          // Use ISO string for paidAt for Airtable compatibility
          const paidAt = new Date().toISOString();
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/trades/${tradeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Paid',
              paidAt,
              lastUpdatedBy: recordId,
            }),
          });
          console.log('Backend update invoked successfully.');
        } catch (err) {
          console.error('Error updating trade in backend:', err);
        }
      })();
    } else if (transaction?.blockHash === null) {
      console.log('Smart contract payment failed.');
      setTransactionStatus('error');
      setErrorMessage('Transaction failed. Please try again.');
    }
  }, [transaction, tradeId, connectedWallet]);

  const handlePayment = async () => {
    setTransactionStatus('authorizing');
    try {
      // Step 1: Approve USDC
      await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [TRUTIX_CONTRACT_ADDRESS as `0x${string}`, parseUnits(amount.toString(), 6)],
      });
      setTransactionStatus('paying');
      // Step 2: Call payTrade
      const hash = await writeContractAsync({
        address: TRUTIX_CONTRACT_ADDRESS as `0x${string}`,
        abi: TRUTIX_ABI,
        functionName: 'payTrade',
        args: [BigInt(tradeId)]
      });
      setTransactionHash(hash);
    } catch (error) {
      console.error('Payment error:', error);
      if (error instanceof Error && error.message.includes('User rejected the request')) {
        setTransactionStatus('cancelled');
      } else {
        setErrorMessage('We could not process your payment. Please try again.');
        setTransactionStatus('error');
      }
    }
  };

  const handleClose = () => {
    if (transactionStatus === 'idle' || transactionStatus === 'success') {
      onClose();
      setTransactionStatus('idle');
      setErrorMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              disabled={transactionStatus === 'pending'}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              {transactionStatus === 'authorizing' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              ) : transactionStatus === 'paying' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              ) : transactionStatus === 'pending' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              ) : transactionStatus === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : transactionStatus === 'cancelled' ? (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              ) : (
                <Clock className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {transactionStatus === 'authorizing' ? 'Authorizing payment...' :
                 transactionStatus === 'paying' ? 'Processing payment...' :
                 transactionStatus === 'pending' ? 'Processing Payment...' :
                 transactionStatus === 'success' ? 'Payment Successful!' :
                 transactionStatus === 'cancelled' ? 'Payment Cancelled' :
                 'Confirm Payment'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {transactionStatus === 'authorizing' ? 'We are securely authorizing your USDC payment. Please do not close this window.' :
                   transactionStatus === 'paying' ? 'We are processing your payment. This may take a few seconds.' :
                   transactionStatus === 'pending' ? 'Please confirm the transaction.' :
                   transactionStatus === 'success' ? 'Your payment has been processed successfully.' :
                   transactionStatus === 'cancelled' ? 'The process was cancelled. You can try again anytime.' :
                   `You are about to pay ${amount.toFixed(2)} USDC for this trade.`}
                </p>
              </div>
            </div>
          </div>

          {transactionStatus === 'success' && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Your payment has been processed successfully!
                    </p>
                    {transactionHash && (
                      <a
                        href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline mt-1 inline-flex items-center"
                      >
                        View on Basescan
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500">
                The trade status will be updated shortly.
              </div>
              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {transactionStatus === 'error' && (
            <div className="mt-6 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {errorMessage || 'Payment failed. Please try again.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setTransactionStatus('idle');
                    setErrorMessage('');
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {transactionStatus === 'cancelled' && (
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
                  onClick={handleClose}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {transactionStatus === 'idle' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 