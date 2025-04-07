import React from 'react';

export function FAQ() {
  const faqs = [
    {
      question: "How do I know if my ticket is transferable?",
      answer: "Your ticket must be transferable through the official event platform (e.g., Ticketmaster). You should be able to enter the buyer's email address to transfer the ticket. Screenshots, PDFs, or physical tickets are not supported."
    },
    {
      question: "What if I don't receive the ticket?",
      answer: "Your payment is held in a smart contract and only released to the seller after you confirm receiving the ticket. If you don't receive the ticket within 24 hours, the trade is automatically cancelled and your funds are returned."
    },
    {
      question: "Is this legal?",
      answer: "Yes. We facilitate secure peer-to-peer ticket transfers through official platforms. We don't support ticket scalping or bulk reselling."
    },
    {
      question: "How do I get USDC on Base?",
      answer: "You can buy USDC directly through our platform using a credit card, or transfer it from another wallet or exchange. We'll guide you through the process when you're ready to make a purchase."
    },
    {
      question: "Which wallets are supported?",
      answer: "We support all major Ethereum-compatible wallets including MetaMask, WalletConnect, and Coinbase Wallet. We can also create a wallet for you if you're new to crypto."
    },
    {
      question: "Do you store my information?",
      answer: "We only store the minimum information needed to facilitate trades: your email, phone number, and transaction history. We never store your private keys or have access to your funds."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h2>
            <p className="text-gray-500">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}