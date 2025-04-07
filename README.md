# Trutix - P2P Ticket Trading Platform

Trutix is a decentralized peer-to-peer ticket trading platform that enables secure and trustless transactions between buyers and sellers using USDC on the Base network.

## Features

- **Secure P2P Trading**: Trade tickets directly with other users without intermediaries
- **Smart Contract Escrow**: Payments are held in escrow until tickets are successfully transferred
- **Official Platform Integration**: Only supports transferable tickets from official platforms (e.g., Ticketmaster)
- **USDC Payments**: All transactions are conducted in USDC on the Base network
- **Low Fees**: Only 10% total fee (5% buyer, 5% seller) compared to 20-30% on traditional platforms
- **Instant Payouts**: Sellers receive funds immediately after ticket transfer confirmation

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/csacanam/trutix-p2p-frontend.git
cd trutix-p2p-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components and routes
├── App.tsx           # Main application component
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## Key Components

### Pages

- **Home**: Landing page with feature overview
- **Dashboard**: User's trades and wallet management
- **CreateTrade**: Multi-step form for creating new trades
- **TradeDetail**: Detailed view of a trade with status updates
- **FAQ**: Frequently asked questions and help

### Features

1. **Trade Creation**

   - Multi-step form with validation
   - Event details input
   - Price setting
   - Buyer information collection

2. **Trade Management**

   - Status tracking
   - Ticket transfer instructions
   - Payment confirmation
   - Trade completion flow

3. **Wallet Integration**
   - USDC deposits and withdrawals
   - Balance tracking
   - Transaction history

## Security Features

- Smart contract escrow for payments
- Official platform ticket transfer verification
- 24-hour transfer window requirement
- Automatic refunds for failed transfers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please email camilo@trutix.io
