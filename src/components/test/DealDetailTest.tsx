import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useDealData } from '../../hooks/useDealData';
import { useDealActions } from '../../hooks/useDealActions';

interface Deal {
  id: string;
  title: string;
  value: number;
}

const DealDetailTest: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Use our hooks
  const dealData = useDealData(selectedDealId);
  const dealActions = useDealActions(selectedDealId);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      // Try different possible column combinations
      let query = supabase.from('deals');
      
      // Try to select common columns, fallback if they don't exist
      const { data, error } = await query
        .select('id, title, value')
        .limit(10);

      if (error) {
        console.error('Error loading deals:', error);
        console.log('This might be normal if the deals table has a different structure');
        setDeals([]);
      } else {
        const processedData = (data || []).map(deal => ({
          id: deal.id,
          title: deal.title || 'Untitled Deal',
          value: deal.value || 0
        }));
        
        setDeals(processedData);
        
        // Auto-select first deal
        if (processedData.length > 0) {
          setSelectedDealId(processedData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading deals:', error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const testAddNote = async () => {
    if (!selectedDealId) return;
    
    try {
      await dealActions.addNote(
        'Test Note from React',
        'This note was added using the useDealActions hook!'
      );
      console.log('✅ Note added successfully!');
    } catch (error) {
      console.error('❌ Error adding note:', error);
    }
  };

  const testAddFile = async () => {
    if (!selectedDealId) return;
    
    try {
      await dealActions.uploadFile(
        'test-document.pdf',
        'application/pdf',
        1024,
        'https://example.com/test.pdf',
        'documents',
        'Test document uploaded via React hook'
      );
      console.log('✅ File added successfully!');
    } catch (error) {
      console.error('❌ Error adding file:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading deals...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🧪 Deal Detail System Test
      </h1>

      {/* Deal Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Deal to Test:
        </label>
        {deals.length > 0 ? (
          <select
            value={selectedDealId}
            onChange={(e) => setSelectedDealId(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">Select a deal...</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title} - ${deal.value.toLocaleString()}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium">No deals found in deals table!</p>
              <p className="text-yellow-700 text-sm mt-1">
                But don't worry - you can still test the Deal Detail system.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 font-medium">Testing Instructions:</p>
              <ol className="text-blue-700 text-sm mt-2 space-y-1">
                <li>1. Run this script in Supabase Studio SQL Editor:</li>
                <li className="ml-4">
                  <code className="bg-blue-100 px-1 rounded">scripts/test-deal-detail-standalone.sql</code>
                </li>
                <li>2. Then manually enter a Deal ID below to test the hooks</li>
              </ol>
            </div>
            
            <div className="p-4 border rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manual Deal ID Entry (for testing):
              </label>
              <input
                type="text"
                placeholder="Enter a deal UUID to test with..."
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                After running the test script, check the console output for the generated Deal ID
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedDealId && (
        <>
          {/* Deal Data Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Deal Data Hook Status:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Loading:</strong> {dealData.isLoading ? '🔄 Yes' : '✅ No'}
              </div>
              <div>
                <strong>Error:</strong> {dealData.error ? '❌ Yes' : '✅ No'}
              </div>
              <div>
                <strong>Activities:</strong> {dealData.activities?.length || 0}
              </div>
              <div>
                <strong>Files:</strong> {dealData.files?.length || 0}
              </div>
              <div>
                <strong>Changelog:</strong> {dealData.changelog?.length || 0}
              </div>
              <div>
                <strong>Quotes:</strong> {dealData.quotes?.length || 0}
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Test Deal Actions:</h3>
            <div className="flex gap-3">
              <button
                onClick={testAddNote}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Test Note
              </button>
              <button
                onClick={testAddFile}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add Test File
              </button>
            </div>
          </div>

          {/* Activities Display */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Recent Activities:</h3>
            <div className="space-y-2">
              {dealData.activities?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-gray-600">{activity.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activity.type} • {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              {(!dealData.activities || dealData.activities.length === 0) && (
                <div className="text-gray-500 italic">No activities yet</div>
              )}
            </div>
          </div>

          {/* Files Display */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Files:</h3>
            <div className="space-y-2">
              {dealData.files?.slice(0, 3).map((file) => (
                <div key={file.id} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-gray-600">{file.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {file.type} • {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
              {(!dealData.files || dealData.files.length === 0) && (
                <div className="text-gray-500 italic">No files yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Select a deal from the dropdown</li>
          <li>2. Check that the hook status shows data loading</li>
          <li>3. Click "Add Test Note" and check console</li>
          <li>4. Click "Add Test File" and check console</li>
          <li>5. Refresh to see new activities appear</li>
        </ol>
      </div>
    </div>
  );
};

export default DealDetailTest;
