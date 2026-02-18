import { AlertCircle, Calendar, Clock, Link, Palette, RotateCcw, Save, Settings, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface ImpulseAgentDetails {
    agent_name?: string | null;
    job_title?: string | null;
}

interface PerformanceThresholds {
    minEngagement: number;
    minCompletion: number;
    minConversions: number;
}

interface ImpulseConfigState {
    tiktokShopAccount: string;
    apiCredentials: string;
    selectedCategories: string[];
    productScope: string;
    syncFrequency: string;
    brandVoice: string;
    messagingConstraints: string[];
    visualStyle: string;
    logoPosition: string;
    postingCadence: string;
    scheduleWindows: string[];
    approvalMode: string;
    autopilotEnabled: boolean;
    optimizationMetrics: string[];
    performanceThresholds: PerformanceThresholds;
    voiceModeEnabled: boolean;
    voiceStyle: string;
}

interface ImpulseConfigProps {
    agentDetails?: ImpulseAgentDetails | null;
    onConfigSave?: (config: ImpulseConfigState) => void;
}

export const ImpulseConfig = ({
    agentDetails,
    onConfigSave,
}: ImpulseConfigProps) => {
    const [config, setConfig] = useState<ImpulseConfigState>({
        // TikTok Shop Connection
        tiktokShopAccount: '',
        apiCredentials: '',
        
        // Catalog Configuration
        selectedCategories: ['Electronics', 'Beauty'],
        productScope: 'all',
        syncFrequency: 'daily',
        
        // Brand Guidelines
        brandVoice: 'professional',
        messagingConstraints: ['No medical claims', 'Family-friendly content'],
        visualStyle: 'modern',
        logoPosition: 'bottom-right',
        
        // Publishing Settings
        postingCadence: 'daily',
        scheduleWindows: ['9:00 AM', '2:00 PM', '6:00 PM'],
        approvalMode: 'manual',
        autopilotEnabled: false,
        
        // Performance Metrics
        optimizationMetrics: ['engagement_rate'],
        performanceThresholds: {
            minEngagement: 2.0,
            minCompletion: 60.0,
            minConversions: 1,
        },
        
        // Voice Settings
        voiceModeEnabled: false,
        voiceStyle: 'professional_friendly',
    });

    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');

    const handleConfigChange = <K extends keyof ImpulseConfigState>(
        key: K,
        value: ImpulseConfigState[K]
    ) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setUnsavedChanges(true);
    };

    const handleSaveConfig = () => {
        if (onConfigSave) {
            onConfigSave(config);
        }
        setUnsavedChanges(false);
    };

    const handleResetConfig = () => {
        // Reset to default values
        setUnsavedChanges(false);
    };

    const handleTikTokConnect = async () => {
        setIsConnecting(true);
        // Mock connection process
        setTimeout(() => {
            setConnectionStatus('connected');
            setIsConnecting(false);
        }, 2000);
    };

    const renderConnectionSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Link className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">TikTok Shop Connection</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                            connectionStatus === 'connected' ? 'bg-green-500' : 
                            connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <div>
                            <p className="font-medium">
                                {connectionStatus === 'connected' ? 'Connected to TikTok Shop' : 'Not Connected'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {connectionStatus === 'connected' 
                                    ? 'Account: @your-shop-name • 1,245 products'
                                    : 'Connect your TikTok Shop account to start automating content'
                                }
                            </p>
                        </div>
                    </div>
                    
                    <Button
                        onClick={handleTikTokConnect}
                        disabled={isConnecting || connectionStatus === 'connected'}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {isConnecting ? 'Connecting...' : connectionStatus === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                </div>
                
                {connectionStatus === 'connected' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Products Synced</p>
                            <p className="text-lg font-bold text-green-600">1,245</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Categories</p>
                            <p className="text-lg font-bold text-blue-600">12</p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm font-medium text-purple-800">Last Sync</p>
                            <p className="text-lg font-bold text-purple-600">2h ago</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );

    const renderCatalogSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Catalog Configuration</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <Label htmlFor="categories">Selected Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['Electronics', 'Beauty', 'Apparel', 'Home', 'Sports'].map(category => (
                            <Badge
                                key={category}
                                variant={config.selectedCategories.includes(category) ? 'default' : 'outline'}
                                className={`cursor-pointer ${
                                    config.selectedCategories.includes(category) 
                                        ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                        : ''
                                }`}
                                onClick={() => {
                                    const current = config.selectedCategories;
                                    const updated = current.includes(category)
                                        ? current.filter(c => c !== category)
                                        : [...current, category];
                                    handleConfigChange('selectedCategories', updated);
                                }}
                            >
                                {category}
                            </Badge>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="productScope">Product Scope</Label>
                        <Select
                            value={config.productScope}
                            onValueChange={(value) => handleConfigChange('productScope', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                <SelectItem value="active">Active Products Only</SelectItem>
                                <SelectItem value="high_inventory">High Inventory Only</SelectItem>
                                <SelectItem value="featured">Featured Products</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="syncFrequency">Sync Frequency</Label>
                        <Select
                            value={config.syncFrequency}
                            onValueChange={(value) => handleConfigChange('syncFrequency', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </Card>
    );

    const renderBrandSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Brand Guidelines</h3>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="brandVoice">Brand Voice</Label>
                        <Select
                            value={config.brandVoice}
                            onValueChange={(value) => handleConfigChange('brandVoice', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="casual">Casual & Friendly</SelectItem>
                                <SelectItem value="trendy">Trendy & Hip</SelectItem>
                                <SelectItem value="luxury">Luxury & Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="visualStyle">Visual Style</Label>
                        <Select
                            value={config.visualStyle}
                            onValueChange={(value) => handleConfigChange('visualStyle', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="modern">Modern & Clean</SelectItem>
                                <SelectItem value="vibrant">Vibrant & Colorful</SelectItem>
                                <SelectItem value="minimalist">Minimalist</SelectItem>
                                <SelectItem value="bold">Bold & Dynamic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="messagingConstraints">Messaging Constraints</Label>
                    <Textarea
                        value={config.messagingConstraints.join('\n')}
                        onChange={(e) => handleConfigChange('messagingConstraints', e.target.value.split('\n'))}
                        placeholder="Enter constraints, one per line..."
                        className="mt-1"
                        rows={3}
                    />
                </div>
            </div>
        </Card>
    );

    const renderPublishingSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Publishing Settings</h3>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="postingCadence">Posting Frequency</Label>
                        <Select
                            value={config.postingCadence}
                            onValueChange={(value) => handleConfigChange('postingCadence', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="multiple_daily">Multiple Daily</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="every_other_day">Every Other Day</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="approvalMode">Approval Mode</Label>
                        <Select
                            value={config.approvalMode}
                            onValueChange={(value) => handleConfigChange('approvalMode', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">Manual Approval</SelectItem>
                                <SelectItem value="auto_approve">Auto-Approve</SelectItem>
                                <SelectItem value="scheduled_review">Scheduled Review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-medium">Autopilot Mode</p>
                        <p className="text-sm text-gray-500">
                            Automatically publish approved content without manual intervention
                        </p>
                    </div>
                    <Switch
                        checked={config.autopilotEnabled}
                        onCheckedChange={(checked) => handleConfigChange('autopilotEnabled', checked)}
                    />
                </div>
                
                {!config.autopilotEnabled && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-orange-800">Draft Mode Active</p>
                                <p className="text-xs text-orange-600">
                                    All generated videos require manual approval before publishing
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );

    const renderMetricsSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Success Metrics</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <Label>Optimization Focus</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['engagement_rate', 'completion_rate', 'conversion_rate', 'revenue'].map(metric => (
                            <Badge
                                key={metric}
                                variant={config.optimizationMetrics.includes(metric) ? 'default' : 'outline'}
                                className={`cursor-pointer ${
                                    config.optimizationMetrics.includes(metric) 
                                        ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                        : ''
                                }`}
                                onClick={() => {
                                    const current = config.optimizationMetrics;
                                    const updated = current.includes(metric)
                                        ? current.filter(m => m !== metric)
                                        : [...current, metric];
                                    handleConfigChange('optimizationMetrics', updated);
                                }}
                            >
                                {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="minEngagement">Min. Engagement (%)</Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={config.performanceThresholds.minEngagement}
                            onChange={(e) => handleConfigChange('performanceThresholds', {
                                ...config.performanceThresholds,
                                minEngagement: parseFloat(e.target.value)
                            })}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="minCompletion">Min. Completion (%)</Label>
                        <Input
                            type="number"
                            step="1"
                            value={config.performanceThresholds.minCompletion}
                            onChange={(e) => handleConfigChange('performanceThresholds', {
                                ...config.performanceThresholds,
                                minCompletion: parseFloat(e.target.value)
                            })}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="minConversions">Min. Conversions</Label>
                        <Input
                            type="number"
                            step="1"
                            value={config.performanceThresholds.minConversions}
                            onChange={(e) => handleConfigChange('performanceThresholds', {
                                ...config.performanceThresholds,
                                minConversions: Number.parseInt(e.target.value, 10)
                            })}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Impulse Configuration</h1>
                        <p className="text-sm text-gray-500">
                            {typeof agentDetails?.job_title === 'string' && agentDetails.job_title.trim() !== ''
                                ? agentDetails.job_title
                                : 'Configure your TikTok Shop automation settings'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {unsavedChanges && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Unsaved Changes
                        </Badge>
                    )}
                    
                    <Button variant="outline" onClick={handleResetConfig}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    
                    <Button 
                        onClick={handleSaveConfig}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                    </Button>
                </div>
            </div>

            {/* Configuration Sections */}
            <div className="space-y-6">
                {renderConnectionSection()}
                {renderCatalogSection()}
                {renderBrandSection()}
                {renderPublishingSection()}
                {renderMetricsSection()}
            </div>
        </div>
    );
};
