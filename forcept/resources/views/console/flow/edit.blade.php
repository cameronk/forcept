@extends('templates/console')

@section('page-title', 'Edit stage - Forcept console')

@section('console-content')

    <h1 class="p-t">Edit stage "{{ $stage->name }}"</h1>
    <hr/>


    <form action="{{ url('console/flow/edit/' . $stage->id) }}" method="POST">
        {!! csrf_field() !!}
        
        <!--| console::flow::create - basic settings |-->
        <h4>Basic settings</h4>
        <div class="form-group row">
            <label for="stageType" class="col-sm-2 form-control-label">Stage type</label>
            <div class="col-sm-10">
                <select name="type" class="form-control" id="stageType" disabled>
                    <option value="basic">Basic</option>                    
                    <option value="pharmacy">Pharmacy</option>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <label for="name" class="col-sm-2 form-control-label">Stage name</label>
            <div class="col-sm-10">
                <input type="text" name="name" class="form-control" id="name" value="{{ oom('name', $stage->name) }}" placeholder="Enter stage name">
            </div>
        </div>
    </form>

    <!--| console::flow::create - input config |-->
    <h4 class="p-t">Field configuration</h4> 
    <hr/>
    <div id="cfg-contain"></div>
    <hr/>
    <div class="form-group row">
        <div class="col-sm-offset-2 col-sm-10">                
            <a class="btn btn-primary" id="flow-add-field">&plus; Add new field</a>
            <button type="submit" class="btn btn-success">Submit changes to stage &rarr;</button>
        </div>
    </div>

<script type="text/javascript">
    
    var configuration = {
        "fields": [
            {
                name: "Patient location",
                type: "select",
                options: ["Gobert", "Other"]
            }
        ]
    };
    
    var inputCount = configuration["fields"].length;
    
//    ReactDOM.render(
//        React.createElement(FlowEditorFields, {
//            
//        }),
//        document.getElementById("cfg-contain")
//    );
//            
    
    for(var i = 0; i < inputCount; i++) {
        var inputName = "cfg-input-contain-" + inputCount;
        $("<div id='" + inputName + "'></div>").appendTo("#cfg-contain");
        ReactDOM.render(
            React.createElement(FlowEditorFieldConfigurator, { 
                name: configuration["fields"][i].name,
                type: configuration["fields"][i].type,                
                options: (configuration["fields"][i].hasOwnProperty('options') ? configuration["fields"][i].options : []),
            }),
            document.getElementById(inputName)
        );
    }
    
    $("#flow-add-field").on("click", function() {
        inputCount++;
        var inputName = "cfg-input-contain-" + inputCount;
        $("<div id='" + inputName + "'></div>").appendTo("#cfg-contain");
        ReactDOM.render(
            React.createElement(FlowEditorFieldConfigurator, { type: "text" }),
            document.getElementById(inputName)
        );
    });
</script>

@endsection