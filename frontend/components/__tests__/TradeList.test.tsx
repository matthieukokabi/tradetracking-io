import { render, screen, waitFor } from '@testing-library/react'
import TradeList from '../TradeList'
import { api } from '../../lib/api'
import { TradeSide, TradeStatus } from '../../types'

// Mock the API
jest.mock('../../lib/api', () => ({
  api: {
    getTrades: jest.fn(),
    deleteTrade: jest.fn(),
  },
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: jest.fn(),
}))

const mockTrades = [
  {
    _id: '1',
    user_id: 'user1',
    symbol: 'BTC/USD',
    side: TradeSide.BUY,
    quantity: 1,
    entry_price: 50000,
    entry_time: '2024-01-01T10:00:00.000Z',
    status: TradeStatus.OPEN,
  },
  {
    _id: '2',
    user_id: 'user1',
    symbol: 'ETH/USD',
    side: TradeSide.SELL,
    quantity: 10,
    entry_price: 3000,
    entry_time: '2024-01-02T10:00:00.000Z',
    status: TradeStatus.CLOSED,
    exit_price: 2900,
    pnl: 1000,
  },
]

describe('TradeList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    (api.getTrades as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<TradeList />)
    expect(screen.getByText(/loading trades/i)).toBeInTheDocument()
  })

  it('renders trades list after loading', async () => {
    (api.getTrades as jest.Mock).mockResolvedValue(mockTrades)
    render(<TradeList />)

    await waitFor(() => {
      expect(screen.getByText('BTC/USD')).toBeInTheDocument()
      expect(screen.getByText('ETH/USD')).toBeInTheDocument()
    })

    expect(screen.getByText('$50000.00')).toBeInTheDocument()
    expect(screen.getByText('+$1000.00')).toBeInTheDocument()
  })

  it('renders empty state when no trades found', async () => {
    (api.getTrades as jest.Mock).mockResolvedValue([])
    render(<TradeList />)

    await waitFor(() => {
      expect(screen.getByText(/no trades found/i)).toBeInTheDocument()
    })
  })
})
