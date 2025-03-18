import React, { useState } from 'react';
import { IoAdd, IoRemove } from 'react-icons/io5';
import { IoChevronBack } from 'react-icons/io5';
import { Link } from 'react-router-dom';

// FAQ data structure
interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I register as a member?',
    answer: 'Connect your wallet to the platform via Metamask and fill in your username (required), email (required), and phone number (required). Once your profile is complete, you can pay the initial 115 USDT fee (100 USDT membership + 15 USDT service fee) to become a Level 1 member.'
  },
  {
    question: 'Is there a fee for level upgrades?',
    answer: 'Yes, each level has its own upgrade fee. Additionally, 20% of each upgrade fee goes to the company wallet as an administrative fee, while 80% goes to the eligible upline in your network.'
  },
  {
    question: 'How do I earn rewards through referrals?',
    answer: 'You earn rewards when people in your downline upgrade to levels you have already purchased. For example, as a Level 3 member, you earn when people in your Tier 3 network upgrade to Level 3. To maximize earnings, upgrade to higher levels before your network grows.'
  },
  {
    question: 'How do I upgrade my membership level?',
    answer: (
      <div>
        The upgrade process is as follows:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Level 1 Member: Pay 100 USDT + 15 USDT service fee</li>
          <li>Level 2 Member: Refer at least 3 Level 1 members and pay 150 USDT</li>
          <li>Level 3 Member: Pay 200 USDT (requires Level 2)</li>
          <li>Each subsequent level increases by 50 USDT (Level 4: 250 USDT, Level 5: 300 USDT, etc.)</li>
          <li>Maximum level is Level 19: 1,000 USDT</li>
        </ul>
        <p className="mt-2">You must purchase levels sequentially (can't skip levels) and membership levels never expire once purchased.</p>
      </div>
    )
  },
  {
    question: 'What is the Matrix Marketing System?',
    answer: 'Xclera Matrix Marketing System is a decentralized multi-level membership structure that operates on blockchain technology. Members earn rewards by recruiting others and upgrading their own membership levels. The system uses smart contracts to automatically distribute rewards, ensuring complete transparency through the blockchain.'
  },
  {
    question: 'How much does it cost to participate in Xclera?',
    answer: (
      <div>
        <p>The initial registration costs 115 USDT:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>100 USDT for basic Level 1 membership</li>
          <li>15 USDT for system service fee</li>
        </ul>
        <p className="mt-2">Additionally, you should have approximately 5 USDT in BNB for gas fees to process the transaction on the Binance Smart Chain.</p>
      </div>
    )
  },
  {
    question: 'What do I need to get started with Xclera?',
    answer: (
      <div>
        Follow these steps:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Register: Connect your wallet via WalletConnect</li>
          <li>Complete Profile: Fill in your username, email, and phone number</li>
          <li>Get Invitation: You must receive an invitation link from an existing member</li>
          <li>Pay Initial Fee: Submit 115 USDT to become a Level 1 member</li>
          <li>Begin Referring: Generate and share your invitation link</li>
        </ul>
      </div>
    )
  },
  {
    question: 'How does the reward distribution work?',
    answer: (
      <div>
        <p>Rewards are distributed based on your level and the activity in your network:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Direct Referrals: When you recruit someone who pays 100 USDT, you receive 100 USDT</li>
          <li>Level Upgrades: You earn rewards when people in your downline upgrade to levels you have already purchased</li>
          <li>Deeper Tiers: Higher membership levels provide access to earnings from deeper tiers in your network</li>
          <li>Fee Distribution: For each upgrade, 80% of the fee goes to the eligible upline, 20% goes to the company wallet</li>
        </ul>
      </div>
    )
  },
  {
    question: 'Why is Xclera secure?',
    answer: (
      <div>
        Xclera ensures security through:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Blockchain Technology: Operates on the Binance Smart Chain (BSC)</li>
          <li>Smart Contracts: Automatic transaction execution with transparency and immutability</li>
          <li>100% Distribution: No capital pool, with complete transparency through smart contracts</li>
          <li>Decentralization: All transactions are executed on-chain, making the system resistant to tampering</li>
        </ul>
      </div>
    )
  },
  {
    question: "What happens if there's no eligible upline for my upgrade?",
    answer: 'If no eligible upline is found at the appropriate level, the reward (80% of your upgrade fee) will be sent to the company wallet instead.'
  },
  {
    question: 'Can I skip levels?',
    answer: 'No, you must purchase levels sequentially. For example, you must be a Level 2 member before upgrading to Level 3.'
  },
  {
    question: 'Do membership levels expire?',
    answer: 'No, membership levels never expire once purchased. This is a one-time payment for permanent membership at that level.'
  }
];

const FAQItem: React.FC<{ item: FAQItem, isOpen: boolean, toggleOpen: () => void }> = ({ item, isOpen, toggleOpen }) => {
  return (
    <div className="border-b border-gray-700">
      <div 
        className="flex justify-between items-center py-4 cursor-pointer" 
        onClick={toggleOpen}
      >
        <h3 className="text-white text-left">{item.question}</h3>
        <div className="text-white">
          {isOpen ? <IoRemove size={20} /> : <IoAdd size={20} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="text-gray-400 pb-4 text-left">
          {item.answer}
        </div>
      )}
    </div>
  );
};

function FAQ() {
  // Track which FAQ item is currently open
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item is open by default

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null); // Close if already open
    } else {
      setOpenIndex(index); // Open the clicked item
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link to="/user/dashboard" className="text-white">
            <IoChevronBack size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-center flex-grow">FAQ</h1>
          <div className="w-6"></div> {/* Empty div for proper centering */}
        </div>

        {/* FAQ Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know.</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-1">
          {faqData.map((item, index) => (
            <FAQItem 
              key={index} 
              item={item} 
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQ;