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
		}.bind(this), 5000);
	},

	fetchVisits: function() {
		$.ajax({
			type: "GET",
			url: "/visits/fetch/" + this.props.stage.id,
			success: function(resp) {
				if(resp.hasOwnProperty('visits')) {
					console.log("[StageVisits]->fetchVisits()");
					this.setState({ visits: resp.visits }, function() {
						__debug(this.state);
					}.bind(this));
				} else {
					console.log("[StageVisits]->fetchVisits(): empty response");
					this.setState({ visits: {} });
				}
			}.bind(this),
			complete: function(resp) {
				this.setState({ isFetching: false });
			}.bind(this)
		});
	},

	render: function() {

		var visitsDOM,
			fetching,
			visitKeys = Object.keys(this.state.visits);

		// If there are visits present...
		if(visitKeys.length > 0) {

			// Show visits
			visitsDOM = visitKeys.map(function(visitID, index) {

				// Cache this visit's data.
				var visit = this.state.visits[visitID];

				// Map patients for this visit
				var patients = visit.patients.map(function(patientID, patientIndex) {

					// If the patient has a patient_models object
					if(visit.patient_models.hasOwnProperty(patientID.toString())) {

						var patient = visit.patient_models[patientID.toString()],
							patientPhoto,
							// priorityNotification,
							priorityClass = "label-primary",
							priority = "Normal",
							noPhoto = function() {
								console.log("[StageVisits] patient #" + patientID + " does NOT have valid photo");
								patientPhoto = (
									React.createElement("small", null, React.createElement("em", null, "No photo"))
								);
							};

						if(patient.hasOwnProperty('photo') && patient.photo !== null) {
							console.log("[StageVisits] patient #" + patientID + " has photo attribute");

							var resources = [];
							try {
								resources = JSON.parse(patient.photo);
							} catch(e) {
								console.log("[StageVisits] error parsing photo of patient #" + patientID);
								console.log(e);
								resources = [];
							}

							if(Array.isArray(resources) && resources.length > 0) {
								patientPhoto = (
									React.createElement(Fields.Resource, {
										id: resources[0], 
										resource: { type: "image/jpeg"}, 
										className: "thumbnail"})
								);
							} else {
								noPhoto();
							}
						} else {
							noPhoto();
						}

						if(patient.hasOwnProperty('priority') && patient.priority !== null) {
							switch(patient.priority.toLowerCase()) {
								case "high":
									// priorityNotification = (
									// 	<div className="card-block bg-warning">
									// 		<small>Priority: <strong>high</strong></small>
									// 	</div>
									// );
									priority = "High";
									priorityClass = "label-warning";
									break;
								case "urgent":
									// priorityNotification = (
									// 	<div className="card-block bg-danger">
									// 		<small>Priority: <strong>urgent</strong>!</small>
									// 	</div>
									// );
									priority = "Urgent";
									priorityClass = "label-danger";
									break;
							}
						}

						var patientFullName = patient.hasOwnProperty("full_name") ? patient.full_name : null,
							patientBirthday = patient.hasOwnProperty("birthday") ? patient.birthday : null,
							patientCreatedAt = patient.hasOwnProperty("created_at") ? patient.created_at : null;

						var getName = (patientFullName !== null && patientFullName.length > 0) ? patientFullName : "Unnamed patient",
							getAge = (patientBirthday !== null && patientBirthday.length > 0) ? Utilities.calculateAge(patientBirthday) : "Unknown",
							getCreatedAt = (patientCreatedAt !== null && patientCreatedAt.length > 0) ? patientCreatedAt : "Unknown";

						return (
							React.createElement("div", {className: "col-xs-12 col-sm-6", key: "patient-row-" + patientID}, 
								React.createElement("div", {className: "card"}, 
									React.createElement("div", {className: "card-block"}, 
										React.createElement("div", {className: "row"}, 
											React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
												patientPhoto
											), 
											React.createElement("div", {className: "col-xs-12 col-sm-8 p-t text-xs-center text-sm-left"}, 
												React.createElement("div", null, 
													React.createElement("span", {className: "label label-primary"}, "#", patientIndex + 1), 
													React.createElement("span", {className: "label label-default"}, patientID)
												), 
												React.createElement("h4", {className: "forcept-stagevisits-patient-name"}, 
													getName
												)
											)
										)
									), 
									React.createElement("ul", {className: "list-group list-group-flush"}, 
									    React.createElement("li", {className: "list-group-item"}, 
											React.createElement("span", {className: "label label-pill pull-right " + priorityClass}, priority), 
											"Priority"
										), 
									    React.createElement("li", {className: "list-group-item"}, 
											React.createElement("span", {className: "label label-primary label-pill pull-right"}, getAge), 
											"Age"
										), 
									    React.createElement("li", {className: "list-group-item"}, 
											React.createElement("span", {className: "label label-primary label-pill pull-right"}, getCreatedAt), 
											"Created"
										)
									)
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
						React.createElement("div", {className: "row m-t"}, 
							patients
						), 
						React.createElement("hr", {className: "m-b-0"})
					)
				);
				//
				// <div className="row p-t">
				// 	{patients}
				// </div>

			}.bind(this));

		} else {
			// Otherwise, no visits are present.
			visitsDOM = (
				React.createElement("div", {className: "alert alert-info"}, 
					"There are currently no visits in this stage."
				)
			);
		}

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
