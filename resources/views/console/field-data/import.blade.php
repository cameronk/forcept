@extends('templates/console')

@section('page-title', 'Import / Field data - Forcept Console')

@section('console-content')

    <h1 class="p-t">Import new field data</h1>
    <hr/>
    <form action="{{ route('console::field-data::store') }}" method="POST" enctype="multipart/form-data">
        {!! csrf_field() !!}

        <div class="form-group row">
            <label class="col-sm-3 form-control-label">Upload CSV file</label>
            <div class="col-sm-9">
                <input type="file" name="upload" id="file" accept=".csv" required>
            </div>
        </div>
        <div class="form-group row">
            <label for="stageType" class="col-sm-3 form-control-label">Upload mode</label>
            <div class="col-sm-9">
                <select name="mode" class="form-control" id="stageType" disabled>
                    <option value="fresh">Delete already-existing field numbers and start fresh</option>
                    <option value="append">Keep old values, skip if field number already exists</option>
                    <option value="overwrite">Keep old values, overwrite old data if field number already exists</option>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <div class="col-sm-offset-3 col-sm-9">
                <button type="submit" class="btn btn-primary">Upload</button>
            </div>
        </div>
    </form>

@endsection
