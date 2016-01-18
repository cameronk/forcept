<html lang="en">

<head>
    <!--| IMPORTANT meta tags |-->
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>@yield('page-title', 'Forcept')</title>

    @include('components/assets', ['type' => 'basic'])
    
</head>
<body>

@yield('content')

</body>
</script>
