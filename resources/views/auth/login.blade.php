@extends('templates/basic')

@section('page-title', 'Log in to Forcept')

@section('content')

<!--| Login page container |-->
<div class="container-fluid">

	<div class="row">

		<!--| Login column |-->
		<div class="col-md-4 col-md-push-4 col-sm-12 p-t-1">

			@if (count($errors) > 0)
				<div class="alert alert-danger" role="alert">
					<strong>Uh oh!</strong>
					<ul>
					@foreach ($errors->all() as $error)
						<li>{{ $error }}</li>
					@endforeach
					</ul>
				</div>
			@endif

			<!--| Login card |-->
			<div class="card">
				<h4 class="card-header">Login to Forcept</h4>
				<div class="card-block">
					<form action="{{ route('auth::login') }}" method="POST">
						{!! csrf_field() !!}
						<fieldset class="form-group">
							<!-- <label for="exampleInputEmail1">Username</label> -->
							<input type="text" name="username" class="form-control form-control-lg" id="exampleInputEmail1" placeholder="Enter username">
							<!-- <small class="text-muted">We'll never share your email with anyone else.</small> -->
						</fieldset>
						<fieldset class="form-group">
							<!-- <label for="exampleInputPassword1">PIN</label> -->
							<input type="password" name="password" class="form-control form-control-lg" id="exampleInputPassword1" placeholder="Enter PIN">
						</fieldset>
  						<button type="submit" class="btn btn-primary btn-lg btn-block">Log in to Forcept</button>
					</form>
				</div>
			</div>

		</div>	

	</div>

</div>
@endsection