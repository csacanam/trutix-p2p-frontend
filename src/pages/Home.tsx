import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, DollarSign, CheckCircle2, Wallet, Ticket, Mail, Phone, CreditCard, UserCheck } from 'lucide-react';

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
              Buy and sell event tickets directly using USDC. Smart contracts hold the money until the ticket is delivered.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="w-full sm:w-auto">
                <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Start a Secure Trade
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto">
                <Link to="/faq" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
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
            <h2 className="text-3xl font-extrabold text-gray-900">What is Trutix P2P?</h2>
            <p className="mt-4 text-lg text-gray-500">
              Trutix P2P lets two people trade event tickets safely without needing to trust each other.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Create Trade</h3>
                <p className="mt-2 text-base text-gray-500">Seller creates a trade and sets the price</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Payment</h3>
                <p className="mt-2 text-base text-gray-500">Buyer deposits USDC into smart contract</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Transfer</h3>
                <p className="mt-2 text-base text-gray-500">Seller transfers ticket via official platform</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Complete</h3>
                <p className="mt-2 text-base text-gray-500">Smart contract releases payment to seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Trutix Section with Gradient */}
      <div className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why use Trutix instead of StubHub or DMs?</h2>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Lower Fees</h3>
                <p className="mt-2 text-base text-gray-500">We only charge 10% total (5% buyer, 5% seller) compared to StubHub's 20-30%</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Instant Payouts</h3>
                <p className="mt-2 text-base text-gray-500">Get paid instantly after ticket transfer confirmation, not days later</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Scam Protection</h3>
                <p className="mt-2 text-base text-gray-500">Smart contracts ensure secure transactions with verified platform transfers only</p>
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
            <h2 className="text-3xl font-extrabold text-gray-900">When to Use Trutix</h2>
            <p className="mt-4 text-lg text-gray-500">
              Perfect for these common scenarios:
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Can't Attend an Event</h3>
                <p className="mt-2 text-base text-gray-500">Securely sell your ticket to someone who can make it</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Found a Buyer/Seller</h3>
                <p className="mt-2 text-base text-gray-500">Trade safely with someone from Facebook Groups, WhatsApp, or Reddit</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-500">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Avoid Scams & Fees</h3>
                <p className="mt-2 text-base text-gray-500">Skip high platform fees and protect yourself from scams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You Need Section with Offset Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">What You Need to Trade</h2>
            <p className="mt-4 text-lg text-gray-500">
              Getting started is easy. Here's everything you need:
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Ticket className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Transferable Ticket</h3>
                <p className="mt-2 text-base text-gray-500">Must be transferable through supported platforms (we'll guide you)</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Email Address</h3>
                <p className="mt-2 text-base text-gray-500">For account creation and ticket transfer</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Phone Number</h3>
                <p className="mt-2 text-base text-gray-500">For secure verification and updates</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">USDC</h3>
                <p className="mt-2 text-base text-gray-500">We'll help you get USDC for the transaction</p>
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
              Trade tickets directly. No middlemen. No trust needed.
            </h2>
            <div className="mt-8 flex justify-center">
              <div className="w-full sm:w-auto">
                <Link to="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50">
                  Start Trading Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="mt-0 sm:mt-0 sm:ml-3 w-full sm:w-auto">
                <Link to="/faq" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-md text-white hover:bg-blue-700">
                  Read FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}