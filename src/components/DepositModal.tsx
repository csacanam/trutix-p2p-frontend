import React, { useState } from 'react';
import { X, Wallet, Copy, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAccount } from 'wagmi';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { address } = useAccount();

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
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
                {address ? (
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG
                      value={address}
                      size={128}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center bg-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500 text-center">Please connect your wallet to see QR code</p>
                  </div>
                )}
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
              onClick={onClose}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 