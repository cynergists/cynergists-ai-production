import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Sparkles,
    Settings,
    FileAudio,
    FileVideo,
    Clock,
    Zap,
    CheckCircle2,
    Save,
    RotateCcw,
    Upload,
    Headphones,
    MessageSquare,
    FileText,
    Scissors
} from 'lucide-react';

interface PrismConfigProps {
    agentDetails: any;
    onConfigSave?: (config: any) => void;
}

export const PrismConfig: React.FC<PrismConfigProps> = ({
    agentDetails,
    onConfigSave,
}) => {
    const [config, setConfig] = useState({
        // Processing Preferences
        autoProcessingEnabled: true,
        processingQuality: 'high',
        processingSpeed: 'standard',
        
        // Asset Generation Settings
        highlightClipsEnabled: true,
        quotableExtractionsEnabled: true,
        chapterMarkersEnabled: true,
        socialContentEnabled: true,
        blogOutlineEnabled: false,
        
        // Quality Thresholds
        minClipDuration: 15,
        maxClipDuration: 90,
        contentDensityThreshold: 0.7,
        confidenceThreshold: 0.8,
        
        // Audio Processing
        noiseReductionEnabled: true,
        volumeNormalizationEnabled: true,
        speakerIdentificationEnabled: true,
        
        // Output Preferences
        outputFormats: ['mp3', 'wav'],
        platformOptimization: ['youtube', 'spotify', 'social_media'],
        
        // Review Settings
        humanReviewRequired: true,
        qualityCheckEnabled: true,
        sourceVerificationEnabled: true,
        
        // Notification Preferences
        processingNotifications: true,
        completionNotifications: true,
        errorNotifications: true,
    });

    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const handleConfigChange = (key: string, value: any) => {
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

    const renderProcessingSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Processing Settings</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-medium">Auto-Processing</p>
                        <p className="text-sm text-gray-500">
                            Automatically start processing when episodes are uploaded
                        </p>
                    </div>
                    <Switch
                        checked={config.autoProcessingEnabled}
                        onCheckedChange={(checked) => handleConfigChange('autoProcessingEnabled', checked)}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="processingQuality">Processing Quality</Label>
                        <Select
                            value={config.processingQuality}
                            onValueChange={(value) => handleConfigChange('processingQuality', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard Quality</SelectItem>
                                <SelectItem value="high">High Quality</SelectItem>
                                <SelectItem value="maximum">Maximum Quality</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label htmlFor="processingSpeed">Processing Priority</Label>
                        <Select
                            value={config.processingSpeed}
                            onValueChange={(value) => handleConfigChange('processingSpeed', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard Processing</SelectItem>
                                <SelectItem value="priority">Priority Processing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </Card>
    );

    const renderAssetGenerationSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Asset Generation</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-medium mb-3 block">Content Types to Extract</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { key: 'highlightClipsEnabled', label: 'Highlight Clips', icon: Scissors },
                            { key: 'quotableExtractionsEnabled', label: 'Quotable Moments', icon: MessageSquare },
                            { key: 'chapterMarkersEnabled', label: 'Chapter Markers', icon: FileText },
                            { key: 'socialContentEnabled', label: 'Social Media Content', icon: MessageSquare },
                            { key: 'blogOutlineEnabled', label: 'Blog Post Outlines', icon: FileText },
                        ].map(({ key, label, icon: Icon }) => (
                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm">{label}</span>
                                </div>
                                <Switch
                                    checked={config[key as keyof typeof config] as boolean}
                                    onCheckedChange={(checked) => handleConfigChange(key, checked)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Clip Duration Range (seconds)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <Label htmlFor="minClipDuration" className="text-xs">Minimum</Label>
                                <Input
                                    type="number"
                                    id="minClipDuration"
                                    value={config.minClipDuration}
                                    onChange={(e) => handleConfigChange('minClipDuration', parseInt(e.target.value))}
                                    min={5}
                                    max={60}
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxClipDuration" className="text-xs">Maximum</Label>
                                <Input
                                    type="number"
                                    id="maxClipDuration"
                                    value={config.maxClipDuration}
                                    onChange={(e) => handleConfigChange('maxClipDuration', parseInt(e.target.value))}
                                    min={30}
                                    max={300}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <Label className="text-sm font-medium mb-2 block">
                            Content Density Threshold: {Math.round(config.contentDensityThreshold * 100)}%
                        </Label>
                        <Slider
                            value={[config.contentDensityThreshold]}
                            onValueChange={(value) => handleConfigChange('contentDensityThreshold', value[0])}
                            min={0.5}
                            max={1.0}
                            step={0.05}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Higher values extract only the most dense content segments
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );

    const renderAudioProcessingSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Audio Processing</h3>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="text-sm font-medium">Noise Reduction</p>
                            <p className="text-xs text-gray-500">Remove background noise</p>
                        </div>
                        <Switch
                            checked={config.noiseReductionEnabled}
                            onCheckedChange={(checked) => handleConfigChange('noiseReductionEnabled', checked)}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="text-sm font-medium">Volume Normalization</p>
                            <p className="text-xs text-gray-500">Consistent audio levels</p>
                        </div>
                        <Switch
                            checked={config.volumeNormalizationEnabled}
                            onCheckedChange={(checked) => handleConfigChange('volumeNormalizationEnabled', checked)}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="text-sm font-medium">Speaker ID</p>
                            <p className="text-xs text-gray-500">Identify different speakers</p>
                        </div>
                        <Switch
                            checked={config.speakerIdentificationEnabled}
                            onCheckedChange={(checked) => handleConfigChange('speakerIdentificationEnabled', checked)}
                        />
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="outputFormats">Output Audio Formats</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['mp3', 'wav', 'flac', 'm4a'].map(format => (
                            <Badge
                                key={format}
                                variant={config.outputFormats.includes(format) ? 'default' : 'outline'}
                                className={`cursor-pointer ${
                                    config.outputFormats.includes(format) 
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                                        : ''
                                }`}
                                onClick={() => {
                                    const current = config.outputFormats;
                                    const updated = current.includes(format)
                                        ? current.filter(f => f !== format)
                                        : [...current, format];
                                    handleConfigChange('outputFormats', updated);
                                }}
                            >
                                {format.toUpperCase()}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );

    const renderPlatformOptimizationSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Platform Optimization</h3>
            </div>
            
            <div className="space-y-4">
                <div>
                    <Label>Target Platforms for Content Optimization</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['youtube', 'spotify', 'apple_podcasts', 'social_media', 'website', 'newsletter'].map(platform => (
                            <Badge
                                key={platform}
                                variant={config.platformOptimization.includes(platform) ? 'default' : 'outline'}
                                className={`cursor-pointer ${
                                    config.platformOptimization.includes(platform) 
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                                        : ''
                                }`}
                                onClick={() => {
                                    const current = config.platformOptimization;
                                    const updated = current.includes(platform)
                                        ? current.filter(p => p !== platform)
                                        : [...current, platform];
                                    handleConfigChange('platformOptimization', updated);
                                }}
                            >
                                {platform.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );

    const renderReviewSettingsSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Quality & Review Settings</h3>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div>
                        <p className="font-medium text-orange-800">Human Review Required</p>
                        <p className="text-sm text-orange-600">
                            All generated content requires human approval before distribution
                        </p>
                    </div>
                    <Switch
                        checked={config.humanReviewRequired}
                        onCheckedChange={(checked) => handleConfigChange('humanReviewRequired', checked)}
                        disabled={true} // Always required per operational boundaries
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="text-sm font-medium">Quality Checks</p>
                            <p className="text-xs text-gray-500">Automated quality validation</p>
                        </div>
                        <Switch
                            checked={config.qualityCheckEnabled}
                            onCheckedChange={(checked) => handleConfigChange('qualityCheckEnabled', checked)}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="text-sm font-medium">Source Verification</p>
                            <p className="text-xs text-gray-500">Verify source attribution</p>
                        </div>
                        <Switch
                            checked={config.sourceVerificationEnabled}
                            onCheckedChange={(checked) => handleConfigChange('sourceVerificationEnabled', checked)}
                        />
                    </div>
                </div>
                
                <div>
                    <Label className="text-sm font-medium mb-2 block">
                        Confidence Threshold: {Math.round(config.confidenceThreshold * 100)}%
                    </Label>
                    <Slider
                        value={[config.confidenceThreshold]}
                        onValueChange={(value) => handleConfigChange('confidenceThreshold', value[0])}
                        min={0.6}
                        max={0.95}
                        step={0.05}
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Minimum confidence level required for automated asset extraction
                    </p>
                </div>
            </div>
        </Card>
    );

    const renderNotificationSection = () => (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
            </div>
            
            <div className="space-y-3">
                {[
                    { key: 'processingNotifications', label: 'Processing Started', description: 'Notify when episode processing begins' },
                    { key: 'completionNotifications', label: 'Processing Complete', description: 'Notify when assets are ready for review' },
                    { key: 'errorNotifications', label: 'Error Alerts', description: 'Notify about processing issues or failures' },
                ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-gray-500">{description}</p>
                        </div>
                        <Switch
                            checked={config[key as keyof typeof config] as boolean}
                            onCheckedChange={(checked) => handleConfigChange(key, checked)}
                        />
                    </div>
                ))}
            </div>
        </Card>
    );

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Prism Configuration</h1>
                        <p className="text-sm text-gray-500">Configure your podcast content processing settings</p>
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
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                    </Button>
                </div>
            </div>

            {/* Configuration Sections */}
            <div className="space-y-6">
                {renderProcessingSection()}
                {renderAssetGenerationSection()}
                {renderAudioProcessingSection()}
                {renderPlatformOptimizationSection()}
                {renderReviewSettingsSection()}
                {renderNotificationSection()}
            </div>
        </div>
    );
};