/**
 * data-displays/DataDisplays.jsx
 */

var DataDisplays = {
	setupDates: function(module) {
		var oneWeekAgo = new Date();
			oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		module.setState({
			from: oneWeekAgo.toISOString().split(".")[0],
			to: new Date().toISOString().split(".")[0]
		}, function() {
			module.update();
		});
	}
};

DataDisplays.RangeModule = React.createClass({

	render: function() {
		return (
			<div className="row date-range">
				<div className="col-xs-12 col-sm-6">
					<div className="input-group">
						<span className="input-group-addon">From</span>
						<input type="datetime-local" className="form-control" placeholder="Date" value={this.props.from} onChange={this.props.onChangeFrom} />
					</div>
				</div>
				<div className="col-xs-12 col-sm-6">
					<div className="input-group">
						<span className="input-group-addon">To</span>
						<input type="datetime-local" className="form-control" placeholder="Date" value={this.props.to} onChange={this.props.onChangeTo} />
					</div>
				</div>
			</div>
		);
	}
});
