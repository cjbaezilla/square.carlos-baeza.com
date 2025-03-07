import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ethers } from 'ethers';

const MetaMaskSign = () => {
  const { user } = useUser();
  const [account, setAccount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    setError('');
    setSuccess('');
    
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setSuccess('Wallet connected successfully!');
      } else {
        setError('No accounts found.');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Generate a message to sign
  const generateMessage = () => {
    if (!user) return;
    
    const timestamp = new Date().toISOString();
    const defaultMessage = `I, user with Clerk ID ${user.id}, authorize this action at ${timestamp}`;
    setMessage(defaultMessage);
  };

  // Sign message with MetaMask
  const signMessage = async () => {
    setError('');
    setSuccess('');
    setSignature('');
    
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!message) {
      setError('Please generate a message to sign');
      return;
    }

    try {
      setIsSigning(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      setSignature(signature);
      setSuccess('Message signed successfully!');

      // Here you could send the signature to your backend for verification
      // or store it in Clerk user metadata
      
      if (user) {
        try {
          // Example of storing the signature in Clerk user metadata
          // This is optional and depends on your use case
          await user.update({
            publicMetadata: {
              ethAddress: account,
              lastSignature: signature,
              lastSignedMessage: message,
              lastSignedAt: new Date().toISOString()
            }
          });
        } catch (metadataErr) {
          console.error('Error updating Clerk metadata:', metadataErr);
          // Don't fail the overall process if metadata update fails
        }
      }
    } catch (err) {
      console.error('Error signing message:', err);
      setError(err.message || 'Failed to sign message');
    } finally {
      setIsSigning(false);
    }
  };

  // Generate message when user is available
  useEffect(() => {
    if (user) {
      generateMessage();
    }
  }, [user]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Sign Message with MetaMask</h2>
      
      {/* Wallet Connection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Wallet Connection</h3>
        {account ? (
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-700 p-3 rounded text-gray-200 break-all">
              <span className="font-semibold">Connected Account:</span> {account}
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition duration-300 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        )}
      </div>

      {/* Message to Sign */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Message to Sign</h3>
        <div className="flex flex-col space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-24 p-3 bg-gray-700 text-gray-200 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter a message to sign"
          />
          <button
            onClick={generateMessage}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-300"
          >
            Regenerate Default Message
          </button>
        </div>
      </div>

      {/* Sign Button */}
      <div className="mb-6">
        <button
          onClick={signMessage}
          disabled={!account || !message || isSigning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300 disabled:opacity-50 w-full"
        >
          {isSigning ? 'Signing...' : 'Sign Message with MetaMask'}
        </button>
      </div>

      {/* Display Signature */}
      {signature && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Signature</h3>
          <div className="bg-gray-700 p-3 rounded text-gray-200 break-all">
            {signature}
          </div>
        </div>
      )}
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-800 text-red-100 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-800 text-green-100 rounded">
          {success}
        </div>
      )}
      
      {/* Information */}
      <div className="mt-6 text-gray-400 text-sm">
        <p>This feature allows you to sign messages with your Ethereum wallet via MetaMask.</p>
        <p className="mt-2">The signature can be used to verify your ownership of the connected wallet address.</p>
      </div>
    </div>
  );
};

export default MetaMaskSign; 