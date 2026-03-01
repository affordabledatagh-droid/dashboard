# DataLink Admin Dashboard

A comprehensive admin dashboard for the DataLink platform built with Next.js 16, TypeScript, and React 19.

## Features

### Dashboard Overview
- Real-time statistics (Total Revenue, Active Agents, Purchases, Pending Withdrawals)
- Trend indicators for key metrics
- Recent activity feed
- Responsive stat cards

### Agents Management
- View all agents with detailed information
- Search and filter agents
- Sort by various metrics
- Export to CSV
- Agent actions (View, Edit, Suspend)
- Total sales and wallet balance tracking

### Data Purchases
- Comprehensive purchase history
- Network-specific badges (MTN, Telecel, AirtelTigo)
- Status indicators (Success, Pending, Failed)
- Search and filter functionality
- Export to CSV with all transaction details
- Agent profit tracking

### Packages Management
- Manage data packages by network
- Add, edit, and delete packages
- Set base prices and agent profit margins
- Enable/disable packages
- Network filtering tabs

### Withdrawals Management
- View all withdrawal requests
- Approve/reject pending withdrawals
- Status tracking (Pending, Completed, Failed)
- Payment method information
- Total pending amount calculation

### Analytics & Reports (Coming Soon)
- Revenue analytics
- Agent performance metrics
- Network usage statistics
- Custom report generation

### Settings (Coming Soon)
- Platform configuration
- Commission rates
- Payment gateway settings
- System preferences

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19
- **Styling**: Inline styles with CSS-in-JS patterns
- **Icons**: react-icons (Heroicons 2)
- **State Management**: React Context API

## Design System

### Color Palette
```typescript
COLORS = {
  bg: '#0f1013',        // Main background
  surface: '#16181d',   // Cards/surfaces
  border: '#1f2229',    // Borders
  blue: '#0066ff',      // Primary actions
  blueLight: '#3385ff', // Hover states
  yellow: '#f5c400',    // MTN/warnings
  red: '#f53232',       // Errors/Telecel
  white: '#ffffff',     // Primary text
  muted: '#9499aa',     // Secondary text
  faint: '#3a3f4a',     // Subtle backgrounds
}
```

### Network Colors
- **MTN**: Yellow (#f5c400) with black text
- **Telecel**: Red (#f53232) with white text
- **AirtelTigo**: Red/Blue gradient

## Project Structure

```
app/
├── admin/
│   ├── layout.tsx          # Admin layout with navbar
│   ├── page.tsx            # Dashboard overview
│   ├── agents/
│   │   └── page.tsx        # Agents management
│   ├── purchases/
│   │   └── page.tsx        # Purchases list
│   ├── packages/
│   │   └── page.tsx        # Packages management
│   ├── withdrawals/
│   │   └── page.tsx        # Withdrawals management
│   ├── analytics/
│   │   └── page.tsx        # Analytics (placeholder)
│   └── settings/
│       └── page.tsx        # Settings (placeholder)
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
└── globals.css             # Global styles

components/
└── admin/
    ├── AdminNavbar.tsx     # Navigation bar
    ├── StatCard.tsx        # Statistics card component
    ├── DataTable.tsx       # Reusable data table
    └── ExportButton.tsx    # CSV export button

lib/
├── context/
│   └── AdminContext.tsx    # Admin authentication context
├── types/
│   └── admin.ts            # TypeScript interfaces
└── constants/
    └── colors.ts           # Color constants
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Components

### AdminContext
Manages admin authentication state and provides login/logout functionality.

### DataTable
Reusable table component with:
- Search functionality
- Sorting
- Pagination
- Responsive design (table on desktop, cards on mobile)
- Customizable columns with render functions

### StatCard
Displays key metrics with:
- Label and value
- Custom accent colors
- Optional icons
- Trend indicators (up/down percentages)

### ExportButton
Exports data to CSV format with:
- Custom column selection
- Automatic date stamping
- Proper CSV formatting

## Responsive Design

All components use `clamp()` for responsive sizing:
- Font sizes: `clamp(min, preferred, max)`
- Padding/margins: Fluid spacing
- Grid layouts: `repeat(auto-fill, minmax(min(100%, Xpx), 1fr))`
- Mobile breakpoint: 768px

Mobile-specific features:
- Hamburger menu navigation
- Card-based layouts instead of tables
- Touch-friendly buttons (min 44px)
- Stacked layouts

## API Integration

The dashboard is currently using mock data. To integrate with a real backend:

1. Replace mock data in each page with actual API calls
2. Implement API endpoints as specified in the prompt
3. Add error handling and loading states
4. Implement authentication middleware

### Required API Endpoints

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/profile` - Get admin profile
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/agents` - List agents
- `GET /api/admin/purchases` - List purchases
- `GET /api/admin/packages` - List packages
- `GET /api/admin/withdrawals` - List withdrawals
- `POST /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `POST /api/admin/withdrawals/:id/reject` - Reject withdrawal

## Security Considerations

- JWT authentication with httpOnly cookies
- Role-based access control
- Input validation and sanitization
- HTTPS enforcement
- Rate limiting
- Audit logging for admin actions
- Session management with auto-logout

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Advanced analytics with charts
- [ ] Bulk operations for agents and packages
- [ ] Email/SMS notification settings
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Advanced filtering and search
- [ ] Role-based permissions (Super Admin, Manager, Support)
- [ ] Audit log viewer
- [ ] Custom report builder

## License

This project is proprietary and confidential.
