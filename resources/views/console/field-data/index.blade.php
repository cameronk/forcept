@extends('templates/console')

@section('page-title', 'Field data - Forcept Console')

@section('console-content')

    <h1 class="p-t">Field data</h1>
    <hr/>
    <ul class="nav nav-pills">
        <div class="btn-group btn-group-lg">
            <a href="{{ route('console::field-data::import') }}" class="btn btn-primary-outline">Import new field data</a>
        </div>
    </ul>


@endsection
