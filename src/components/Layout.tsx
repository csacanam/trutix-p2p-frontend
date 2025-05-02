import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, LogOut } from 'lucide-react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { cbWalletConnector } from '../wagmi';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname === '/faq';
  const { connect } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const handleLogout = () => {
    disconnect();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="flex items-center gap-2">
                  <Ticket className="h-8 w-8 text-blue-600 transform -rotate-12" />
                  <span className="text-xl font-bold text-gray-900">Trutix</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {!address ? (
                <>
                  <button
                    onClick={() => connect({ connector: cbWalletConnector })}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => connect({ connector: cbWalletConnector })}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}