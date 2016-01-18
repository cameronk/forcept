@extends("templates/main")

@section("page-title", "Patients - Forcept")

@section("content")

@endsection

<!--| patients table container |-->
<div class="container-fluid" id="page-content"></div>

@section("scripts")
<script type="text/javascript">

    var NewPatientsTable = ReactDOM.render(
        React.createElement(PatientsTable, {}),
        document.getElementById('page-content')
    );

</script>
@endsection
