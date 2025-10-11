
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center my-8">
      <div className="w-16 h-16 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
    </div>
  );
};
