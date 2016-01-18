@extends("templates/main")

@section("page-title", "New visit - Forcept")

@section("content")

<!--| new visit container |-->
<div class="container-fluid" id="page-content"></div>

@endsection

@section("scripts")
<script type="text/javascript">
    var NewVisit = ReactDOM.render(
        React.createElement(Visit, {

            "_token": "{{ csrf_token() }}",
            "containerTitle" : "Create a new visit",
            "controlsType": "new-visit",


            "visitID": null,
            "patients": null,
            "stages": <?php echo $stages; ?>,
            "currentStage": 1,
            "currentStageType": "basic",

            "mutableFields": <?php echo $mutableFields ?>,
            "patientFields": <?php echo $patientFields ?>,
            "summaryFields": {},

        }),
        document.getElementById('page-content')
    );
</script>
@endsection
