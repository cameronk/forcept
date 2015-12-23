/**
 * visit.jsx
 */

/*
 * Visit container
 *
 * The visit container acts as a state bridge between the 
 * PatientsOverview and PatientsContainer module.
 *
 * Accepted properties:
 *  - _token: Laravel CSRF token
 *  - containerTitle: Title for the PatientContainer block
 *  - controlsType: Denote which set of controls should appear ["new-visit", "stage-visit"]
 *
 *  - stages: Array of stages (in order of 'order') for finish modal
 *  - currentStage: ID of current stage
 *
 *  - fields: Fields which should be mutable for EACH patient in the PatientContainer block.
 *  - patientFields: Fields which should have their data displayed in the PatientOverview block.
 */
var Visit = React.createClass({

	/*
	 * Get initial Visit state
	 */
	getInitialState: function() {
		return {
			patients: {},
		}
	},

	/*
	 * Deploy necessary state changes prior to mount
	 */
	componentWillMount: function() {
		console.log("Preparing to mount Visit with properties:");
		console.log(this.props);

		if(this.props.hasOwnProperty("patients")) {
			console.log("Pre-existing patients detected, loading into state:");
			this.setState({ 
				patients: this.props.patients
			});
		}
	},

	/*
	 *
	 */
	handleConfirmFinishVisit: function( destination ) {
		console.log("handleCompleteVisit");
		console.log(destination);
		__debug(this.state);

		$.ajax({
			type: "POST",
			url: "/visit/move"
		});
	},

	/*
	 * Handle addition of a new patient.
	 *
	 * @arguments
	 * - patient: Object of patient data as pulled from the patients database table
	 */
	handlePatientAdd: function( patient ) {
		var patients = this.state.patients;

		if(patients.hasOwnProperty(patient.id)) {
			// Patient already in Visit
		} else {
			// Update state with new patient
			patients[patient.id] = patient;
			this.setState({ patients: patients });
		}
	},

	/*
	 * Aggregate data
	 */
	handleFinishVisit: function( isDoneLoading ) {
		console.log("Caught handleFinishVisit");
		__debug(this.state.patients);

		$("#visit-finish-modal")
			.modal('show')
			.on('hide.bs.modal', function(e) {
				// isDoneLoading();
			});
	},

	/*
	 * 
	 */
	topLevelPatientStateChange: function(patientID, fieldID, event) {
		console.log("Top level patient state change");
		console.log("Patient ID: " + patientID);
		console.log("Field ID: " + fieldID);
		console.log("Event: " + event);

		// Check if patient is in our patients array
		if(this.state.patients.hasOwnProperty(patientID)) {

			var patients = this.state.patients;
				patients[patientID][fieldID] = event.target.value;

				var fullName = null;
				if((typeof patients[patientID]["first_name"] === "string" && typeof patients[patientID]["last_name"] === "string")
					&& (patients[patientID]["first_name"].length > 0 && patients[patientID]["last_name"].length > 0)) {
					fullName = patients[patientID]["first_name"] + " " + patients[patientID]["last_name"];
				} else {
					if(typeof patients[patientID]["first_name"] === "string" && patients[patientID]["first_name"].length > 0 ) {
						fullName = patients[patientID]["first_name"];
					}
					if(typeof patients[patientID]["last_name"] === "string" && patients[patientID]["last_name"].length > 0) {
						fullName = patients[patientID]["last_name"];
					}
				}

				// Combine first and last name
				patients[patientID]["full_name"] = fullName;

			this.setState({ patients: patients });

		} else {
			console.error("Missing patient ID " + patientID + " in Visit patients state");
		}
	},

	/*
	 * Render Visit container
	 */
	render: function() {
		// currentStage={this.props.currentStage} 
		return (
			<div className="row">
				<Visit.FinishModal 
					stages={this.props.stages}
					onConfirmFinishVisit={this.handleConfirmFinishVisit} />
				<Visit.PatientsOverview 
					fields={this.props.patientFields}
					patients={this.state.patients} />
				<Visit.PatientsContainer
					_token={this.props._token}
					controlsType={this.props.controlsType}
					containerTitle={this.props.containerTitle}
					fields={this.props.fields}
					patients={this.state.patients}
					onFinishVisit={this.handleFinishVisit}
					onPatientAdd={this.handlePatientAdd} 
					onPatientDataChange={this.topLevelPatientStateChange}/>
			</div>
		)
	}

});

