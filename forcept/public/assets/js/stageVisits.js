/**
 * stageVisits.jsx
 */


var StageVisits = React.createClass({displayName: "StageVisits",

	getInitialState: function() {
		return {
			isFetching: true,
			visits: {}
		};
	},

	componentWillMount: function() {
		this.fetchVisits();
		setInterval(function() {
			this.fetchVisits();
		}.bind(this), 3000);
	},

	fetchVisits: function() {
		$.ajax({
			type: "GET",
			url: "/visits/fetch/" + this.props.stage.id,
			success: function(resp) {
				console.log(resp);
				if(resp.hasOwnProperty('visits')) {
					console.log("fetchVisits returned visits");
					this.setState({ visits: resp.visits }, function() {
						__debug(this.state);
					}.bind(this));
				} else {
					console.log("fetchVisits returned NO visits");
					this.setState({ visits: {} });
				}
			}.bind(this),
			complete: function(resp) {
				this.setState({ isFetching: false });
			}.bind(this)
		});
	},

	render: function() {

		var visits;
		var visitKeys = Object.keys(this.state.visits);
		if(visitKeys.length > 0) {

			// Show visits
			visitsDOM = visitKeys.map(function(visitID, index) {

				var visit = this.state.visits[visitID];

				// Map patients for this visit
				var patients = visit.patients.map(function(patientID, patientIndex) {

					// If the patient has a patient_models object
					if(visit.patient_models.hasOwnProperty(patientID.toString())) {
						var patient = visit.patient_models[patientID.toString()];

						//var priorityNotification;
						/*if(patient.hasOwnProperty('priority') && patient.priority !== null) {
							switch(patient['priority'].toLowerCase()) {
								case "high":
									priorityNotification = (
										<div className="card-block bg-warning">
											<small>Priority: <strong>high</strong></small>
										</div>
									);
									break;
								case "urgent":
									priorityNotification = (
										<div className="card-block bg-danger">
											<small>Priority: <strong>urgent</strong>!</small>
										</div>
									);
									break;
							}
						}*/

						return (
							React.createElement("div", {className: "col-sm-12 col-md-4", key: "patient-col-" + patientID}, 
								React.createElement("div", {className: "card forcept-patient-nametag"}, 
									React.createElement("div", {className: "card-header"}, 
										React.createElement("h5", {className: "card-title"}, 
											React.createElement("span", {className: "label label-default pull-right"}, patientID), 
											React.createElement("span", {className: "label label-primary pull-right"}, "#", patientIndex + 1), 
											React.createElement("span", {className: "title-content"}, (patient["full_name"] !== null && patient["full_name"].length > 0) ? patient["full_name"] : "Unnamed patient")
										)
									)
									/*priorityNotification*/
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
							React.createElement("div", {className: "col-xs-12 col-sm-8"}, 
								React.createElement("h2", null, 
									React.createElement("label", {className: "label label-default", "data-toggle": "tooltip", "data-placement": "top", title: "Visit ID"}, visit.id), 
									"  ", visit.patients.length, " patient", visit.patients.length == 1 ? "" : "s"
								)
							), 
							React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
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
					React.createElement("h1", {className: "p-l text-xs-center"}, this.props.stage.name, ": ", this.state.visits.length, " active visit", this.state.visits.length == 1 ? "" : "s"), 
					React.createElement("hr", null), 
					visitsDOM, 
					fetching
				)
			)
		);
	}

});