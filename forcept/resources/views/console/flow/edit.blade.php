@extends('templates/console')

@section('page-title', 'Edit stage - Forcept console')

@section('console-content')

    <h1 class="p-t">Edit stage "{{ $stage->name }}"</h1>
    <hr/>

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

    <!--| console::flow::create - input config |-->
    <h4 class="p-t">Field configuration</h4> 
    <hr/>
    <div id="cfg-contain"></div>
    <div id="cfg-submitting" style="display: none;">
        <img src="{{ asset('assets/img/loading.gif') }}" />
        <h5>One moment, Forcept is updating this stage...</h5>
    </div>
         

<script type="text/javascript">
    
    var configuration = {
        "fields": {
            "1450702722922": {
                name: "Patient location",
                type: "select",
                settings: {
                    options: ["Gobert", "Other"],
                    allowCustomData: true
                }
            }
        }  
    };
    
    console.log("Configuration:");
    console.log(configuration);
    console.log("\n");
    
    var FlowEditorFields = ReactDOM.render(
        React.createElement(FlowEditorFields, {
            fields: configuration["fields"],
            handleSubmit: function() {
                
                $("#cfg-contain").slideUp();
                $("#cfg-submitting").fadeIn();
                
                console.log(FlowEditorFields.compileData());
            }
        }),
        document.getElementById("cfg-contain")
    );
           
    setInterval(function() {
        var data = FlowEditorFields.compileData();
        __debug(JSON.stringify(data, null, "  "));
    }, 1000);
    
</script>

@endsection