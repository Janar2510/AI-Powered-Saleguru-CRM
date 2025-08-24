import React from 'react';

export default function Documents() {
  // Temporarily simplified to debug white screen
  return (
    <div className="h-full flex flex-col p-6 gap-6 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#a259ff]/20 to-[#8040c0]/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-r from-[#1a1a2e]/80 to-[#16213e]/80 backdrop-blur-sm border border-[#2d014d]/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#a259ff] to-[#8040c0] bg-clip-text text-transparent">
                Documents
              </h1>
              <p className="text-[#b0b0d0] mt-1">Manage your contracts, proposals, and files</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-white">
        <p>Documents page is loading...</p>
        <p className="text-[#b0b0d0]">This is a temporary simplified version for debugging</p>
      </div>
    </div>
  );
}

