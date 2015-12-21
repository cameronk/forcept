@extends('templates/console')

@inject('users', 'App\User')

@section('page-title', 'User management - Forcept console')

@section('console-content')

    <h1 class="p-t">Users</h1>
    <hr/>
    <ul class="nav nav-pills">
        <div class="btn-group btn-group-lg">
            <a href="{{ route('console::users::create') }}" class="btn btn-primary-outline">Create a new user</a>
        </div>
    </ul>

    <table class="table table-striped table-hover table-bordered m-t">

        <thead class="thead-inverse">
            <tr>
                <th>#</th>
                <th>Username</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            
            @foreach($users->all() as $user)
                <tr>
                    <td>{{ $user->id }}</td>
                    <td>{{ $user->username }}</td>
                    <td>
                        <div class="btn-group">
                            <form action="{{ url('console/users/delete/' . $user->id) }}" method="POST">
                                {!! csrf_field() !!}
                                <input type="hidden" name="_method" value="DELETE">
                                <button type="submit" class="btn btn-danger-outline"{{ $user->id == Auth::user()->id ? ' disabled' : '' }}>Delete user</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @endforeach
            
        </tbody>
    </table>
@endsection