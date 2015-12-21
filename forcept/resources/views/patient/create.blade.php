@extends('templates/main')

@section('content')
<div class="container-fluid" id="page-content">
    <div class="row">
        
        <!--| Sidebar |-->
        <div class="col-xs-12 col-sm-12 col-md-4 col-xl-3">
            
            <!--| Patient card |-->
            <div class="card" id="card-patient">
                
                <div class="card-header">
                    <strong>Patient bio</strong>
                </div>
                
                <div class="card-block">
                    <h4 class="card-title"><strong>John Doe</strong></h4>
                    <h6 class="card-subtitle">ID: 10640</h6>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <span class="label label-default label-pill pull-right">Parish</span>
                        Gobert
                    </li>
                    <li class="list-group-item">
                        <span class="label label-default label-pill pull-right">Parish</span>
                        Gobert
                    </li>
                    <li class="list-group-item">
                        <span class="label label-default label-pill pull-right">Parish</span>
                        Gobert
                    </li>
                    <li class="list-group-item">
                        <span class="label label-default label-pill pull-right">Parish</span>
                        Gobert
                    </li>
                </ul>
            </div>
        </div>
        <!--| Main content area |-->
        <div class="col-xs-12 col-sm-12 col-md-8 col-xl-9">
            
            <h1 class="p-t">New patient</h1>
            <hr/>
            
        </div>
    </div>
    
</div>
@endsection