<html lang="en">

<head>
    <!--| IMPORTANT meta tags |-->
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>@yield('page-title', 'Forcept')</title>
    
    <!--| Stylesheets |-->
    <link href="{{ asset('/assets/css/template-basic.css') }}" rel="stylesheet" />

    
    <!--| Base scripts |-->
    <script type="text/javascript" src="{{ asset('/assets/js/jquery-2.1.4.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/assets/bootstrap/dist/js/bootstrap.min.js') }}"></script>
    
</head>
<body>
     
@yield('content')

</body>
</script>