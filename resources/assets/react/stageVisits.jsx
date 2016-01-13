/**
 * stageVisits.jsx
 */


var StageVisits = React.createClass({

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
									<small><em>No photo</em></small>
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
									<Fields.Resource
										id={resources[0]}
										resource={{ type: "image/jpeg" }}
										className="thumbnail" />
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
							<div className="col-xs-12 col-sm-6" key={"patient-row-" + patientID}>
								<div className="card">
									<div className="card-block">
										<div className="row">
											<div className="col-xs-12 col-sm-4">
												{patientPhoto}
											</div>
											<div className="col-xs-12 col-sm-8 p-t text-xs-center text-sm-left">
												<div>
													<span className="label label-primary">#{patientIndex + 1}</span>
													<span className="label label-default">{patientID}</span>
												</div>
												<h4 className="forcept-stagevisits-patient-name">
													{getName}
												</h4>
											</div>
										</div>
									</div>
									<ul className="list-group list-group-flush">
									    <li className="list-group-item">
											<span className={"label label-pill pull-right " + priorityClass}>{priority}</span>
											Priority
										</li>
									    <li className="list-group-item">
											<span className="label label-primary label-pill pull-right">{getAge}</span>
											Age
										</li>
									    <li className="list-group-item">
											<span className="label label-primary label-pill pull-right">{getCreatedAt}</span>
											Created
										</li>
									</ul>
								</div>
							</div>
						);

					} else {
						// Apparently we're missing this patients data
						return (
							<div className="col-sm-12 col-md-4" key={"patient-col-" + patientID}>
								<div className="card">
									<div className="alert alert-danger">
										<strong>Uh oh:</strong> an error occurred.<br/>
										<em>Missing data for patient {patientID}</em>
									</div>
								</div>
							</div>
						);
					}

				}.bind(visit));

				// Return the visit block
				return (
					<blockquote className="blockquote" key={"visit-" + index}>
						<div className="row">
							<div className="col-xs-12 col-sm-8">
								<h2>
									<label className="label label-default" data-toggle="tooltip" data-placement="top" title="Visit ID">{visit.id}</label>
									&nbsp; {visit.patients.length} patient{visit.patients.length == 1 ? "" : "s"}
								</h2>
							</div>
							<div className="col-xs-12 col-sm-4">
								<a href={"/visits/stage/" + this.props.stage.id + "/handle/" + visit.id} className="btn btn-primary btn-block btn-lg">Handle visit #{visit.id} &raquo;</a>
							</div>
						</div>
						<div className="row m-t">
							{patients}
						</div>
						<hr className="m-b-0" />
					</blockquote>
				);
				//
				// <div className="row p-t">
				// 	{patients}
				// </div>

			}.bind(this));

		} else {
			// Otherwise, no visits are present.
			visitsDOM = (
				<div className="alert alert-info">
					There are currently no visits in this stage.
				</div>
			);
		}

		if(this.state.isFetching) {
			fetching = (
				<img src="/assets/img/loading.gif" />
			);
		}

		return (
			<div className="row">
				<div className="col-xs-12">
					<h1 className="p-l text-xs-center">{this.props.stage.name}: {this.state.visits.length} active visit{this.state.visits.length == 1 ? "" : "s"}</h1>
					<hr/>
					{visitsDOM}
					{fetching}
				</div>
			</div>
		);
	}

});
