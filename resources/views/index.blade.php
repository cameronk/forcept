@extends('templates/main')

@section('page-title', 'Home - Forcept')

@section('content')
	
<div class="container-fluid" id="page-content">
    <h1 class="m-t">Welcome back, {{ Auth::user()->username }}</h1> 
    <hr/>
    <div id="data-flow-overview"></div>
    <hr/>
    <div id="data-patient-aggregate"></div>
</div>

@endsection

@section('scripts')
<script type="text/javascript" src="{{ asset('assets/js/data.js') }}"></script>
<script type="text/javascript">
    
var DataFlowOverview = ReactDOM.render(
    React.createElement(DataDisplays.FlowOverview, {
        
    }), 
    document.getElementById("data-flow-overview")
);
    
var DataPatientAggregate = ReactDOM.render(
    React.createElement(DataDisplays.PatientAggregate, {
        
    }), 
    document.getElementById("data-patient-aggregate")
);
    
</script>

@endsection