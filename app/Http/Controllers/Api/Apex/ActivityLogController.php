<?php

namespace App\Http\Controllers\Api\Apex;

use App\Http\Controllers\Controller;
use App\Models\ApexActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * List activity logs for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ApexActivityLog::query()
            ->where('user_id', $request->user()->id)
            ->with(['campaign:id,name', 'prospect:id,first_name,last_name,full_name'])
            ->orderBy('created_at', 'desc');

        if ($request->has('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        if ($request->has('campaign_id')) {
            $query->where('campaign_id', $request->campaign_id);
        }

        $logs = $query->paginate($request->get('per_page', 25));

        return response()->json($logs);
    }
}
