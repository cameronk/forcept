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
                    <ul id="errors-list"></ul>
                </div>
            </div>
            <div class="modal-footer">
                <a href="{{ route('console::flow::index') }}" class="btn btn-danger">&laquo; Back to patient flow home</a>
                <button type="button" class="btn btn-primary" data-dismiss="modal">Go back to editing &raquo;</button>
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

@if($stage->root == 1)
    <div class="alert alert-info">
        <strong>Heads up!</strong>
        <p>This stage is the root stage, meaning it is where patients are paired with a new visit. During this process, patient data is either pulled from a pre-existing patient record for updating, or a new record is created from scratch.</p>
        <p>As a result, this stage cannot be deleted. In addition, some fields (such as patient first and last name) may be immutable.</p>
    </div>
@endif

<!--| console::flow::create - input config |-->
<div id="cfg-contain"></div>
<div id="cfg-submitting" style="display: none;">
    <img src="{{ asset('assets/img/loading.gif') }}" />
    <h5>One moment, Forcept is updating this stage...</h5>
</div>

@endsection

@section("scripts")
<script type="text/javascript">
    var configuration = <?php echo $stage->rawFields; ?>;

    console.log("Configuration:");
    console.log(configuration);
    console.log("\n");

    var FlowEditorFields = ReactDOM.render(
        React.createElement(FlowEditor, {
            stageName: $("#stage-name").val(),
            stageType: "{{ $stage->type }}",

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

                            FlowEditorFields.clearRemoved();
                            $("#stage-submit-warning-modal #submit-changes-override").unbind("click");
                        },
                        error: function(data) {

                            console.log(data);

                            var modalDOM = $("#stage-submit-error-modal");
                            var list = modalDOM.find("#errors-list");

                            list.empty();

                            if(data.hasOwnProperty('responseJSON')) {
                                if(data.responseJSON.hasOwnProperty('status') && data.responseJSON.hasOwnProperty('message')) {
                                    // Manual error
                                    list.append("<li>" + data.responseJSON.message + "</li>");
                                } else {
                                    console.log("Laravel error");
                                    // Laravel error
                                    for(var key in data.responseJSON) {
                                        console.log(data.responseJSON[key]);
                                        (data.responseJSON[key]).map(function(error, index) {
                                            list.append("<li>" + error + "</li>");
                                        });
                                    }
                                }
                            } else {
                                console.log(data);
                                list.append("<li>A fatal internal error occurred.</li>");
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
