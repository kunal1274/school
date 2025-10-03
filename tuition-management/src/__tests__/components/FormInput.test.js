import { render, screen, fireEvent } from '@testing-library/react'
import FormInput from '@/components/forms/FormInput'

describe('FormInput', () => {
  it('renders with label and input', () => {
    render(
      <FormInput
        label="Test Label"
        name="test"
        type="text"
        value=""
        onChange={() => {}}
      />
    )
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(
      <FormInput
        label="Test Label"
        name="test"
        type="text"
        value=""
        onChange={() => {}}
        error="This is an error"
      />
    )
    
    expect(screen.getByText('This is an error')).toBeInTheDocument()
  })

  it('calls onChange when input value changes', () => {
    const handleChange = jest.fn()
    render(
      <FormInput
        label="Test Label"
        name="test"
        type="text"
        value=""
        onChange={handleChange}
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('applies required attribute when required prop is true', () => {
    render(
      <FormInput
        label="Test Label"
        name="test"
        type="text"
        value=""
        onChange={() => {}}
        required
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(input).toBeRequired()
  })
})
