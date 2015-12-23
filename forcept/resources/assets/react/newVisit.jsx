/**
 * newVisit.jsx
 */

/*
 * Visit container
 */
var NewVisit = React.createClass({

	getInitialState: function() {
		return {
			patients: {},
		}
	},

	/*
	 * Handle addition of a new patient.
	 */
	handlePatientAdd: function(patient) {
		var patients = this.state.patients;

		if(patients.hasOwnProperty(patient.id)) {
			// Patient already in visit
		} else {
			// Update state with new patient
			patients[patient.id] = patient;
			this.setState({ patients: patients });
		}
	},

	render: function() {
		return (
			<div className="row">
				<NewVisit.PatientsOverview 
					fields={this.props.fields}
					patients={this.state.patients} />
				<NewVisit.PatientsContainer 
					_token={this.props._token}
					patients={this.state.patients}
					onPatientAdd={this.handlePatientAdd} />
			</div>
		)
	}

});

/*
 * Patients overview (left sidebar)
 */
NewVisit.PatientsOverview = React.createClass({

	componentWillMount: function() {

	},

	render: function() {

		console.log("Rendering patients overview with patient count " + Object.keys(this.props.patients).length);
		console.log(this.props.patients);

		var patientOverviews;
		var iterableFields = jQuery.extend({}, this.props.fields);
			delete iterableFields["first_name"];
			delete iterableFields["last_name"];

		// If there are patients in the props object
		if(Object.keys(this.props.patients).length > 0) {
			patientOverviews = Object.keys(this.props.patients).map(function(patientID, index) {
				var thisPatient = this.props.patients[patientID];
				return (
					<div className="card" key={patientID}>
		                <div className="card-header">
		                    <span className="label label-info">{index + 1}</span>
		                    <span className="label label-default">{patientID}</span> 
		                    &nbsp; <strong>{thisPatient['full_name'] !== null ? thisPatient['full_name'] : "Unnamed patient"}</strong>
		                </div>
		                <div className="list-group list-group-flush">
		                    {Object.keys(iterableFields).map(function(field, index) {
		                    	return (
		                    		<a className="list-group-item" key={field + "-" + index}>
		                    			<strong>{iterableFields[field]["name"]}</strong>: &nbsp;
		                    			{thisPatient.hasOwnProperty(field) && thisPatient['field'].length > 0 ? thisPatient['field'] : "No data"}
		                    		</a>
		                    	);
		                    })}
		                </div>
					</div>
				);
			}.bind(this));
		} else {
			patientOverviews = (
				<div className="alert alert-info">
					No patients added yet.
				</div>
			);
		}

		return (
	        <div className="col-xs-12 col-sm-12 col-md-4 col-xl-3">
	           {patientOverviews}
	        </div>
	    );
	}

});

/* 
 * Patients management (main content)
 */
NewVisit.PatientsContainer = React.createClass({

	getInitialState: function() {
		return {
			isLoading: false
		}
	},

	isLoading: function() {
		this.setState({ isLoading: true });
	},

	isDoneLoading: function() {
		this.setState({ isLoading: false });
	},

	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function() {

		// Set state as loading
		this.isLoading();

		$.ajax({
			type: "POST",
			url: "/visit/create-patient",
			data: {
				"_token": this.props._token
			},
			success: function(resp) {
				console.log("success");
				if(resp.status == "success") {
					this.props.onPatientAdd(resp.patient);
				}
			}.bind(this),
			error: function(resp) {
				// console.log("success");
				// console.log(resp);
			},
			complete: function() {
				this.isDoneLoading();
			}.bind(this)
		});

	},

	render: function() {

		console.log("Rendering patients container with patients " + Object.keys(this.props.patients).length);
		console.log(this.props.patients);
		var patients;

		if(Object.keys(this.props.patients).length > 0) {
			patients = (Object.keys(this.props.patients)).map(function(patientID, index) {
				return (
					<NewVisit.Patient 
						{...this.props.patients[patientID]} 
						id={patientID}
						index={index}
						key={patientID} />
				);
			}.bind(this));
		} else {
			patients = (
				<div className="alert alert-info">
					No patients added yet. Add one by choosing an option below.
				</div>
			);
		}

		var loadingGifClasses = ("m-x" + (this.state.isLoading == false ? " invisible" : ""));

		return (
			<div className="col-xs-12 col-sm-12 col-md-8 col-xl-9">
	            <h1 className="p-t">New visit</h1>
	            <hr/>
	            {patients}
	            <hr/>
	            <div className="btn-group btn-group-lg">
	            	<button type="button" className="btn btn-primary" disabled={this.state.isLoading} onClick={this.handlePatientAddfromScratch}>Create new patient record</button>
	            	<img src="/assets/img/loading.gif" className={loadingGifClasses} width="52" height="52" />
	            </div>
	        </div>
		);
	}
});
