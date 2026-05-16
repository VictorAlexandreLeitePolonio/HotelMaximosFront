import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type PasswordInputProps = {
  autoComplete?: string
  name?: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

export function PasswordInput({
  autoComplete,
  name,
  onChange,
  placeholder,
  value,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="password-input-wrap">
      <input
        autoComplete={autoComplete}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={showPassword ? 'text' : 'password'}
        value={value}
      />

      <button
        aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
        className="password-toggle"
        onClick={() => setShowPassword((current) => !current)}
        type="button"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
