@extends('templates/main')

@section('page-title', 'Forcept Console')

@section('content')

<!--| console::index container |-->
<div class="container-fluid" id="page-content">
    <div class="row">
        
        <!--| Sidebar |-->
        <div class="col-xs-12 col-sm-12 col-md-4 col-xl-3">
            
            <!--| Settings card |-->
            <div class="card">
                
                <div class="card-header">
                    <strong>Settings</strong>
                </div>
                
                <div class="list-group list-group-flush">
                    
                    <?php
                    $nav = [
                        "Console home" => [ route('console::index'), Request::is('console') ],
                        "Patient flow" => [ route('console::flow::index'), Request::is('console/flow') || Request::is('console/flow/*') ],
                        "User management" => [ route('console::users::index'), Request::is('console/users') || Request::is('console/users/*') ]
                    ];
                    ?>
                    
                    @foreach($nav as $name => $data)
                        <a href="{{ $data[0] }}" class="list-group-item{{ $data[1] ? ' active' : '' }}">{{ $name }}</a>
                    @endforeach

                </div>
            </div>
        </div>
        
        <!--| Main content area |-->
        <div class="col-xs-12 col-sm-12 col-md-8 col-xl-9">
            
            @if(Session::has('alert'))
                <?php $alert = Session::get('alert'); ?>
                <!--| Console template - alert section |-->
                <div class="alert alert-{{ $alert['type'] == 'failure' ? 'danger' : $alert['type'] }} m-t">
                    <strong>{{ $alert['type'] == 'success' ? 'Awesome!' : 'Heads up!' }}</strong> {{ $alert['message'] }}
                </div>
            @endif
            
            @if(count($errors) > 0)
                <!--| Console template - error section |-->
				<div class="alert alert-danger m-t" role="alert">
					<strong>Uh oh!</strong>
					<ul>
					@foreach ($errors->all() as $error)
						<li>{{ $error }}</li>
					@endforeach
					</ul>
				</div>
			@endif
            
            @yield('console-content')
            
        </div>
    </div>
    
</div>

@endsection