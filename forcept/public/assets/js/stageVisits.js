/**
 * stageVisits.jsx
 */


var StageVisits = React.createClass({displayName: "StageVisits",

	getInitialState: function() {
		return {
			isFetching: true,
			visits: []
		};
	},

	componentWillMount: function() {
		this.fetchVisits();
		setInterval(function() {
			this.fetchVisits();
		}.bind(this), 3000);
	},

	fetchVisits: function() {
		// this.setState({ isFetching: true });
		$.ajax({
			type: "GET",
			url: "/visits/fetch/" + this.props.stage.id,
			success: function(resp) {
				console.log(resp);
				if(resp.hasOwnProperty('visits')) {
					console.log("fetchVisits returned visits");
					this.setState({ visits: resp.visits });
				} else {
					console.log("fetchVisits returned NO visits");
					this.setState({ visits: [] });
				}
			}.bind(this),
			complete: function(resp) {
				this.setState({ isFetching: false });
			}.bind(this)
		});
	},

	render: function() {

		var visits;
		if(this.state.visits.length > 0) {

			// Show visits
			visitsDOM = this.state.visits.map(function(visit, index) {

				// Map patients for this visit
				var patients = visit.patients.map(function(patientID, patientIndex) {

					// If the patient has a patient_models object
					if(visit.patient_models.hasOwnProperty(patientID)) {
						var patient = visit.patient_models[patientID];

						var priorityNotification;
						if(patient.hasOwnProperty('priority') && patient.priority !== null) {
							switch(patient['priority'].toLowerCase()) {
								case "high":
									priorityNotification = (
										React.createElement("div", {className: "card-block bg-warning"}, 
											React.createElement("small", null, "Priority: ", React.createElement("strong", null, "high"))
										)
									);
									break;
								case "urgent":
									priorityNotification = (
										React.createElement("div", {className: "card-block bg-danger"}, 
											React.createElement("small", null, "Priority: ", React.createElement("strong", null, "urgent"), "!")
										)
									);
									break;
							}
						}

						return (
							React.createElement("div", {className: "col-sm-12 col-md-4", key: "patient-col-" + patientID}, 
								React.createElement("div", {className: "card forcept-patient-summary-card"}, 
									React.createElement("div", {className: "card-header"}, 
										React.createElement("h5", {className: "card-title"}, 
											React.createElement("span", {className: "label label-default pull-right"}, patientID), 
											React.createElement("span", {className: "label label-primary pull-right"}, "#", patientIndex + 1), 
											React.createElement("span", {className: "title-content"}, (patient["full_name"] !== null && patient["full_name"].length > 0) ? patient["full_name"] : "Unnamed patient")
										)
									), 
									priorityNotification
								)
							)
						);
					} else {
						// Apparently we're missing this patients data
						return (
							React.createElement("div", {className: "col-sm-12 col-md-4", key: "patient-col-" + patientID}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "alert alert-danger"}, 
										React.createElement("strong", null, "Uh oh:"), " an error occurred.", React.createElement("br", null), 
										React.createElement("em", null, "Missing data for patient ", patientID)
									)
								)
							)
						);
					}
					
				}.bind(visit));
	
				// Return the visit block
				return (
					React.createElement("blockquote", {className: "blockquote", key: "visit-" + index}, 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-12 col-sm-9"}, 
								React.createElement("h2", null, 
									React.createElement("label", {className: "label label-default", "data-toggle": "tooltip", "data-placement": "top", title: "Visit ID"}, visit.id), 
									"  ", visit.patients.length, " patient", visit.patients.length == 1 ? "" : "s"
								)
							), 
							React.createElement("div", {className: "col-xs-12 col-sm-3"}, 
								React.createElement("a", {href: "/visits/stage/" + this.props.stage.id + "/handle/" + visit.id, className: "btn btn-primary btn-block btn-lg"}, "Handle visit #", visit.id, " »")
							)
						), 
						React.createElement("div", {className: "row p-t"}, 
							patients
						), 
						React.createElement("hr", {className: "m-b-0"})
					)
				);
				
			}.bind(this));

		} else {
			visitsDOM = (
				React.createElement("div", {className: "alert alert-info"}, 
					"There are currently no visits in this stage."
				)
			);
		}

		var fetching;
		if(this.state.isFetching) {
			fetching = (
				React.createElement("img", {src: "/assets/img/loading.gif"}) 
			);
		}

		return (
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col-xs-12"}, 
					React.createElement("h1", {className: "p-l text-xs-center"}, this.state.visits.length, " active visit", this.state.visits.length == 1 ? "" : "s", " for stage \"", this.props.stage.name, "\""), 
					React.createElement("hr", null), 
					visitsDOM, 
					fetching
				)
			)
		);
	}

});