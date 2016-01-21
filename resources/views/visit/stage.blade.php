@extends("templates/main")

@section("page-title", $stage->name . " - Forcept")

@section("content")

<div class="container-fluid p-t" id="page-content">
    <h1 class="text-center m-t p-t">
        <img src="{{ asset('assets/img/loading.gif') }}" class="p-r" />
        One moment, loading visits for "{{ $stage->name }}"...
    </h1>
</div>

@endsection

@section("scripts")
<script type="text/javascript">

var ThisStageVisits = ReactDOM.render(
    React.createElement(StageVisits, {
        stage: <?php echo $stage->toJson(); ?>
    }),
    document.getElementById("page-content")
);

</script>
@endsection
