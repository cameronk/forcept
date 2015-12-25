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
							React.createElement("div", {className: "col-xs-12 col-sm-6 col-md-4 col-lg-3", key: "flow-overview-stage-" + index}, 
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
				// this.setState({
				// 	stages: resp.stages,
				// });
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
			React.createElement("blockquote", {className: "blockquote"}, 
				React.createElement("h2", null, "Patient aggregate data by stage"), 
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