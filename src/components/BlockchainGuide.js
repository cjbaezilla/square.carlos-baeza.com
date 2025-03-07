import React, { useState } from 'react';

const BlockchainGuide = () => {
  const [activeTopic, setActiveTopic] = useState(null);

  const topics = [
    {
      id: 'metamask',
      title: 'MetaMask',
      content: `
        <h3>What is MetaMask?</h3>
        <p>MetaMask is like a digital wallet app for your web browser or mobile phone. Think of it as a combination of a digital wallet and a special key that lets you access blockchain apps.</p>
        
        <p>Here's what MetaMask does:</p>
        <ul>
          <li>Stores your digital currencies (like Ethereum)</li>
          <li>Connects you to blockchain-based websites and apps</li>
          <li>Acts as your login for blockchain applications (no usernames/passwords needed!)</li>
        </ul>
        
        <p>Just like you might use your Google or Facebook account to log into various websites, MetaMask lets you use your blockchain address to interact with blockchain apps and services.</p>
      `
    },
    {
      id: 'web3',
      title: 'Web3',
      content: `
        <h3>What is Web3?</h3>
        <p>Web3 is the next generation of the internet that's built using blockchain technology. It's designed to be more open, decentralized, and user-controlled than the internet we use today.</p>
        
        <p>Here's how Web3 differs from the current internet:</p>
        <ul>
          <li><strong>Web1 (1990s):</strong> Read-only websites. You could only consume content.</li>
          <li><strong>Web2 (2000s-present):</strong> Interactive websites where you can both read and create content, but large companies control your data and the platforms (like Facebook, Google).</li>
          <li><strong>Web3 (emerging):</strong> An internet where you own your data, digital assets, and content. No single company controls everything, and you can carry your digital identity across different applications.</li>
        </ul>
        
        <p>Web3 applications are often called "dApps" (decentralized applications) because they run on decentralized networks rather than servers owned by a single company.</p>
      `
    },
    {
      id: 'ethereum',
      title: 'Ethereum',
      content: `
        <h3>What is Ethereum?</h3>
        <p>Ethereum is a blockchain platform that works like a global, decentralized computer. While Bitcoin was designed mainly as a digital currency, Ethereum was created to do much more.</p>
        
        <p>Key things to know about Ethereum:</p>
        <ul>
          <li>It has its own cryptocurrency called Ether (ETH), which is used to pay for transactions and services on the network</li>
          <li>It allows developers to build and deploy "smart contracts" — self-executing agreements with the terms directly written into code</li>
          <li>It powers thousands of decentralized applications (dApps) across finance, art, gaming, social media, and more</li>
        </ul>
        
        <p>Think of Ethereum as a platform that enables new kinds of applications where no single entity has control — instead, the rules are enforced by code running across thousands of computers worldwide.</p>
      `
    },
    {
      id: 'evm',
      title: 'EVM (Ethereum Virtual Machine)',
      content: `
        <h3>What is the EVM?</h3>
        <p>The Ethereum Virtual Machine (EVM) is the engine that powers the Ethereum blockchain. It's a special computing environment that runs smart contracts.</p>
        
        <p>To understand the EVM:</p>
        <ul>
          <li>Think of it as a giant, global computer spread across thousands of individual machines</li>
          <li>It executes programs (smart contracts) exactly the same way on every computer in the network</li>
          <li>It ensures that operations are predictable, verifiable, and can't be tampered with</li>
        </ul>
        
        <p>The EVM is important because it creates a consistent environment where applications can run trustlessly — meaning you don't need to trust any single company or person to execute the code correctly, as the entire network verifies it.</p>
      `
    },
    {
      id: 'defi',
      title: 'DeFi (Decentralized Finance)',
      content: `
        <h3>What is DeFi?</h3>
        <p>DeFi, or Decentralized Finance, reimagines financial services using blockchain technology instead of traditional banks and financial institutions.</p>
        
        <p>DeFi applications allow you to:</p>
        <ul>
          <li>Lend your crypto and earn interest</li>
          <li>Borrow crypto by using other crypto as collateral</li>
          <li>Trade cryptocurrencies without an exchange or broker</li>
          <li>Create savings-like accounts with typically higher interest rates than traditional banks</li>
          <li>Buy insurance, derivatives, and other financial products</li>
        </ul>
        
        <p>The key difference is that DeFi operates without middlemen. Instead of a bank approving and processing your transactions, smart contracts (automated code) handle everything based on pre-defined rules. This often means lower fees, faster processing, and access for anyone with an internet connection, regardless of their location or background.</p>
      `
    },
    {
      id: 'nfts',
      title: 'NFTs (Non-Fungible Tokens)',
      content: `
        <h3>What are NFTs?</h3>
        <p>NFTs (Non-Fungible Tokens) are unique digital items with blockchain-managed ownership. Think of them as digital collectibles with built-in proof of authenticity and ownership.</p>
        
        <p>"Non-fungible" simply means that each one is unique and can't be replaced by another identical item. This is different from cryptocurrencies like Bitcoin where each coin is identical to another (fungible).</p>
        
        <p>NFTs can represent:</p>
        <ul>
          <li>Digital art and illustrations</li>
          <li>Music and videos</li>
          <li>Virtual land and items in games</li>
          <li>Tickets to events</li>
          <li>Memberships and access passes</li>
          <li>Even representations of real-world items</li>
        </ul>
        
        <p>When you own an NFT, the blockchain serves as a public record proving you are the owner of that specific digital item. You can keep it, display it, or sell it to someone else. Artists and creators often use NFTs to sell their work directly to fans without needing galleries or other intermediaries.</p>
      `
    }
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Blockchain & Web3 Guide</h2>
      <p className="text-gray-300 mb-6">
        New to blockchain technology? This guide explains key concepts in simple terms to help you 
        understand the world of Web3, cryptocurrencies, and digital assets.
      </p>
      
      <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
            className={`px-3 py-2 rounded text-center transition-colors duration-300 ${
              activeTopic === topic.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {topic.title}
          </button>
        ))}
      </div>
      
      {activeTopic && (
        <div className="mt-6 animate-fadeIn">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div 
              className="text-gray-200 blockchain-guide-content"
              dangerouslySetInnerHTML={{ 
                __html: topics.find(t => t.id === activeTopic).content 
              }}
            />
            
            <button
              onClick={() => setActiveTopic(null)}
              className="mt-4 text-gray-400 hover:text-gray-200 text-sm flex items-center"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
      
      {!activeTopic && (
        <div className="text-gray-300 p-4 bg-gray-700 rounded-lg">
          <p className="text-center">Select a topic above to learn more about it</p>
        </div>
      )}
      
      <div className="mt-6 text-gray-400 text-sm">
        <p>These technologies are constantly evolving! This guide provides basic explanations to help you get started.</p>
      </div>
    </div>
  );
};

export default BlockchainGuide; 