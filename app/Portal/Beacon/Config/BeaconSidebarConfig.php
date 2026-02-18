<?php

namespace App\Portal\Beacon\Config;

use App\Models\PortalTenant;

class BeaconSidebarConfig
{
    /**
     * Get the sidebar configuration for Beacon agent.
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        return [
            'event_stats' => self::getEventStats($tenant),
            'recent_events' => self::getRecentEvents($tenant),
            'execution_modes' => self::getExecutionModes($tenant),
        ];
    }

    /**
     * Get event configuration statistics.
     */
    private static function getEventStats(PortalTenant $tenant): array
    {
        // TODO: Create BeaconEvent model and implement actual statistics
        // For now, returning mock data for the frontend
        return [
            'total_events' => 0,
            'active_events' => 0,
            'this_month_events' => 0,
            'pending_approvals' => 0,
        ];
    }

    /**
     * Get recent events for the sidebar.
     */
    private static function getRecentEvents(PortalTenant $tenant): array
    {
        // TODO: Implement actual event retrieval from database
        // For now, returning empty array
        return [];
    }

    /**
     * Get execution mode configuration.
     */
    private static function getExecutionModes(PortalTenant $tenant): array
    {
        return [
            'current_mode' => 'approval', // or 'autopilot'
            'approval_required' => true,
            'auto_execution_enabled' => false,
        ];
    }
}