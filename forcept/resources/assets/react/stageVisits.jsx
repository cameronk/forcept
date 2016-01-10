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
							<div className="col-sm-12 col-md-4" key={"patient-col-" + patientID}>
								<div className="card forcept-patient-nametag">
									<div className="card-header">
										<h5 className="card-title">
											<span className="label label-default pull-right">{patientID}</span>
											<span className="label label-primary pull-right">#{patientIndex + 1}</span>
											<span className="title-content">{(patient["full_name"] !== null && patient["full_name"].length > 0) ? patient["full_name"] : "Unnamed patient"}</span>
										</h5>
									</div>
									{/*priorityNotification*/}
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
						<div className="row p-t">
							{patients}
						</div>
						<hr className="m-b-0" />
					</blockquote>
				);
				
			}.bind(this));

		} else {
			visitsDOM = (
				<div className="alert alert-info">
					There are currently no visits in this stage.
				</div>
			);
		}

		var fetching;
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