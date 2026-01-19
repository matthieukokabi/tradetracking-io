import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TradeForm from '../TradeForm'
import { api } from '../../lib/api'
import { TradeSide, TradeStatus } from '../../types'

// Mock the API
jest.mock('../../lib/api', () => ({
  api: {
    createTrade: jest.fn(),
    updateTrade: jest.fn(),
  },
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('TradeForm', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly for adding a new trade', () => {
    render(<TradeForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    expect(screen.getByText('Add Trade')).toBeInTheDocument()
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/side/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument()
  })

  it('submits form with correct data for new trade', async () => {
    (api.createTrade as jest.Mock).mockResolvedValue({})

    render(<TradeForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    fireEvent.change(screen.getByLabelText(/symbol/i), { target: { value: 'BTC/USD' } })
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '1.5' } })
    fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '50000' } })
    // Date input is tricky, skipping detailed date validation for this basic test

    fireEvent.click(screen.getByRole('button', { name: /add trade/i }))

    await waitFor(() => {
      expect(api.createTrade).toHaveBeenCalledWith(expect.objectContaining({
        symbol: 'BTC/USD',
        quantity: 1.5,
        entry_price: 50000,
        status: TradeStatus.OPEN
      }))
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('calculates P&L correctly', async () => {
    render(<TradeForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

    // Select Closed to show exit fields
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: TradeStatus.CLOSED } })

    fireEvent.change(screen.getByLabelText(/side/i), { target: { value: TradeSide.BUY } })
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/entry price/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/exit price/i), { target: { value: '110' } })

    // P&L should be (110 - 100) * 1 = 10
    expect(screen.getByLabelText(/p&l/i)).toHaveValue(10)
  })
})
