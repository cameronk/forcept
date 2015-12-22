<!DOCTYPE html>
<html lang="en">

<head>
    <!--| IMPORTANT meta tags |-->
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>@yield('page-title', 'Forcept')</title>
    
    <!--| Stylesheets |-->
    <link href="{{ asset('/assets/css/template.css') }}" rel="stylesheet" />

    
    <!--| Base scripts |-->
    <script type="text/javascript" src="{{ asset('/assets/js/jquery-2.1.4.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/assets/bootstrap/dist/js/bootstrap.js') }}"></script>       
    <script type="text/javascript" src="{{ asset('/assets/tether-1.1.1/dist/js/tether.js') }}"></script>  
    <script type="text/javascript" src="{{ asset('/assets/js/react.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/assets/js/react-dom.js') }}"></script> 
    <script type="text/javascript" src="{{ asset('/assets/js/forcept.js') }}"></script>    
    
</head>
<body>
     
    
<div class="container-fluid p-a-0">
    
    <!--| Navigation: mobile |-->
    <nav class="navbar navbar-fixed-top navbar-dark hidden-md-up bg-primary p-a-0" id="navbar-mobile">
    
        <!--| Collapsible nav |-->
        <div class="collapse" id="navbarCollapsed">
            
            <!--| nav links | -->
            <ul class="nav nav-pills nav-stacked">
                <li class="nav-item">
                    <a href="#" class="nav-link active">Triage</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">Medical</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">Pharmacy</a>
                </li>
            </ul>
            
        </div>
        
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapsed">&#9776;</button>
    </nav>
    
    <!--| Navigation: desktop |-->
    <nav class="navbar navbar-fixed-top navbar-dark hidden-sm-down bg-primary p-a-0" id="navbar-desktop">
    
        <a href="#" class="navbar-brand p-a">forcept</a>
        
        <!--| nav links | -->
        <ul class="nav navbar-nav">
            <li class="nav-item">
                <a href="#" class="nav-link active">Triage</a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link">Medical</a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link">Pharmacy</a>
            </li>
            
            <li class="nav-item pull-right dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-user"></span> {{ Auth::user()->username }}</a>
                <div class="dropdown-menu">
                    
                    @if(Auth::user()->admin == true)
                        <a class="dropdown-item" href="{{ route('console::index') }}">Manage Forcept</a>
                        <div class="dropdown-divider"></div>
                    @endif
                    <a class="dropdown-item" href="{{ route('auth::logout') }}"><span class="glyphicon glyphicon-off"></span> Sign out</a>
                </div>
            </li>
            
        </ul>
        
    </nav>
    
</div>
    
@yield('content')

<div class="container-fluid" id="footer">
    <div class="col-sm-12">
        <button type="button" class="btn btn-sm btn-success" id="forcept-launch-debug">Debug</button>
        <h4 class="m-0 pull-right">
            forcept &nbsp; 
            <span class='label label-info'>version: {{ env('APP_VERSION', '?') }}</span>
            <span class="label label-info">env: {{ env('APP_ENV') }}</span>
        </h4>
    </div>
</div>

<script>
$(function() {
    
    // Initialize all tooltips
    $('[data-toggle="tooltip"]').tooltip();
    
    // Show debug area
    $("#forcept-launch-debug").on('click', function() {
        $("#forcept-debug-content").toggleClass('hidden'); 
    });
});
</script>
    
<div class="container-fluid hidden" id="forcept-debug-content">
    <div class="col-sm-12 p-t">
        <h1>Debug output</h1>
        <pre><code></code></pre>
    </div>
</div>

</body>
        
</html>