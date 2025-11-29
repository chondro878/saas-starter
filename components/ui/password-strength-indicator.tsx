'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidityChange?: (isValid: boolean) => void;
}

export function PasswordStrengthIndicator({ 
  password, 
  onValidityChange 
}: PasswordStrengthIndicatorProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
      met: false
    },
    {
      label: 'Lower case letters (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
      met: false
    },
    {
      label: 'Upper case letters (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: false
    },
    {
      label: 'Numbers (0-9)',
      test: (pwd) => /[0-9]/.test(pwd),
      met: false
    }
  ]);

  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.test(password)
    }));
    
    setRequirements(updatedRequirements);
    
    const allMet = updatedRequirements.every(req => req.met);
    if (onValidityChange) {
      onValidityChange(allMet);
    }
  }, [password, onValidityChange]);

  // Only show if user has started typing
  if (password.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-gray-600">Password must include:</p>
      <ul className="space-y-1.5">
        {requirements.map((req, index) => (
          <li 
            key={index} 
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span className={req.met ? 'font-medium' : ''}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Utility function to validate password
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

