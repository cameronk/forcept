@extends('templates/console')

@inject('stages', 'App\Stage')

@section('page-title', 'Flow management - Forcept console')

@section('console-content')

    <h1 class="p-t">Create a new stage</h1>
    <hr/>

    <form action="{{ route('console::flow::store') }}" method="POST">
        {!! csrf_field() !!}
        
        <div class="form-group row">
            <label for="stageType" class="col-sm-2 form-control-label">Stage type</label>
            <div class="col-sm-10">
                <select name="type" class="form-control" id="stageType">
                    <option value="basic">Basic</option>                    
                    <option value="pharmacy">Pharmacy</option>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <label for="name" class="col-sm-2 form-control-label">Stage name</label>
            <div class="col-sm-10">
                <input type="text" name="name" class="form-control" id="name" placeholder="Enter stage name">
            </div>
        </div>
        <div class="form-group row">
            <div class="col-sm-offset-2 col-sm-10">
                <button type="submit" class="btn btn-primary">Create stage</button>
            </div>
        </div>
    </form>
@endsection