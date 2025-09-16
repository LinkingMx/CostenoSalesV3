<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchDetailsController extends Controller
{
    /**
     * Display the branch details page.
     *
     * @param Request $request
     * @param string $id
     * @return Response
     */
    public function show(Request $request, string $id): Response
    {
        $name = $request->query('name', 'Sucursal');
        $region = $request->query('region', 'Sin región');

        return Inertia::render('BranchDetails', [
            'id' => $id,
            'name' => $name,
            'region' => $region,
        ]);
    }
}