<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchDetailsController extends Controller
{
    /**
     * Display the branch details page.
     */
    public function show(Request $request, string $id): Response
    {
        // Handle both old query parameter format and new data format
        $name = $request->input('name') ?? $request->query('name', 'Sucursal');
        $region = $request->input('region') ?? $request->query('region', 'Sin región');
        $dateRange = $request->input('dateRange');

        return Inertia::render('BranchDetails', [
            'id' => $id,
            'name' => $name,
            'region' => $region,
            'dateRange' => $dateRange,
        ]);
    }
}
