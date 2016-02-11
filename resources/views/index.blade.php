@extends('templates/main')

@section('page-title', 'Home - Forcept')

@section('content')

<div class="container-fluid">
    <div class="row" id="page-header">
        <div class="col-xs-12">
            <h4>
                <span class="fa fa-thumbs-o-up"></span>
                Welcome back, {{ Auth::user()->username }}
            </h4>
        </div>
    </div>
    <div class="row" id="page-header-secondary">
        <div class="col-xs-12">
            <ul class="nav nav-pills" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" data-toggle="tab" role="tab" href="#flow-overview">Flow overview</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" role="tab" href="#patient-aggregate">Patient aggregate data by stage</a>
                </li>
            </ul>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
            <div class="tab-content">
                <div class="tab-pane active" id="flow-overview" role="tabpanel">
                    <div id="data-flow-overview"></div>
                </div>
                <div class="tab-pane" id="patient-aggregate" role="tabpanel">
                    <div id="data-patient-aggregate"></div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script type="text/javascript">
	var DataFlowOverview = ReactDOM.render(
	    React.createElement(DataDisplays.FlowOverview),
	    document.getElementById("data-flow-overview")
	);

	var DataPatientAggregate = ReactDOM.render(
	    React.createElement(DataDisplays.PatientAggregate),
	    document.getElementById("data-patient-aggregate")
	);
</script>

@endsection
