<script type="text/javascript" src="{{ asset('/assets/jquery/jquery-2.1.4.min.js') }}"></script>
<link rel="stylesheet" type="text/css" href="{{ asset('/assets/font-awesome-4.5.0/css/font-awesome.min.css') }}" />
<?php
switch($type) {
    case "main":
        ?>
        @if(env('APP_ENV', 'local') === "production")
            <script type="text/javascript" src="{{ asset('/assets/js/vendor.min.js') }}"></script>
            <script type="text/javascript" src="{{ asset('/assets/js/compiled.min.js') }}"></script>
            <link rel="stylesheet" href="{{ asset('/assets/css/template.min.css') }}" />
        @else
            <script type="text/javascript" src="{{ asset('/assets/js/vendor.js') }}"></script>
            <script type="text/javascript" src="{{ asset('/assets/js/compiled.js') }}"></script>
            <link rel="stylesheet" href="{{ asset('/assets/css/template.css') }}" />
        @endif
        <?php
        break;
    case "basic"
        ?>
        @if(env('APP_ENV', 'local') === "production")
            <script type="text/javascript" src="{{ asset('/assets/js/vendor.min.js') }}"></script>
            <link rel="stylesheet" href="{{ asset('/assets/css/template-basic.min.css') }}" />
        @else
            <script type="text/javascript" src="{{ asset('/assets/js/vendor.js') }}"></script>
            <link rel="stylesheet" href="{{ asset('/assets/css/template-basic.css') }}" />
        @endif
        <?php
        break;
}
?>
