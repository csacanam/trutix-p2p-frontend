import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, DollarSign, CheckCircle2, Wallet as WalletIcon, Ticket, Mail, Phone, CreditCard, UserCheck } from 'lucide-react';
import { Wallet } from '@coinbase/onchainkit/wallet';

export function Home() {
  return (
    <>
 
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Trustless P2P</span>
              <span className="block text-blue-600">Ticket Trading</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Buy and sell tickets safely — no middlemen, no scams
              Your money is held securely and only released once the ticket is received.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link to="/dashboard" className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Start Trading
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/faq" className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What is Trutix Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">🤝 What is Trutix P2P?</h2>
            <div className="mt-4 space-y-2">
            <p className="text-lg text-gray-500">
              Trutix P2P lets two people trade event tickets safely — no need to trust each other.
            </p>
            <p className="text-lg text-gray-500">
              We use secure technology to hold the payment until the ticket is transferred.
            </p>
            <p className="text-lg text-gray-500">
              That means no scams, no overpriced platforms, and no stress.
            </p>
          </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Create Trade</h3>
                <p className="mt-2 text-base text-gray-500">The seller sets the price and creates the trade.</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <WalletIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Safe Payment</h3>
                <p className="mt-2 text-base text-gray-500">The buyer deposits money into a secure system that holds it.</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Transfer the Ticket</h3>
                <p className="mt-2 text-base text-gray-500">The seller sends the ticket through the official platform (Ticketmaster, etc.).</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Payment Released </h3>
                <p className="mt-2 text-base text-gray-500">Once confirmed, the seller gets paid instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Trutix Section with Gradient */}
      <div className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">💡 Why use Trutix instead of StubHub or Group Chats?</h2>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Lower Fees</h3>
                <p className="mt-2 text-base text-gray-500">Just 10% total (5% buyer, 5% seller), compared to 20–30% on other platforms</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Instant Payouts</h3>
                <p className="mt-2 text-base text-gray-500">Sellers get paid right after they transfer the ticket — no waiting.</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">No Scams</h3>
                <p className="mt-2 text-base text-gray-500">Funds are only released when both sides complete their part.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* When to Use Section with Pattern */}
      <div className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 opacity-25"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900"> 🎯 When Should You Use Trutix?</h2>
      
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Can’t Make It to an Event?</h3>
                <p className="mt-2 text-base text-gray-500">Sell your ticket securely to someone who can go.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Found a Buyer or Seller Online?</h3>
                <p className="mt-2 text-base text-gray-500">Trade safely with someone from Reddit, Facebook, or WhatsApp.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Want to Avoid Scams or High Fees?</h3>
                <p className="mt-2 text-base text-gray-500">Skip risky chats and overpriced platforms.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You Need Section with Offset Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">🧾 What You Need to Trade</h2>
    
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">A Transferable Ticket</h3>
                <p className="mt-2 text-base text-gray-500">(We support official platforms like Ticketmaster. We’ll guide you.)</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Email Address</h3>
                <p className="mt-2 text-base text-gray-500">To create your account and get updates.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Phone Number</h3>
                <p className="mt-2 text-base text-gray-500">For verification and notifications.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Digital Dollars</h3>
                <p className="mt-2 text-base text-gray-500">We use a stable digital currency equal to USD. Don’t worry — we’ll help you get it in minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA with Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">
            Swap tickets safely, instantly, and on your own terms — without middlemen.
            </h2>
            <div className="mt-8 flex justify-center">
              <div className="w-full sm:w-auto">
                <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50">
                  Start Trading
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-0 sm:mt-0 sm:ml-3 w-full sm:w-auto">
                <Link to="/faq" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-md text-white hover:bg-blue-700">
                🔍 Read the FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}