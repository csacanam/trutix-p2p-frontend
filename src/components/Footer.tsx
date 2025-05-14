import React from 'react';
import { Twitter, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Trutix P2P – Trustless P2P Ticket Trading
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Follow us:</span>
            <div className="flex items-center space-x-6">
              <a
                href="https://x.com/trutixp2p"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span className="sr-only">X (Twitter)</span>
              </a>
              <a
                href="https://t.me/trutixp2p"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <Send className="w-5 h-5" />
                <span className="sr-only">Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 