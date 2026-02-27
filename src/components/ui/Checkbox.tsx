import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = React.memo(({ label, error, className = '', ...props }: CheckboxProps) => {
  return (
    <div className="mb-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={`
            h-4 w-4 text-blue-600 rounded border-gray-300
            focus:ring-blue-500
            ${className}
          `}
          {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';