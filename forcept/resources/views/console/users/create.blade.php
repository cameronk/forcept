@extends('templates/console')

@inject('users', 'App\User')

@section('page-title', 'Create user - Forcept console')

@section('console-content')

    <h1 class="p-t">Create user</h1>
    <hr/>

    <form action="{{ route('console::users::create') }}" method="POST">
        {!! csrf_field() !!}
        <div class="form-group row">
            <label for="username" class="col-sm-2 form-control-label">Username</label>
            <div class="col-sm-10">
                <input type="text" name="username" class="form-control" id="username" placeholder="Enter username">
            </div>
        </div>
        <div class="form-group row">
            <label for="pin1" class="col-sm-2 form-control-label">PIN</label>
            <div class="col-sm-10">
                <input type="password" name="password" class="form-control" id="pin1" placeholder="Enter PIN">
            </div>
        </div>
        <div class="form-group row">
            <label for="pin2" class="col-sm-2 form-control-label">Confirm PIN</label>
            <div class="col-sm-10">
                <input type="password" name="password_confirmation" class="form-control" id="pin2" placeholder="Confirm the above PIN">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-sm-2">Admin status</label>
            <div class="col-sm-10">
                <div class="checkbox">
                    <label>
                      <input type="checkbox" name="is_admin" value="1"> Yes, this user is an administrator
                    </label>
                </div>
            </div>
        </div>
        <div class="form-group row">
            <div class="col-sm-offset-2 col-sm-10">
                <button type="submit" class="btn btn-primary">Create</button>
            </div>
        </div>
    </form>

@endsection