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

    @if($fielddata->count() > 0)
        <table class="table m-t">
            <thead class="thead-inverse">
                <tr>
                    <th>ID</th>
                    <th>Field num.</th>
                    <th>Data</th>
                    <th>Used?</th>
                    <th>Created at</th>
                </tr>
            </thead>
            <tbody>
                @foreach($fielddata as $row)
                    <tr>
                        <th scope="row">{{ $row->id }}</th>
                        <td>{{ $row->field_number }}</td>
                        <td>
                            <ul>
                                @foreach($row->data as $key => $value)
                                    @if(array_key_exists($key, $fields))
                                        <li class="list-unstyled">
                                            <span class="label label-default m-r">
                                                {{ $fields[$key]['name'] }}
                                            </span>
                                            {{ $value }}
                                        </li>
                                    @endif
                                @endforeach
                            </ul>
                        </td>
                        <td>
                            {{ $row->used ? "Yes" : "No" }}
                        </td>
                        <td>
                            {{ $row->created_at }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        {!!  $fielddata->render() !!}
    @else
        <div class="alert alert-info m-t">
            No FieldData values found.
        </div>
    @endif

@endsection
