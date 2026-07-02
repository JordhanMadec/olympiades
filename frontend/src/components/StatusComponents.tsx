import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{message}</div>
);

export const EmptyState: React.FC<{ message: string; action?: React.ReactNode }> = ({
  message,
  action,
}) => (
  <div className="text-center py-16 text-gray-400">
    <p className="text-lg mb-4">{message}</p>
    {action}
  </div>
);
