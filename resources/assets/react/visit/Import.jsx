/**
 * visit/Import.jsx
 * @author Cameron Kelley
 *
 * Properties:
 */
Visit.ImportBlock = React.createClass({

	getInitialState: function() {
		return {
			display: 'form',
			patientsFound: [],

			name: null,
			forceptID: null,
			fieldNumber: null,
		}
	},

	handleInputChange: function(input) {
		return function(event) {
			var state = this.state;
				state[input] = event.target.value;
			this.setState(state);
		}.bind(this);
	},

	handleSearch: function(type) {
		this.setState({
			display: 'searching'
		});

		$.ajax({
			type: "POST",
			url: "/patients/search",
			data: {
				_token: this.props._token,
				by: type,
				for: this.state[type]
			},
			success: function(resp) {
				this.setState({
					display: 'results',
					patientsFound: resp.patients
				});
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {

			}
		});
	},
	handlePatientAdd: function(patient) {
		return function(event) {
			this.props.onPatientAdd(patient);
			this.resetDisplay();
		}.bind(this);
	},

	resetDisplay: function() {
		this.setState(this.getInitialState());
	},

	doSearchName: function() {
		this.handleSearch("name");
	},
	doSearchForceptID: function() {
		this.handleSearch("forceptID");
	},
	doSearchFieldNumber: function() {
		this.handleSearch("fieldNumber");
	},

	render: function() {

		var state = this.state,
			props = this.props,
			display;

		switch(state.display) {
			case "form":
				display = (
					<fieldset className="form-group m-b-0">
						<label className="form-control-label hidden-sm-up">...by field number:</label>
						<div className="input-group input-group-lg m-b">
	    					<input type="number" className="form-control" placeholder="Search for a patient by field number..." value={state.fieldNumber} onChange={this.handleInputChange("fieldNumber")} />
							<span className="input-group-btn">
								<button className="btn btn-secondary" type="button" disabled={state.fieldNumber == null} onClick={this.doSearchFieldNumber}>Search</button>
							</span>
						</div>
						<label className="form-control-label hidden-sm-up">...by Forcept ID:</label>
						<div className="input-group input-group-lg m-b">
	    					<input type="number" className="form-control" placeholder="Search for a patient by Forcept ID..." min="100000" value={state.forceptID} onChange={this.handleInputChange("forceptID")} />
							<span className="input-group-btn">
								<button className="btn btn-secondary" type="button" disabled={state.forceptID == null} onClick={this.doSearchForceptID}>Search</button>
							</span>
						</div>
						<label className="form-control-label hidden-sm-up">...by first or last name:</label>
						<div className="input-group input-group-lg">
	    					<input type="text" className="form-control" placeholder="Search for a patient by first or last name..." value={state.name} onChange={this.handleInputChange("name")} />
							<span className="input-group-btn">
								<button className="btn btn-secondary" type="button" disabled={state.name == null || state.name.length == 0} onClick={this.doSearchName}>Search</button>
							</span>
						</div>
					</fieldset>
				);
				break;
			case "searching":
				display = (
					<h2>
						<img src="/assets/img/loading.gif" className="m-r" />
					</h2>
				);
				break;
			case "results":
				if(state.patientsFound.length == 0) {
					display = (
						<div className="alert alert-info">
							No patients found. <a className="alert-link" onClick={this.resetDisplay}>Try again?</a>
						</div>
					)
				} else {
					display = (
						<div className="row">
							{state.patientsFound.map(function(patient, index) {
								var currentVisit,
									disabled = false;
								if(patient.hasOwnProperty('current_visit') && patient.current_visit !== null) {
									disabled = true;
									currentVisit = (
										<li className="list-group-item bg-danger">
											<small>Patient currently in a visit!</small>
										</li>
									);
								} else if(patient.hasOwnProperty('used') && patient.used !== null) {
									if(patient.used) {
										currentVisit = (
											<li className="list-group-item">
												<h6>Note: this record is associated with the following user ID:</h6>
												<span className="label label-default">{patient.used}</span>
											</li>
										)
									}
								}
								return (
									<div className="col-xs-12 col-sm-6" key={"patients-found-" + index}>
										<div className="card">
											<div className="card-header">
												<h5 className="card-title">
													<span className="label label-default pull-right">{patient.hasOwnProperty('field_number') ? patient.field_number : patient.id}</span>
													<span className="label label-primary pull-right">#{index + 1}</span>
													<span className="title-content">{Utilities.getFullName(patient)}</span>
												</h5>
											</div>
											<ul className="list-group list-group-flush">
												{currentVisit}
											</ul>
											<div className="card-block">
												<button type="button" className="btn btn-block btn-primary" disabled={disabled} onClick={this.handlePatientAdd(patient)}>
													{'\u002b'} Add
												</button>
											</div>
										</div>
									</div>
								);
							}.bind(this))}
							<div className="col-xs-12 col-sm-6">
								<div className="card">
									<div className="card-block">
										<button type="button" className="btn btn-block btn-secondary" onClick={this.resetDisplay}>
											{'\u21b5'} Go back
										</button>
									</div>
								</div>
							</div>
						</div>
					);
				}

				break;
			default:
				break;
		}

		return (
			<blockquote className="blockquote">
				<h3>
					{'\u21af'} Import a patient
					<button type="button" className="close pull-right" aria-label="Close" onClick={props.onClose}>
					    <span aria-hidden="true">&times;</span>
					 </button>
				</h3>
				<hr/>
				{display}
			</blockquote>
		);
	}
});
