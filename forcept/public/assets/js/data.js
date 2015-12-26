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

DataDisplays.RangeModule = React.createClass({displayName: "RangeModule",

	render: function() {
		return (
			React.createElement("div", {className: "row date-range"}, 
				React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("span", {className: "input-group-addon"}, "From"), 
						React.createElement("input", {type: "datetime-local", className: "form-control", placeholder: "Date", value: this.props.from, onChange: this.props.onChangeFrom})
					)
				), 
				React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("span", {className: "input-group-addon"}, "To"), 
						React.createElement("input", {type: "datetime-local", className: "form-control", placeholder: "Date", value: this.props.to, onChange: this.props.onChangeTo})
					)
				)
			)
		);
	}
});

/*
 * Flow Overview
 *
 * Properties:
 *
 */
DataDisplays.FlowOverview = React.createClass({displayName: "FlowOverview",

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
			React.createElement("blockquote", {className: "blockquote", id: "display-flow-overview"}, 
				React.createElement("h2", null, "Flow overview"), 
				React.createElement("hr", null), 
				React.createElement("div", {className: "row"}, 
					Object.keys(this.state.stages).map(function(stageID, index) {
						return (
							React.createElement("div", {className: "col-xs-12 col-sm-6 col-md-4", key: "flow-overview-stage-" + index}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("h4", {className: "card-title text-xs-center m-b"}, 
											this.state.stages[stageID].name
										), 
										React.createElement("hr", null), 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-xs-12 col-sm-6 text-xs-center"}, 
												React.createElement("h2", null, React.createElement("span", {className: "label label-primary label-rounded"}, this.state.stages[stageID]['visits'])), 
												React.createElement("h5", {className: "text-muted"}, "visit", this.state.stages[stageID]['visits'] == 1 ? "" : "s")
											), 
											React.createElement("div", {className: "col-xs-12 col-sm-6 text-xs-center"}, 
												React.createElement("h2", null, React.createElement("span", {className: "label label-primary label-rounded"}, this.state.stages[stageID]['patients'])), 
												React.createElement("h5", {className: "text-muted"}, "patient", this.state.stages[stageID]['patients'] == 1 ? "" : "s")
											)
										)
									)
								)
							)
						);
					}.bind(this))
				), 
				React.createElement("hr", null), 
				React.createElement(DataDisplays.RangeModule, {
					from: this.state.from, 
					to: this.state.to, 
					onChangeFrom: this.changeFromDate, 
					onChangeTo: this.changeToDate})
			)
		);

	}

});


DataDisplays.PatientAggregate = React.createClass({displayName: "PatientAggregate",

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
			React.createElement("blockquote", {className: "blockquote"}, 
				React.createElement("h2", null, "Patient aggregate data by stage"), 
				React.createElement("hr", null), 
				React.createElement("div", {className: "row"}, 
					this.state.stages.map(function(stage, index) {
						return (
							React.createElement("div", {className: "col-xs-12 col-sm-6 col-md-4 col-lg-3", key: "patient-aggregate-stage-" + index}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("h4", {className: "card-title text-xs-center"}, 
											stage.name
										)
									), 
									React.createElement("ul", {className: "list-group list-group-flush"}, 
										Object.keys(stage.data).map(function(fieldID) {
											var dataSet = stage.data[fieldID];
											return (
												React.createElement("li", {className: "list-group-item data-points-list", key: "patient-aggregate-field-" + fieldID}, 
													React.createElement("ul", {className: "list-unstyled"}, 
														React.createElement("li", {className: "bg-secondary"}, 
															React.createElement("h6", {className: "m-a-0"}, 
																stage.fields[fieldID].name
															)
														), 
														Object.keys(dataSet).map(function(dataPoint) {
															var point;
															if(dataPoint.length > 0) {
																point = dataPoint;
															} else {
																point = (
																	React.createElement("em", null, "No data")
																);
															}
															return (
																React.createElement("li", {className: "data-point-list-item text-xs-left"}, 
																	point, 
																	React.createElement("span", {className: "label label-primary pull-right"}, 
																		dataSet[dataPoint]
																	)
																)
															);
														})
													)
												)
											);
										}.bind(this))
									)
								)
							)
						);
					}.bind(this))
				), 
				React.createElement("hr", null), 
				React.createElement(DataDisplays.RangeModule, {
					from: this.state.from, 
					to: this.state.to, 
					onChangeFrom: this.changeFromDate, 
					onChangeTo: this.changeToDate})
			)
		);
	},

});