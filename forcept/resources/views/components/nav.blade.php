@inject('stages', 'App\Stage')

<li class="nav-item">
    <a href="{{ route('visits::create') }}" class="nav-link">&plus; New visit</a>
</li>

@foreach($stages->where('root', '!=', '1')->get() as $stage)
    @if(count($stage->fields) > 0)
        <li class="nav-item">
            <a href="#" class="nav-link">{{ $stage->name }}</a>
        </li>
    @else
        <li class="nav-item">
            <a href="#" class="nav-link disabled">{{ $stage->name }} (disabled)</a>
        </li>
    @endif
@endforeach