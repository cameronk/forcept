@extends("templates/main")

@section("page-title", "Handle visit / " . $stage->name . " - Forcept")

@section("content")

<!--| visit container |-->
<div class="container-fluid" id="page-content"></div>

@endsection

@section("scripts")
<script type="text/javascript">
var HandleVisit = ReactDOM.render(
    React.createElement(Visit, {

        "_token": "{{ csrf_token() }}",
        "containerTitle" : "Handle visit #{{ $visit->id }} in {{ $stage->name }}",
        "controlsType": "stage-visit",
        "redirectOnFinish": "{{ url('visits/stage/' . $stage->id . '-'. str_slug($stage->name)) }}",

        "visitID": {{ $visit->id }},
        "patients": <?php echo $patients; ?>,
        "stages": <?php echo $stages; ?>,
        "currentStage": {{ $stage->id }},
        "currentStageType": "{{ $stage->type }}",

        "mutableFields": <?php echo $mutableFields ?>,
        "patientFields": <?php echo $patientFields ?>,
        "summaryFields": <?php echo $summaryFields ?>

    }),
    document.getElementById('page-content')
);
</script>
@endsection
