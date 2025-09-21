import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Wallet, History, Settings, HelpCircle, MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      content: "Hello! I'm your Cardano assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: `I received: "${inputValue}". This is a simulated response.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Left Sidebar */}
      <div className="w-16 md:w-20 bg-gray-800 text-white flex flex-col items-center py-4 space-y-6">
        <div className="p-2 rounded-lg bg-blue-600">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
          <Wallet className="h-6 w-6" />
        </div>
        <div className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
          <History className="h-6 w-6" />
        </div>
        <div className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer mt-auto">
          <Settings className="h-6 w-6" />
        </div>
        <div className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
          <HelpCircle className="h-6 w-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
          <div className="bg-blue-500 text-white p-2 rounded-full mr-3">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Cardano Assistant</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : ''} max-w-3xl`}>
                  <div className={`rounded-full p-2 ${message.sender === 'bot' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'} mx-2`}>
                    {message.sender === 'bot' ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${message.sender === 'bot' ? 'bg-white dark:bg-gray-800' : 'bg-blue-500 text-white'} shadow`}>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'bot' ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 mr-2 bg-gray-50 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Placeholder for additional info */}
      <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Wallet Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
                <p className="text-xl font-semibold">₳ 1,234.56</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rewards</p>
                <p className="text-lg">₳ 123.45</p>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 mr-2 bg-gray-50 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};