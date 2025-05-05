import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useBalance, useWriteContract, useAccount, useTransaction } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  USDC_ADDRESS: string;
}

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';

export function WithdrawModal({ isOpen, onClose, USDC_ADDRESS }: WithdrawModalProps) {
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

  const { address } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: USDC_ADDRESS as `0x${string}`,
  });
  const { data: transaction } = useTransaction({ hash: transactionHash });

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (transaction?.blockHash) {
      setTransactionStatus('success');
      refetchBalance();
    } else if (transaction?.blockHash === null) {
      setTransactionStatus('error');
      setWithdrawError('Transaction failed. Please try again.');
    }
  }, [transaction, refetchBalance]);

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

  const handleClose = () => {
    if (transactionStatus === 'idle' || transactionStatus === 'success') {
      onClose();
      setTransactionStatus('idle');
      setWithdrawError('');
      setWithdrawAddress('');
      setWithdrawAmount('');
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
                  onClick={handleClose}
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
                  onClick={handleClose}
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
                        <li>Withdrawals are processed within 1 minute</li>
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
                onClick={onClose}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={transactionStatus !== 'idle'}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 