/*
 * Patients overview (left sidebar)
 *
 * Accepted properties:
 * - fields: Object of patient data fields for displaying patient metadata
 * - patients: Object of patients w/ data as pulled from database
 */
Visit.PatientsOverview = React.createClass({

	/*
	 * Render patient overview blocks
	 */
	render: function() {

		console.log("Rendering patients overview with patient count " + Object.keys(this.props.patients).length);
		console.log(this.props.patients);

		var patientOverviews;

		// Copy the local patient fields property to a new variable
		// and remove first/last name, so they don't appear in the list
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
		                    <span className="label label-info">#{index + 1}</span>
		                    <span className="label label-default">{patientID}</span> 
		                    &nbsp; <strong>{thisPatient['full_name'] !== null ? thisPatient['full_name'] : "Unnamed patient"}</strong>
		                </div>
		                <div className="list-group list-group-flush">
		                    {Object.keys(iterableFields).map(function(field, index) {
		                    	return (
		                    		<a className="list-group-item" key={field + "-" + index}>
		                    			<strong>{iterableFields[field]["name"]}</strong>: &nbsp;
		                    			{thisPatient.hasOwnProperty(field) && thisPatient[field].length > 0 ? thisPatient[field] : "No data"}
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
					No patients within this visit.
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
 *
 * Properties:
 *  - _token: 			Laravel CSRF token
 *  - controlsType: 	determine which controls set to use
 *  - containerTitle: 	Title for patients container
 *  - fields: 			All fields for this stage
 *  - patients:  		All patients in this visit
 *  - onFinishVisit:  	Bubble onFinishVisit event up to Visit container
 *  - onPatientAdd: 	Bubble onPatientAdd event up to Visit container
 *  - onPatientDataChange: Bubble onPatientDataChange event up to Visit container
 */
Visit.PatientsContainer = React.createClass({

	/*
	 * Initially, the container isn't loading
	 */
	getInitialState: function() {
		return {
			isLoading: false
		}
	},

	/*
	 * Set state to loading
	 */
	isLoading: function() {
		this.setState({ isLoading: true });
	},

	/* 
	 * Set state to not loading
	 */
	isDoneLoading: function() {
		this.setState({ isLoading: false });
	},

	/*
	 * Handle finishing the visit
	 */
	onFinishVisit: function() {
		console.log("PatientsContainer: onFinishVisit");
		this.isLoading();
		this.props.onFinishVisit(this.isDoneLoading());
	},

	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function() {

		// Set state as loading
		this.isLoading();

		$.ajax({
			type: "POST",
			url: "/patients/create",
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
		
		var patients,
			controls;

		// Set up patients block
		if(Object.keys(this.props.patients).length > 0) {
			patients = (Object.keys(this.props.patients)).map(function(patientID, index) {
				return (
					<Visit.Patient 
						{...this.props.patients[patientID]} 
						fields={this.props.fields}
						id={patientID}
						index={index}
						key={patientID} 

						onPatientDataChange={this.props.onPatientDataChange} />
				);
			}.bind(this));
		} else {
			patients = (
				<div className="alert alert-info">
					There are currently no patients in this visit.
				</div>
			);
		}

		// Set up controls block
		switch(this.props.controlsType) {
			case "new-visit":
				// We're on the new visit page
				controls = (
					<Visit.NewVisitControls
						isLoading={this.state.isLoading}

						onFinishVisit={this.onFinishVisit}
						onPatientAddFromScratch={this.handlePatientAddfromScratch} />
				);
				break;
			case "stage-visit":
				// We're on some sort of stage page

				break;
		}

		return (
			<div className="col-xs-12 col-sm-12 col-md-8 col-xl-9">
	            <h1 className="p-t">{this.props.containerTitle}</h1>
	            <hr/>
	            {patients}
	            <hr/>
	            {controls}
	        </div>
		);
	}
});


/*
 * Display the controls for the visit/new page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *
 *  - onFinishVisit: callback for finishing visit
 *  - onPatientAddFromScratch: callback for clicking "Create new patient record"
 */
Visit.NewVisitControls = React.createClass({

	render: function() {

		var loadingGifClasses = ("m-x" + (this.props.isLoading == false ? " invisible" : ""));

		return (
			<div className="btn-toolbar" role="toolbar">
				<div className="btn-group btn-group-lg">
		        	<button type="button" className="btn btn-primary" disabled={this.props.isLoading} onClick={this.props.onPatientAddFromScratch}>Create new patient record</button>
		        	<img src="/assets/img/loading.gif" className={loadingGifClasses} width="52" height="52" />
		        </div>
	        	<div className="btn-group btn-group-lg">
	        		<button type="button" className="btn btn-success" disabled={this.props.isLoading} onClick={this.props.onFinishVisit}>Finish visit &raquo;</button>
	        	</div>
	        </div>
	    );
	}

});


/*
 * Display specified fields relative to this patient
 *
 * Properties:
 */
Visit.Patient = React.createClass({

	handleFieldChange: function(fieldID, event) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onPatientDataChange(this.props.id, fieldID, event);
	},

	render: function() {
		console.log("Preparing to render Visit.Patient with " + Object.keys(this.props.fields).length + " fields");
		console.log(this.props);
		return (
			<blockquote className="blockquote">
				<h3>
					<span className="label label-info">#{this.props.hasOwnProperty('index') ? this.props.index + 1 : "?"}</span>
		            <span className="label label-default">{this.props.hasOwnProperty('id') ? this.props.id : "?"}</span> &nbsp; 
		            {this.props['full_name'] !== null ? this.props['full_name'] : "Unnamed patient"}
		        </h3>
		        <hr/>
		        {Object.keys(this.props.fields).map(function(fieldID, index) {
		        	switch(this.props.fields[fieldID]['type']) {
		        		case "text":
		        			return (
		        				<Fields.Text 
		        					{...this.props.fields[fieldID]} 
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "date":
		        			return (
		        				<Fields.Text 
		        					{...this.props.fields[fieldID]} 
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "select":
							return (
		        				<Fields.Select 
		        					{...this.props.fields[fieldID]} 
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		default:
		        			return (
		        				<div className="alert alert-danger">
		        					<strong>Warning:</strong> Unrecognized input type {this.props.fields[fieldID]['type']}
		        				</div>
		        			);
		        			break;
		        	}
		        }.bind(this))}
			</blockquote>
		);
	}

});

/*
 * Modal that appears upon clicking "Finish visit"
 *
 * Properties
 *   - stages: array of stage objects (in order of 'order')
 *   - currentStage: current stage 'order'
 *   - onConfirmFinishVisit: handler function for logic after moving patients
 */
Visit.FinishModal = React.createClass({

	getInitialState: function() {
		return {
			destination: "__default__"
		};
	},

	/*
	 * onComplete
	 */
	onComplete: function() {
		this.props.onConfirmFinishVisit(this.state.destination);
	},

	/*
	 * Handle destination change
	 */
	handleDestinationChange: function(event) {
		this.setState({ destination: event.target.value });
	},

	/*
	 * Check if a default value is going to be set
	 */
	componentWillMount: function() {
		
	},

	/*
	 * Render the modal
	 */
	render: function() {
		var destinations = "";

		var stageNameKeyPairs = {};

		if(this.props.hasOwnProperty('stages') && this.props.stages.length > 0) {
			this.props.stages.map(function(stage, index) {
				stageNameKeyPairs[stage['id']] = stage['name'];
				destinations = (
					<option value={stage['id']}>{stage['name']}</option>
				);
			}.bind(this));
		}

		return (
			<div className="modal fade" id="visit-finish-modal">
			    <div className="modal-dialog modal-sm" role="document">
			        <div className="modal-content">
			            <div className="modal-header">
			                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
			                  <span aria-hidden="true">&times;</span>
			                </button>
			                <h4 className="modal-title">Complete visit</h4>
			            </div>
			            <div className="modal-body">
			            	<label className="form-control-label">Destination:</label>
			              	<select className="form-control" onChange={this.handleDestinationChange} defaultValue="__default__">
			              		<option value="__default__" disabled>Choose an option...</option>
			              		{destinations}
			              		<option value="__checkout__">Check patient out</option>
			              	</select>
			            </div>
			            <div className="modal-footer">
			                <button type="button" className="btn btn-primary" disabled={this.state.destination == "__default__"} onClick={this.onComplete}>
			                	{
			                		this.state.destination == "__default__" 
				                	? "Choose a destination" 
				                	: (this.state.destination == "__checkout__" 
				                		? "Check-out patients" 
				                		: "Move patients to " + stageNameKeyPairs[this.state.destination]
				                	)
			                	}
			                </button>
			            </div>
			        </div>
			    </div>
			</div>
		);
	}

});