@extends('templates/console')

@section('page-title', 'Flow management - Forcept console')

@section('console-content')

    <h1 class="p-t">Flow</h1>
    <hr/>
    <ul class="nav nav-pills">
        <div class="btn-group btn-group-lg">
            <a href="{{ route('console::flow::create') }}" class="btn btn-primary-outline">Create a new stage</a>
        </div>
    </ul>

    <table class="table table-striped table-hover table-bordered m-t">

        <thead class="thead-inverse">
            <tr>
                <th>#</th>
                <th>Order</th>
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            
            @foreach($stages as $stage)
                <tr>
                    <td>{{ $stage->id }}</td>
                    <td>{{ $stage->order }}</td>
                    <td>{{ $stage->name }}</td>                    
                    <td>{{ $stage->type }}</td>
                    <td>
                        <div class="btn-group">
                            <form action="{{ url('console/flow/delete/' . $stage->id) }}" method="POST">
                                {!! csrf_field() !!}
                                <input type="hidden" name="_method" value="DELETE">
                                <a href="{{ url('console/flow/edit/' . $stage->id) }}" class="btn btn-primary-outline">Edit stage config</a>
                                @if(!$stage->root)
                                    <button type="submit" class="btn btn-danger-outline">Delete stage</button>
                                @endif
                            </form>
                        </div>
                    </td>
                </tr>
            @endforeach
            
        </tbody>
    </table>
@endsection