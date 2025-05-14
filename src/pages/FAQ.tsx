import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to home link */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to home
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>

      <div className="space-y-12">
        {/* Getting Started Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🆕 Getting Started</h2>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What if I'm new to all this?</h3>
            <p className="text-gray-600">
              That's totally fine — Trutix is built for regular people.
              You don't need to know anything about crypto. We guide you step by step, and the app creates everything you need automatically.
            </p>
          </div>
        </section>

        {/* Tickets Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎟 Tickets</h2>
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">How do I know if my ticket can be transferred?</h3>
              <p className="text-gray-600">
                Your ticket must be transferable through the official platform where you bought it (for example, Ticketmaster).
                If the platform allows you to enter someone else's email to transfer the ticket, then it's compatible.
                Screenshots, PDFs, or printed tickets are not supported.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What if I don't receive the ticket?</h3>
              <p className="text-gray-600">
              Once the seller marks the ticket as sent, you have 12 hours to confirm that you received it or report a problem.
              If you don’t take any action during that time, the payment is automatically released to the seller.
              If there’s an issue, you can open a dispute and we’ll help resolve it.
              </p>
            </div>
          </div>
        </section>

        {/* Payments Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💵 Payments</h2>
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">How do I pay for a ticket?</h3>
              <p className="text-gray-600">
              First, you’ll need to add funds to your Trutix account using USDC, a digital version of the US dollar.
              To do that, you simply send USDC from an exchange like Binance or Coinbase to your Trutix wallet (we’ll guide you step by step).

              Once your account is funded, paying for a ticket is instant — just a few clicks.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Do I need a crypto wallet?</h3>
              <p className="text-gray-600">
                No. Trutix automatically creates a secure wallet for you — no setup needed.
              </p>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔐 Trust & Safety</h2>
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Is it safe to pay here?</h3>
              <p className="text-gray-600">
                Yes. Your money is protected in an automated escrow system.
                It's only released after both sides complete the trade.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Do you store my information?</h3>
              <p className="text-gray-600">
                We only store the minimum needed to process trades — like your email, phone number, and transaction history.
                We never have access to your funds or private keys.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}