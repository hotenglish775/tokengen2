import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Zap, Clock, Shield, Globe } from 'lucide-react';
import { TokenConfig, DeploymentResult } from '../types';
import { RemixFallback } from './RemixFallback';
import { contractService } from '../services/contractService';
import { vestingCategories } from '../data/vestingCategories';

interface ReviewDeployProps {
  config: TokenConfig;
  onBack: () => void;
  onDeploy: (result: DeploymentResult) => void;
}

export const ReviewDeploy: React.FC<ReviewDeployProps> = ({ config, onBack, onDeploy }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [deploymentFailed, setDeploymentFailed] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const estimatedGas = {
    amount: '0.025',
    usd: '$65'
  };

  const handleDeploy = async () => {
    if (!agreed) return;
    
    setIsDeploying(true);
    setDeploymentError(null);
    
    try {
      // Deploy token using contractService
      const result = await contractService.deployToken(config);
      
      onDeploy(result);
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentError((error as Error).message);
      setDeploymentFailed(true);
    } finally {
      setIsDeploying(false);
    }
  };

  const getActiveFeatures = () => {
    const features = [];
    if (config.features.burnable) features.push('Burnable');
    if (config.features.mintable) features.push('Mintable');
    if (config.features.transferFees.enabled) features.push('Transfer Fees');
    if (config.features.holderRedistribution.enabled) features.push('Holder Redistribution');
    return features;
  };

  // Show Remix fallback if deployment failed
  if (deploymentFailed) {
    return <RemixFallback config={config} onBack={() => setDeploymentFailed(false)} />;
  }

  const getVestingCategories = () => {
    return config.vesting.map(vest => {
      const category = vestingCategories.find(c => c.id === vest.category)!;
      return {
        name: category.name,
        percentage: vest.percentage,
        startDate: vest.startDate,
        duration: vest.duration
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vesting</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Review & Deploy</h1>
          <p className="text-gray-300">Review your token configuration before deployment</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Details */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Token Details</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <div className="text-white font-medium">{config.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                  <div className="text-white font-medium">{config.symbol}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Decimals</label>
                  <div className="text-white font-medium">{config.decimals}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Initial Supply</label>
                  <div className="text-white font-medium">{parseInt(config.initialSupply).toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Network</label>
                  <div className="text-white font-medium">{config.network.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Supply</label>
                  <div className="text-white font-medium">
                    {config.maxSupply ? parseInt(config.maxSupply).toLocaleString() : 'Unlimited'}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Active Features</h2>
              
              {getActiveFeatures().length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {getActiveFeatures().map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No additional features enabled</p>
              )}
              
              {config.features.transferFees.enabled && (
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
                  <div className="text-sm text-blue-300">
                    Transfer Fee: {config.features.transferFees.percentage}% → {config.features.transferFees.recipient.slice(0, 6)}...
                  </div>
                </div>
              )}
              
              {config.features.holderRedistribution.enabled && (
                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                  <div className="text-sm text-purple-300">
                    Holder Redistribution: {config.features.holderRedistribution.percentage}%
                  </div>
                </div>
              )}
            </div>

            {/* Vesting */}
            {config.vesting.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-4">Vesting Schedule</h2>
                
                <div className="space-y-3">
                  {getVestingCategories().map((vest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white font-medium">{vest.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{vest.percentage}%</div>
                        <div className="text-sm text-gray-300">
                          {vest.duration} days from {new Date(vest.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Terms & Conditions</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agree" className="text-white text-sm">
                    I understand that deployed tokens cannot be modified and I am responsible for the contract
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deployment Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Deployment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Network</span>
                  <span className="text-white font-medium">{config.network.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Estimated Gas</span>
                  <span className="text-white font-medium">{estimatedGas.amount} {config.network.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">USD Cost</span>
                  <span className="text-white font-medium">{estimatedGas.usd}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Service Fee</span>
                  <span className="text-white font-medium">$25</span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Cost</span>
                    <span className="text-white font-bold">$90</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">What's Included</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">Audited smart contract</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">Automatic verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">Optimized gas usage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-sm">24/7 support</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-400 mb-1">Final Warning</h3>
                  <p className="text-amber-300 text-sm">
                    Once deployed, your token contract cannot be modified. Please review all settings carefully.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={handleDeploy}
            disabled={!agreed || isDeploying}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <span>Deploy Token</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};