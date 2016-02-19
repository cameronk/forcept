<!DOCTYPE html>
<html lang="en">

<head>
    <title>@yield('page-title', 'Forcept')</title>

    <!--| IMPORTANT meta tags |-->
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" value="{{ csrf_token() }}" />

    @include('components/assets', ['type' => 'main'])
</head>
<body>

<!--| Header container |-->
<div class="container-fluid p-a-0">

    <!--| Navigation: mobile |-->
    <nav class="navbar navbar-fixed-top navbar-dark hidden-md-up bg-primary p-a-0" id="navbar-mobile">

        <!--| Collapsible nav |-->
        <div class="collapse" id="navbarCollapsed">

            <!--| nav links | -->
            <ul class="nav nav-pills nav-stacked">

                <li class="nav-item">
                    <a href="{{ route('index') }}" class="nav-link">Home</a>
                </li>

                @include('components/nav')
            </ul>

        </div>

        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapsed">&#9776;</button>
    </nav>

    <!--| Navigation: desktop |-->
    <nav class="navbar navbar-fixed-top navbar-dark hidden-sm-down bg-primary p-a-0" id="navbar-desktop">

        <a href="{{ route('index') }}" class="navbar-brand p-a">forcept</a>

        <!--| nav links | -->
        <ul class="nav navbar-nav">

            @include('components/nav')

            <li class="nav-item pull-right dropdown">
                <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-user"></span> {{ Auth::user()->username }}</a>
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


<!--| Yield: content |-->
<div id="page-content">
    @yield('content')
</div>


<!--| Footer |-->
<div class="container-fluid" id="footer">
    <div class="row">
        <div class="col-sm-2">
            <button type="button" class="btn btn-sm btn-success hidden-sm-down" id="forcept-launch-debug">Debug</button>
        </div>
        <div class="col-sm-6">
            <ul class="list-inline sizing">
                <li>
                    <span class="label label-default hidden-xs-only">XS</span>
                    <span class="label label-success hidden-sm-up">XS</span>
                </li>
                <li>
                    <span class="label label-default hidden-sm-only">SM</span>
                    <span class="label label-success hidden-md-up">SM</span>
                </li>
                <li>
                    <span class="label label-default hidden-md-only">MD</span>
                    <span class="label label-success hidden-lg-up">MD</span>
                </li>
                <li>
                    <span class="label label-default hidden-lg-only">LG</span>
                    <span class="label label-success hidden-xl-up">LG</span>
                </li>
                <li>
                    <span class="label label-default hidden-xl-only">XL</span>
                    <span class="label label-success">XL</span>
                </li>
            </ul>
        </div>
        <div class="col-sm-4">
            <h4 class="m-0 pull-right">
                forcept &nbsp;
                <span class='label label-info hidden-sm-down'>{{ config('app.version') }}</span>
                <span class="label label-info hidden-sm-down">{{ env('APP_ENV') }}</span>
            </h4>
        </div>
    </div>
</div>


<!--| Debug container |-->
<div class="container-fluid hidden" id="forcept-debug-content">
    <div class="col-sm-12 p-t">
        <h1>Debug output</h1>
        <pre></pre>
    </div>
</div>

<!--| Scripts |-->
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
@yield('scripts')

</body>

</html>
