/**
 * data.jsx
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

/*
 * Flow Overview
 *
 * Properties:
 *
 */
DataDisplays.FlowOverview = React.createClass({

	getInitialState: function() {
		return {
			stages: {}
		};
	},

	update: function() {
		$.ajax({
			type: "GET",
			url: "/data/visits/count",
			data: {
				from: this.state.from,
				to: this.state.to
			},
			success: function(resp) {
				this.setState({
					stages: resp.stages,
				});
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
			}
		});
	},

	componentWillMount: function() {
		DataDisplays.setupDates(this);
	},

	changeFromDate: function(event) {
		this.setState({
			from: event.target.value
		});
	},

	changeToDate: function(event) {
		this.setState({
			to: event.target.value
		});
	},

	render: function() {
		return (
			<blockquote className="blockquote" id="display-flow-overview">
				<h2>Flow overview</h2>
				<hr/>
				<div className="row">
					{Object.keys(this.state.stages).map(function(stageID, index) {
						return (
							<div className="col-xs-12 col-sm-6 col-md-4" key={"flow-overview-stage-" + index}>
								<div className="card">
									<div className="card-block">
										<h4 className="card-title text-xs-center m-b">
											{this.state.stages[stageID].name}
										</h4>
										<hr/>
										<div className="row">
											<div className="col-xs-12 col-sm-6 text-xs-center">
												<h2><span className="label label-primary label-rounded">{this.state.stages[stageID]['visits']}</span></h2>
												<h5 className="text-muted">visit{this.state.stages[stageID]['visits'] == 1 ? "" : "s"}</h5>
											</div>
											<div className="col-xs-12 col-sm-6 text-xs-center">
												<h2><span className="label label-primary label-rounded">{this.state.stages[stageID]['patients']}</span></h2>
												<h5 className="text-muted">patient{this.state.stages[stageID]['patients'] == 1 ? "" : "s"}</h5>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					}.bind(this))}
				</div>
				<hr/>
				<DataDisplays.RangeModule
					from={this.state.from}
					to={this.state.to}
					onChangeFrom={this.changeFromDate}
					onChangeTo={this.changeToDate} />
			</blockquote>
		);

	}

});


DataDisplays.PatientAggregate = React.createClass({

	getInitialState: function() {
		return {
			stages: [],
			charts: {}
		};
	},

	update: function() {
		$.ajax({
			type: "GET",
			url: "/data/patients/count",
			data: {
				from: this.state.from,
				to: this.state.to
			},
			success: function(resp) {
				console.log("Success");
				console.log(resp);

				var charts = {};
				resp.stages.map(function(stage) {
					// console.log(stage);
					for(var fieldID in stage.data) {

						var dataArray = [];
						for(var dataKey in stage.data[fieldID]) {
							dataArray.push(stage.data[fieldID][dataKey]);
						}

						charts[fieldID] = {
							chart: {
								type: 'bar',
							},
					        title: {
					            text: 'Fruit Consumption'
					        },
							xAxis: {
								categories: Object.keys(stage.data[fieldID])
							},
							yAxis: {
					            title: {
					                text: 'Fruit eaten'
					            }
					        },
							series: [{
								name: 'Series 1',
								data: dataArray
							}]
						};
					}
				});

				this.setState({
					stages: resp.stages,
					charts: charts
				});

			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
			}
		});
	},

	componentWillMount: function() {
		DataDisplays.setupDates(this);
	},

	componentDidMount: function() {
		this.renderCharts();
	},
	componentDidUpdate: function() {
		this.renderCharts();
	},

	changeFromDate: function(event) {
		this.setState({
			from: event.target.value
		});
	},

	changeToDate: function(event) {
		this.setState({
			to: event.target.value
		});
	},

	renderCharts: function() {
		setTimeout(function() {
			for(var domID in this.state.charts) {
				console.log("Rendering chart " + domID);
				console.log(this.state.charts[domID]);
				$("#datadisplays-patient-aggregate-field-" + domID).highcharts(this.state.charts[domID]);
			}
		}.bind(this), 5000);
	},

	render: function() {

		console.log(this.state);
		return (
			<blockquote className="blockquote">
				<h2>Patient aggregate data by stage</h2>
				<hr/>
				<div className="row">
					{this.state.stages.map(function(stage, index) {
						return (
							<div className="col-xs-12 col-sm-6 col-md-4 col-lg-3" key={"patient-aggregate-stage-" + index}>
								<div className="card">
									<div className="card-block">
										<h4 className="card-title text-xs-center">
											{stage.name}
										</h4>
									</div>
									<ul className="list-group list-group-flush">
										{Object.keys(stage.data).map(function(fieldID) {
											var dataSet = stage.data[fieldID];
											return (
												<li className="list-group-item data-points-list" key={"patient-aggregate-field-" + fieldID}>
													<ul className="list-unstyled">
														<li className="bg-secondary">
															<h6 className="m-a-0">
																{stage.fields[fieldID].name}
															</h6>
														</li>
														{Object.keys(dataSet).map(function(dataPoint) {
															var point;
															if(dataPoint.length > 0) {
																point = dataPoint;
															} else {
																point = (
																	<em>No data</em>
																);
															}
															return (
																<li className="data-point-list-item text-xs-left">
																	{point}
																	<span className="label label-primary pull-right">
																		{dataSet[dataPoint]}
																	</span>
																</li>
															);
														})}
													</ul>
												</li>
											);
										}.bind(this))}
									</ul>
								</div>
							</div>
						);
					}.bind(this))}
				</div>
				<hr/>
				<DataDisplays.RangeModule
					from={this.state.from}
					to={this.state.to}
					onChangeFrom={this.changeFromDate}
					onChangeTo={this.changeToDate} />
			</blockquote>
		);
	},

});