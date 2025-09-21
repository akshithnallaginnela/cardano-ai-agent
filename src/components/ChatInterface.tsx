import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Wallet, History, Loader2 } from 'lucide-react';
import { WalletInfo } from './WalletInfo';
import { TransactionHistory } from './TransactionHistory';
import { blockfrostService } from '@/services/blockfrost';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  data?: any;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI Blockchain Query Agent. Ask me about Cardano wallets, balances, or transactions. Try asking 'What's my wallet balance?' or 'Show me transactions for a wallet address'.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractWalletAddress = (text: string): string | null => {
    // Look for Cardano wallet addresses (bech32 format starting with addr1)
    const addressRegex = /addr1[a-z0-9]{98,}/gi;
    const match = text.match(addressRegex);
    return match ? match[0] : null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const userInput = input.toLowerCase();
    setInput('');

    try {
      let botResponse: Message;

      if (userInput.includes('balance') || userInput.includes('wallet')) {
        const walletAddress = extractWalletAddress(input);
        
        if (!walletAddress) {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: "Please provide a valid Cardano wallet address (starting with 'addr1') to check the balance. For example: 'What's the balance of addr1q9...'",
            timestamp: new Date(),
          };
        } else {
          try {
            const walletData = await blockfrostService.getWalletInfo(walletAddress);
            botResponse = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: `Here's the wallet information for ${walletAddress.substring(0, 20)}...`,
              data: { type: 'wallet', data: walletData },
              timestamp: new Date(),
            };
          } catch (error) {
            botResponse = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: `Sorry, I couldn't fetch wallet information. Please check the wallet address and try again.`,
              timestamp: new Date(),
            };
          }
        }
      } else if (userInput.includes('transaction') || userInput.includes('history')) {
        const walletAddress = extractWalletAddress(input);
        
        if (!walletAddress) {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: "Please provide a valid Cardano wallet address to view transaction history. For example: 'Show me transactions for addr1q9...'",
            timestamp: new Date(),
          };
        } else {
          try {
            const transactions = await blockfrostService.getTransactionHistory(walletAddress);
            botResponse = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: `Here are the recent transactions for ${walletAddress.substring(0, 20)}...`,
              data: { type: 'transactions', data: transactions },
              timestamp: new Date(),
            };
          } catch (error) {
            botResponse = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: `Sorry, I couldn't fetch transaction history. Please check the wallet address and try again.`,
              timestamp: new Date(),
            };
          }
        }
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: "I can help you with Cardano blockchain queries! Try asking about:\n\n• Wallet balances: 'What's the balance of addr1q9...'\n• Transaction history: 'Show me transactions for addr1q9...'\n\nPlease provide a valid Cardano wallet address for me to help you.",
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Blockchain Query Agent
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about Cardano wallets and transactions
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary' : 'bg-gradient-primary'}`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <Card className={`p-4 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-card'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.data && message.data.type === 'wallet' && (
                    <WalletInfo data={message.data.data} />
                  )}
                  {message.data && message.data.type === 'transactions' && (
                    <TransactionHistory transactions={message.data.data} />
                  )}
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-gradient-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <Card className="p-4 bg-gradient-card">
                  <p>Fetching blockchain data...</p>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 bg-gradient-card">
        <div className="max-w-4xl mx-auto flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about wallet balances, transactions, or blockchain data..."
            className="flex-1 bg-input border-border focus:ring-crypto-blue focus:border-crypto-blue"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-primary hover:shadow-glow-blue transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("What's the balance of addr1q9")}
            className="text-xs border-border hover:border-crypto-blue hover:text-crypto-blue transition-colors"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Check Balance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Show me transactions for addr1q9")}
            className="text-xs border-border hover:border-crypto-blue hover:text-crypto-blue transition-colors"
          >
            <History className="w-3 h-3 mr-1" />
            Transaction History
          </Button>
        </div>
      </div>
    </div>
  );
};