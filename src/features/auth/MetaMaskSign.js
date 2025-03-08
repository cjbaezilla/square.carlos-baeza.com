import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

const MetaMaskSign = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [account, setAccount] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  };

  // Generate a message to sign
  const generateMessage = useCallback(() => {
    if (!user) return;
    
    const timestamp = new Date().toISOString();
    const defaultMessage = t('metamaskSign.defaultMessage', 'I, user with Clerk ID {{userId}}, authorize this action at {{timestamp}}', {
      userId: user.id,
      timestamp: timestamp
    });
    setMessage(defaultMessage);
  }, [user, t]);

  // Check for MetaMask on component mount
  useEffect(() => {
    setIsMetaMaskAvailable(isMetaMaskInstalled());
    
    // Generate message once user is loaded, if MetaMask is available
    if (user && isMetaMaskInstalled()) {
      generateMessage();
    }
  }, [user, generateMessage]);

  // Connect to MetaMask
  const connectWallet = async () => {
    setError('');
    setSuccess('');
    
    if (!isMetaMaskInstalled()) {
      setError(t('metamaskSign.errors.notInstalled', 'MetaMask is not installed. Please install MetaMask to continue.'));
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setSuccess(t('metamaskSign.success.connected', 'Wallet connected successfully!'));
      } else {
        setError(t('metamaskSign.errors.noAccounts', 'No accounts found.'));
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || t('metamaskSign.errors.connectionFailed', 'Failed to connect wallet'));
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign message with MetaMask
  const signMessage = async () => {
    setError('');
    setSuccess('');
    setSignature('');
    
    if (!isMetaMaskInstalled()) {
      setError(t('metamaskSign.errors.notInstalled', 'MetaMask is not installed. Please install MetaMask to continue.'));
      return;
    }
    
    if (!account) {
      setError(t('metamaskSign.errors.connectFirst', 'Please connect your wallet first'));
      return;
    }

    if (!message) {
      setError(t('metamaskSign.errors.noMessage', 'Please generate a message to sign'));
      return;
    }

    try {
      setIsSigning(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      setSignature(signature);
      setSuccess(t('metamaskSign.success.signed', 'Message signed successfully!'));

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
      setError(err.message || t('metamaskSign.errors.signingFailed', 'Failed to sign message'));
    } finally {
      setIsSigning(false);
    }
  };

  // Render the MetaMask installation message if MetaMask is not available
  if (!isMetaMaskAvailable) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">{t('metamaskSign.walletRequired')}</h2>
        
        <div className="mb-6 p-4 bg-yellow-800 text-yellow-100 rounded">
          <p className="text-lg font-semibold mb-2">{t('metamaskSign.metamaskNotInstalled')}</p>
          <p className="mb-3">{t('metamaskSign.requiresMetamask')}</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition duration-300"
          >
            {t('metamaskSign.installMetamask')}
          </a>
        </div>
        
        <div className="mt-4 text-gray-400 text-sm">
          <p>{t('metamaskSign.afterInstalling')}</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>{t('metamaskSign.steps.0')}</li>
            <li>{t('metamaskSign.steps.1')}</li>
            <li>{t('metamaskSign.steps.2')}</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">{t('metamaskSign.title')}</h2>
      
      {/* Wallet Connection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('metamaskSign.walletConnection')}</h3>
        {account ? (
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-700 p-3 rounded text-gray-200 break-all">
              <span className="font-semibold">{t('metamaskSign.connectedAccount')}</span> {account}
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition duration-300 disabled:opacity-50"
          >
            {isConnecting ? t('metamaskSign.connecting') : t('metamaskSign.connect')}
          </button>
        )}
      </div>

      {/* Message to Sign */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('metamaskSign.messageToSign')}</h3>
        <div className="flex flex-col space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-24 p-3 bg-gray-700 text-gray-200 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder={t('metamaskSign.messagePlaceholder', 'Enter a message to sign')}
          />
          <button
            onClick={generateMessage}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-300"
          >
            {t('metamaskSign.regenerate')}
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
          {isSigning ? t('metamaskSign.signing') : t('metamaskSign.signButton')}
        </button>
      </div>

      {/* Display Signature */}
      {signature && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('metamaskSign.signature')}</h3>
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
        <p>{t('metamaskSign.information')}</p>
        <p className="mt-2">{t('metamaskSign.verify')}</p>
      </div>
    </div>
  );
};

export default MetaMaskSign; 