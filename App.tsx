
import React, { useState, useEffect } from 'react';
import { AssetType, UserState, Transaction, CollateralAsset, SecuritySettings } from './types';
import { INITIAL_COLLATERAL, MOCK_MARKET_PRICES, ASSET_ICONS } from './constants';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { CreditCard } from './components/CreditCard';
import { CollateralManager } from './components/CollateralManager';
import { TransactionList } from './components/TransactionList';
import { 
  calculateTotalCollateralValue, 
  calculateMaxCreditLimit, 
  calculateHealthFactor 
} from './services/collateralService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);
  const [managingItem, setManagingItem] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const [userState, setUserState] = useState<UserState>({
    walletAddress: '0x71C837C78383B3698008882D3D3D3D4e5B71c837',
    collateral: INITIAL_COLLATERAL,
    creditUsed: 1250.45,
    totalLimit: calculateMaxCreditLimit(INITIAL_COLLATERAL),
    transactions: [
      { id: '1', merchant: 'Apple Store', amount: 899.00, timestamp: Date.now() - 3600000, status: 'COMPLETED', category: 'Shopping' },
      { id: '2', merchant: 'Whole Foods', amount: 154.20, timestamp: Date.now() - 86400000, status: 'COMPLETED', category: 'Food' },
      { id: '3', merchant: 'Starbucks', amount: 12.50, timestamp: Date.now() - 172800000, status: 'COMPLETED', category: 'Food' },
      { id: '4', merchant: 'Amazon Web Services', amount: 45.00, timestamp: Date.now() - 259200000, status: 'COMPLETED', category: 'Services' },
      { id: '5', merchant: 'Delta Airlines', amount: 450.00, timestamp: Date.now() - 604800000, status: 'COMPLETED', category: 'Travel' },
    ],
    isCardFrozen: false,
    security: {
      biometricEnabled: true,
      twoFactorEnabled: true,
      spendingLimit: 5000,
      ipWhitelist: ['192.168.1.1'],
      auditLogs: [
        { action: 'Login from new device', timestamp: Date.now() - 3600000 },
        { action: 'Updated collateral LTV', timestamp: Date.now() - 86400000 },
      ]
    }
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const logoUrl = "https://drive.google.com/uc?export=view&id=1Az2dqZ3DOe24eRw4YFnS0NRqb2S8OkfI";
  const totalCollateralValue = calculateTotalCollateralValue(userState.collateral);
  const healthFactor = calculateHealthFactor(userState.totalLimit, userState.creditUsed);

  const addAuditLog = (action: string) => {
    setUserState(prev => ({
      ...prev,
      security: {
        ...prev.security,
        auditLogs: [{ action, timestamp: Date.now() }, ...prev.security.auditLogs].slice(0, 10)
      }
    }));
  };

  const handleDeposit = (type: AssetType, amount: number) => {
    setIsLoading(true);
    setTimeout(() => {
      const market = MOCK_MARKET_PRICES.find(m => m.asset === type);
      const price = market?.price || 0;
      
      setUserState(prev => {
        const existing = prev.collateral.find(c => c.type === type);
        let newCollateral: CollateralAsset[];
        
        if (existing) {
          newCollateral = prev.collateral.map(c => 
            c.type === type ? { ...c, amount: c.amount + amount, price } : c
          );
        } else {
          newCollateral = [...prev.collateral, { type, amount, price, ltv: 0.7 }];
        }
        
        return {
          ...prev,
          collateral: newCollateral,
          totalLimit: calculateMaxCreditLimit(newCollateral)
        };
      });
      addAuditLog(`Deposited ${amount} ${type}`);
      setIsLoading(false);
    }, 800);
  };

  const simulateSwipe = () => {
    if (userState.isCardFrozen) {
      alert("Transaction declined: Card is frozen.");
      return;
    }
    const merchants = ['Amazon', 'Uber', 'Shell', 'Nike', 'Netflix'];
    const amount = parseFloat((Math.random() * 200 + 10).toFixed(2));
    
    if (userState.security.spendingLimit && amount > userState.security.spendingLimit) {
      alert(`Transaction declined: Exceeds spending limit of $${userState.security.spendingLimit}`);
      return;
    }

    if (userState.creditUsed + amount > userState.totalLimit) {
      alert("Transaction declined: Insufficient credit limit based on collateral.");
      return;
    }
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      merchant: merchants[Math.floor(Math.random() * merchants.length)],
      amount,
      timestamp: Date.now(),
      status: 'COMPLETED',
      category: 'Simulated'
    };
    setUserState(prev => ({
      ...prev,
      creditUsed: prev.creditUsed + amount,
      transactions: [newTx, ...prev.transactions]
    }));
  };

  const toggleFreeze = () => {
    const nextState = !userState.isCardFrozen;
    setUserState(prev => ({ ...prev, isCardFrozen: nextState }));
    addAuditLog(nextState ? 'Emergency Freeze activated' : 'Card unfrozen');
  };

  const updateSecuritySetting = (key: keyof SecuritySettings, value: any) => {
    setUserState(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
    addAuditLog(`Updated security: ${key}`);
    setManagingItem(null);
    setInputValue('');
  };

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'Overview':
        return (
          <>
            <StatsGrid 
              totalCollateral={totalCollateralValue}
              creditUsed={userState.creditUsed}
              maxLimit={userState.totalLimit}
              healthFactor={healthFactor}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Virtual Card</h2>
                  <CreditCard 
                    balance={userState.creditUsed}
                    limit={userState.totalLimit}
                    isFrozen={userState.isCardFrozen}
                    onToggleFreeze={toggleFreeze}
                  />
                </div>
                <TransactionList transactions={userState.transactions.slice(0, 5)} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-8 space-y-8">
                 <CollateralManager 
                    assets={userState.collateral}
                    onDeposit={handleDeposit}
                    isLoading={isLoading}
                 />
                 <div className="glass p-6 rounded-2xl">
                   <div className="flex justify-between items-center mb-6">
                     <div>
                       <h3 className="text-lg font-bold">Credit Utilization</h3>
                       <p className="text-xs text-gray-400">Dynamic collateral health metrics</p>
                     </div>
                     <span className="text-sm font-mono font-bold">${userState.creditUsed.toFixed(2)} / ${userState.totalLimit.toFixed(2)}</span>
                   </div>
                   <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5">
                     <div 
                       className={`h-full transition-all duration-1000 rounded-full ${userState.creditUsed / userState.totalLimit > 0.85 ? 'bg-red-500' : 'bg-black'}`}
                       style={{ width: `${Math.min((userState.creditUsed / userState.totalLimit) * 100, 100)}%` }}
                     ></div>
                   </div>
                   <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">
                      <span>Safety Zone</span>
                      <span>Standard LTV</span>
                      <span>Liquidation Point</span>
                   </div>
                 </div>
              </div>
            </div>
          </>
        );
      case 'Assets':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Asset Portfolio</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CollateralManager 
                   assets={userState.collateral}
                   onDeposit={handleDeposit}
                   isLoading={isLoading}
                />
              </div>
              <div className="space-y-6">
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Market Prices</h3>
                  <div className="space-y-4">
                    {MOCK_MARKET_PRICES.map(price => (
                      <div key={price.asset} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs">
                             <i className={ASSET_ICONS[price.asset]}></i>
                           </div>
                           <span className="text-xs font-bold">{price.asset}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">${price.price.toLocaleString()}</p>
                          <p className={`text-[10px] font-bold ${price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {price.change24h > 0 ? '+' : ''}{price.change24h}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Credit Card':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold mb-6">Card Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <CreditCard 
                 balance={userState.creditUsed}
                 limit={userState.totalLimit}
                 isFrozen={userState.isCardFrozen}
                 onToggleFreeze={toggleFreeze}
               />
               <div className="glass p-8 rounded-2xl flex flex-col justify-center">
                 <h3 className="text-xl font-bold mb-2">Card Details</h3>
                 <p className="text-sm text-gray-500 mb-6">Your Solux White Platinum card is secured by institutional collateral. Spending power is dynamically adjusted based on market prices.</p>
                 <div className="space-y-4">
                   <div className="flex justify-between py-2 border-b border-gray-100">
                     <span className="text-xs font-medium text-gray-400">Spending Limit</span>
                     <span className="text-xs font-bold">${userState.totalLimit.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between py-2 border-b border-gray-100">
                     <span className="text-xs font-medium text-gray-400">Available</span>
                     <span className="text-xs font-bold">${(userState.totalLimit - userState.creditUsed).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between py-2">
                     <span className="text-xs font-medium text-gray-400">Status</span>
                     <span className={`text-xs font-bold ${userState.isCardFrozen ? 'text-red-500' : 'text-green-500'}`}>
                       {userState.isCardFrozen ? 'FROZEN' : 'ACTIVE'}
                     </span>
                   </div>
                 </div>
               </div>
            </div>
            <TransactionList transactions={userState.transactions} isLoading={isLoading} />
          </div>
        );
      case 'History':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Transaction History</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Comprehensive Activity Ledger</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">Filter</button>
                <button className="px-4 py-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">Download Statement</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                 <TransactionList transactions={userState.transactions} isLoading={isLoading} />
              </div>
              <div className="space-y-6">
                <div className="glass p-6 rounded-xl">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Spending Analysis</h3>
                   <div className="space-y-4">
                     {[
                       { cat: 'Shopping', amount: 899, color: 'bg-black' },
                       { cat: 'Food', amount: 166.7, color: 'bg-slate-400' },
                       { cat: 'Travel', amount: 450, color: 'bg-slate-200' },
                     ].map(item => (
                       <div key={item.cat}>
                         <div className="flex justify-between text-[10px] font-bold mb-1">
                           <span>{item.cat}</span>
                           <span>${item.amount.toLocaleString()}</span>
                         </div>
                         <div className="w-full h-1 bg-gray-50 rounded-full">
                           <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.amount / 1500) * 100}%` }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 italic text-[10px] text-gray-400 text-center leading-relaxed">
                  Historical data is synced with the Base Mainnet ledger every 15 minutes.
                </div>
              </div>
            </div>
          </div>
        );
      case 'Security':
        const securityItems = [
          { title: 'Biometric Access', desc: 'Secure login via FaceID or TouchID.', icon: 'fa-fingerprint', key: 'biometricEnabled', type: 'toggle' },
          { title: '2FA Verification', desc: 'Require a code for withdrawals.', icon: 'fa-shield-halved', key: 'twoFactorEnabled', type: 'toggle' },
          { title: 'Spending Limits', desc: 'Set a daily cap on your card.', icon: 'fa-sliders', key: 'spendingLimit', type: 'input' },
          { title: 'IP Whitelisting', desc: 'Verified IP addresses only.', icon: 'fa-location-dot', key: 'ipWhitelist', type: 'list' },
          { title: 'Emergency Freeze', desc: 'Instantly lock all assets.', icon: 'fa-snowflake', key: 'emergencyFreeze', type: 'action' },
          { title: 'Audit Logs', desc: 'Detailed interaction history.', icon: 'fa-list-check', key: 'auditLogs', type: 'modal' },
        ];

        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-1">Security Center</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Protect your assets and credit line</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {securityItems.map((item, idx) => {
                const isActive = item.type === 'toggle' ? userState.security[item.key as keyof SecuritySettings] : true;
                const displayStatus = item.type === 'toggle' 
                  ? (userState.security[item.key as keyof SecuritySettings] ? 'Enabled' : 'Disabled')
                  : item.key === 'spendingLimit' ? `$${userState.security.spendingLimit || 'None'}`
                  : item.key === 'ipWhitelist' ? `${userState.security.ipWhitelist.length} Active`
                  : item.key === 'emergencyFreeze' ? (userState.isCardFrozen ? 'FROZEN' : 'READY')
                  : 'ACTIVE';

                return (
                  <div key={idx} className="glass p-6 rounded-2xl border border-gray-100 hover:border-black transition-all group flex flex-col justify-between h-52">
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center transition-all ${isActive ? 'text-black' : 'text-gray-300'}`}>
                         <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        {displayStatus}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 leading-normal">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (item.type === 'toggle') {
                          updateSecuritySetting(item.key as keyof SecuritySettings, !userState.security[item.key as keyof SecuritySettings]);
                        } else if (item.key === 'emergencyFreeze') {
                          toggleFreeze();
                        } else {
                          setManagingItem(item.key);
                          if (item.key === 'spendingLimit') setInputValue(String(userState.security.spendingLimit || ''));
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-black mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {item.type === 'toggle' ? 'Switch' : item.key === 'emergencyFreeze' ? (userState.isCardFrozen ? 'Unfreeze' : 'Activate') : 'Manage Setting'}
                    </button>
                  </div>
                );
              })}

              {/* Management Overlay Modal */}
              {managingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                   <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                      <h3 className="text-lg font-bold mb-2">Manage {managingItem.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                      <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-widest font-bold">Secure Modification Panel</p>
                      
                      {managingItem === 'spendingLimit' && (
                        <div className="space-y-4">
                          <input 
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Set daily limit"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-black outline-none"
                          />
                          <button 
                            onClick={() => updateSecuritySetting('spendingLimit', Number(inputValue))}
                            className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                          >
                            Save Limit
                          </button>
                        </div>
                      )}

                      {managingItem === 'ipWhitelist' && (
                        <div className="space-y-4">
                          <div className="max-h-32 overflow-y-auto space-y-2 mb-4">
                             {userState.security.ipWhitelist.map(ip => (
                               <div key={ip} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-[10px] font-bold">
                                 <span>{ip}</span>
                                 <button onClick={() => updateSecuritySetting('ipWhitelist', userState.security.ipWhitelist.filter(i => i !== ip))} className="text-red-500">Remove</button>
                               </div>
                             ))}
                          </div>
                          <input 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="127.0.0.1"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-black outline-none"
                          />
                          <button 
                            onClick={() => updateSecuritySetting('ipWhitelist', [...userState.security.ipWhitelist, inputValue])}
                            className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                          >
                            Add Address
                          </button>
                        </div>
                      )}

                      {managingItem === 'auditLogs' && (
                        <div className="space-y-4">
                           <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                             {userState.security.auditLogs.map((log, i) => (
                               <div key={i} className="pb-3 border-b border-gray-50 last:border-0">
                                 <p className="text-[10px] font-bold text-black">{log.action}</p>
                                 <p className="text-[8px] text-gray-400 font-bold uppercase">{new Date(log.timestamp).toLocaleString()}</p>
                               </div>
                             ))}
                           </div>
                        </div>
                      )}

                      <button 
                        onClick={() => setManagingItem(null)}
                        className="w-full mt-4 py-3 bg-white border border-gray-100 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors"
                      >
                        Cancel / Close
                      </button>
                   </div>
                </div>
              )}
            </div>

            <div className="glass p-8 rounded-2xl border-dashed border-2 border-gray-100 flex flex-col items-center justify-center text-center py-12">
               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
                 <i className="fa-solid fa-check-double text-2xl"></i>
               </div>
               <h3 className="text-xl font-bold mb-2">Institutional-Grade Security</h3>
               <p className="text-sm text-gray-500 max-w-md mx-auto">Solux uses multi-sig custody and hardware security modules to ensure your collateral is always protected from unauthorized access.</p>
               <button className="mt-8 px-8 py-3 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10">Upgrade to Vault+</button>
            </div>
          </div>
        );
      case 'Profile':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="w-32 h-32 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-4xl text-black shadow-inner">
                 <i className="fa-solid fa-user"></i>
               </div>
               <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-3">
                   <h2 className="text-3xl font-bold">Platinum Member</h2>
                   <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">PRO</span>
                 </div>
                 <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                   <i className="fa-solid fa-shield-check text-green-500"></i>
                   Verified Account since October 2023
                 </p>
                 <div className="pt-4 flex gap-3">
                   <button className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest">Edit Profile</button>
                   <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest">Share Wallet</button>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass p-8 rounded-2xl">
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Wallet Information</h3>
                 <div className="space-y-6">
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Public Address</p>
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <span className="text-xs font-mono font-bold truncate max-w-[200px]">{userState.walletAddress}</span>
                       <button onClick={() => {
                         navigator.clipboard.writeText(userState.walletAddress || '');
                         alert('Address copied to clipboard');
                       }} className="text-black hover:scale-110 transition-transform"><i className="fa-regular fa-copy"></i></button>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Network</p>
                       <p className="text-sm font-bold">Base Mainnet</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Custody</p>
                       <p className="text-sm font-bold">MPC Institutional</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="glass p-8 rounded-2xl">
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Tier Benefits</h3>
                 <div className="space-y-4">
                    {[
                      { label: 'Collateral LTV', value: '70% Max' },
                      { label: 'FX Fees', value: '0.0% (Waived)' },
                      { label: 'ATM Limits', value: '$2,500 / Day' },
                      { label: 'Rewards Rate', value: '2.5% CryptoBack' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-medium text-gray-500">{item.label}</span>
                        <span className="text-xs font-bold">{item.value}</span>
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="glass p-8 rounded-2xl border-red-100 bg-red-50/10">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-400 mb-4">Danger Zone</h3>
               <p className="text-xs text-gray-400 mb-6">These actions are irreversible. Please proceed with extreme caution.</p>
               <div className="flex flex-wrap gap-4">
                 <button className="px-6 py-3 border border-red-200 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Deactivate Card</button>
                 <button className="px-6 py-3 border border-red-200 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Revoke Vault Access</button>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400 italic">
            View coming soon...
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#ffffff]">
      <Sidebar 
        walletAddress={userState.walletAddress} 
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('Overview')}>
            <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
               <img 
                 src={logoUrl} 
                 alt="Solux" 
                 className="w-full h-full p-2 object-contain" 
                 onError={(e) => (e.currentTarget.style.display = 'none')}
               />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight leading-none">Solux</h1>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Institutional Reserve</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={simulateSwipe}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              <i className="fa-solid fa-bolt"></i>
              Simulate Swipe
            </button>
            <button 
              onClick={() => setActiveView('Profile')}
              className={`border px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all active:scale-95
                ${activeView === 'Profile' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-black hover:border-black shadow-sm'}`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${activeView === 'Profile' ? 'bg-white' : 'bg-green-500'}`}></div>
              <span className="text-xs font-mono font-bold tracking-wider">{userState.walletAddress?.slice(0, 6)}...{userState.walletAddress?.slice(-4)}</span>
            </button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
