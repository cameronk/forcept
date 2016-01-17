@extends('templates/console')

@section('page-title', 'Map imported values / Field data - Forcept Console')

@section('console-content')

    <h1 class="p-t">Map imported field data</h1>
    <form action="{{ route('console::field-data::map') }}" method="POST">
        {!! csrf_field() !!}
        <input type="hidden" name="filename" value="{{ $name }}" />
        <input type="hidden" name="mode" value="{{ $mode }}" />
        <table class="table">
            <thead class="thead-inverse">
                <tr>
                    <th>Heading</th>
                    <th>Map to field...</th>
                </tr>
            </thead>
            <tbody>
                @foreach($headings as $index => $heading)
                    <tr>
                        <td>
                            <h4>Column heading: <strong>{{ $heading }}</strong></h4>
                            <table class="table table-sm">
                                <thead class="thead-default">
                                    <tr>
                                        @if($index !== 0)
                                            <th>...</th>
                                        @endif
                                        <th>{{ $heading }}</th>
                                        @if($index !== count($headings) - 1)
                                            <th>...</th>
                                        @endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($sheet->take(3)->get([$heading])->toArray() as $column)
                                        <tr>
                                            @if($index !== 0)
                                                <td>...</td>
                                            @endif
                                            <td>{{ $column[$heading] }}</td>
                                            @if($index !== count($headings) - 1)
                                                <td>...</td>
                                            @endif
                                        </tr>
                                    @endforeach
                                    <tr>
                                        @if($index !== 0)
                                            <td></td>
                                        @endif
                                        <td><strong>&plus;{{ $countRows - 3 }} more...</strong></td>
                                        @if($index !== count($headings) - 1)
                                            <td></td>
                                        @endif
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td>
                            <input type="hidden" name="heading-{{ $index }}" value="{{ $heading }}" />
                            <select class="form-control" name="map-{{ $index }}" required>
                                <?php
                                echo sprintf("<option value='__nullify__' selected>Don't use '%s'</option>", $heading);
                                echo "<optgroup label='Actions'>";
                                    echo sprintf("<option value='field_number'>Use '%s' as the searchable field number</option>", $heading);
                                echo "</optgroup>";
                                echo "<optgroup label='Map to field:'>";
                                    foreach($fields as $fieldKey => $fieldData) {
                                        echo sprintf("<option value='%s'%s>[%s, %s] %s</option>",
                                            $fieldKey,
                                            $heading === $fieldKey ? " selected" : "",
                                            $fieldKey,
                                            $fieldData['type'],
                                            $fieldData['name']
                                        );
                                    }
                                echo "</optgroup>";
                                ?>
                            </select>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <div class="form-group row">
            <button type="submit" class="btn btn-lg btn-primary">Continue &rarr;</button>
        </div>
    </form>

@endsection
