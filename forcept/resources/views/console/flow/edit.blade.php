@extends('templates/console')

@section('page-title', 'Edit stage - Forcept console')

@section('console-content')

<!--| Error modal |-->
<div class="modal fade" id="stage-submit-error-modal">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">Heads up!</h4>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger">
                    <strong>Uh oh!</strong> Some errors occurred.
                    <ul></ul>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">&laquo; Go back to editing</button>
                <a href="{{ route('console::flow::index') }}" class="btn btn-danger">Back to patient flow home &raquo;</a>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<!--| Success modal |-->
<div class="modal fade" id="stage-submit-success-modal">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">Awesome!</h4>
            </div>
            <div class="modal-body">
                <div class="alert alert-success">
                    <strong>Your changes have been saved.</strong>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">&laquo; Go back to editing</button>
                <a href="{{ route('console::flow::index') }}" class="btn btn-success">Back to patient flow home &raquo;</a>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<!--| Warning modal |-->
<div class="modal fade" id="stage-submit-warning-modal">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Danger!</h4>
            </div>
            <div class="modal-body">
                <div class="alert alert-warning">
                    <strong>Important warning:</strong>
                    <br/>During this stage editing session, you removed <span id="removal-count"></span> field(s), including:
                    <ul id="removed-field-list"></ul><br/>
                    
                    Forcept will attempt to backup any data already associated with these fields. However, due to the nature of Forcept's dyanmic data flow structure, <strong><em><u>some</u> or <u>all of</u> the data <u>may</u> become inaccessible, or be <u>deleted</u> from the database entirely.</em></strong><br/><br/>
                    
                    If you've changed your mind about submitting these changes, you can <a href="{{ route('console::flow::index') }}" class="alert-link">return to the flow management page</a> without submitting.<br/><br/>
                    
                    If you wish to proceed, choose "proceed with changes" below.
                    
                </div>
            </div>
            <div class="modal-footer">
                <button id="submit-changes-override" class="btn btn-warning">Yes, I understand &mdash; proceed with changes &raquo;</a>
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

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
        <input type="text" name="name" class="form-control" id="stage-name" value="{{ oom('name', $stage->name) }}" placeholder="Enter stage name">
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
    
    var configuration = <?php echo json_encode($stage->fields); ?>;
    
    console.log("Configuration:");
    console.log(configuration);
    console.log("\n");
    var FlowEditorFields = ReactDOM.render(
        React.createElement(FlowEditorFields, {
            fields: configuration,
            handleSubmit: function() {
                
    
                var submitAJAX = function() {

                    var data = {
                        "_token": "{{ csrf_token() }}",
                        name: $("#stage-name").val(),
                        fields: FlowEditorFields.compileData()
                    };
                    $.ajax({
                        type: "POST",
                        url: "{{ url('console/flow/edit/' . $stage->id) }}",
                        data: data,
                        success: function(data) {
                            $("#stage-submit-success-modal").modal('show');
                            $("#cfg-contain").slideDown();
                            $("#cfg-submitting").fadeOut();
                        },
                        error: function(data) {

                            var modalDOM = $("#stage-submit-error-modal");
                            var list = modalDOM.find("#removed-field-list");

                            list.empty();

                            if(data.responseJSON.hasOwnProperty('status') && data.responseJSON.hasOwnProperty('message')) {
                                // Manual error                                
                                list.append("<li>" + data.responseJSON.message + "</li>");
                            } else {
                                // Laravel error
                                for(var key in data.responseJSON) {
                                    console.log(data.responseJSON[key]);
                                    data.responseJSON[key].map(function(error, index) {
                                        list.append("<li>" + error + "</li>");
                                    });
                                }
                            }

                            modalDOM.modal('show');
                            $("#cfg-contain").slideDown();
                            $("#cfg-submitting").fadeOut();
                        }
                    });
                }
    
                $("#cfg-contain").slideUp();
                $("#cfg-submitting").fadeIn();
                
                // Send AJAX request
                if(FlowEditorFields.state.fieldsRemoved.length > 0) {
                    // Give warning  
                    
                    var warningModal = $("#stage-submit-warning-modal");
                    var list = warningModal.find('#removed-field-list');                    
                    var count = warningModal.find('#removal-count');
                    var override = warningModal.find("#submit-changes-override");
                    
                    list.empty();
                    count.empty();
                    
                    override.on('click', function() {
                        warningModal.modal('hide');
                        submitAJAX();
                    });
                    
                    FlowEditorFields.state.fieldsRemoved.map(function(field, index) {
                        list.append("<li>" + field + "</li>"); 
                    });
                    count.html(FlowEditorFields.state.fieldsRemoved.length);
                    
                    warningModal.modal('show');
                    
                    
                } else {
                    submitAJAX();
                }
                
            }
        }),
        document.getElementById("cfg-contain")
    );
           
    setInterval(function() {
        var data = FlowEditorFields.compileData();
        var state = FlowEditorFields.state;
//            delete state['fields'];
        __debug(data, state["fieldsRemoved"]);
    }, 1000);
    
</script>

@endsection