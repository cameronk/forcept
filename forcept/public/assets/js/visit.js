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
 *  - fields: Fields which should be mutable for EACH patient in the PatientContainer block.
 *  - patientFields: Fields which should have their data displayed in the PatientOverview block.
 */
var Visit = React.createClass({displayName: "Visit",

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
	 * Handle addition of a new patient.
	 *
	 * @arguments
	 * - patient: Object of patient data as pulled from the patients database table
	 */
	handlePatientAdd: function(patient) {
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

				// Combine first and last name
				patients[patientID]["full_name"] = (typeof patients[patientID]["first_name"] === "string" ? patients[patientID]["first_name"] : "") + " " + (typeof patients[patientID]["last_name"] === "string" ? patients[patientID]["last_name"] : "");

			this.setState({ patients: patients });

		} else {
			console.error("Missing patient ID " + patientID + " in Visit patients state");
		}
	},

	/*
	 * Render Visit container
	 */
	render: function() {
		__debug(this.props, this.state);
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement(Visit.PatientsOverview, {
					fields: this.props.patientFields, 
					patients: this.state.patients}), 

				React.createElement(Visit.PatientsContainer, {
					_token: this.props._token, 
					controlsType: this.props.controlsType, 
					containerTitle: this.props.containerTitle, 
					fields: this.props.fields, 
					patients: this.state.patients, 

					onPatientAdd: this.handlePatientAdd, 
					onPatientDataChange: this.topLevelPatientStateChange})
			)
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
Visit.PatientsOverview = React.createClass({displayName: "PatientsOverview",

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
					React.createElement("div", {className: "card", key: patientID}, 
		                React.createElement("div", {className: "card-header"}, 
		                    React.createElement("span", {className: "label label-info"}, index + 1), 
		                    React.createElement("span", {className: "label label-default"}, patientID), 
		                    "  ", React.createElement("strong", null, thisPatient['full_name'] !== null ? thisPatient['full_name'] : "Unnamed patient")
		                ), 
		                React.createElement("div", {className: "list-group list-group-flush"}, 
		                    Object.keys(iterableFields).map(function(field, index) {
		                    	return (
		                    		React.createElement("a", {className: "list-group-item", key: field + "-" + index}, 
		                    			React.createElement("strong", null, iterableFields[field]["name"]), ":  ", 
		                    			thisPatient.hasOwnProperty(field) && thisPatient['field'].length > 0 ? thisPatient['field'] : "No data"
		                    		)
		                    	);
		                    })
		                )
					)
				);
			}.bind(this));
		} else {
			patientOverviews = (
				React.createElement("div", {className: "alert alert-info"}, 
					"No patients within this visit."
				)
			);
		}

		return (
	        React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-4 col-xl-3"}, 
	           patientOverviews
	        )
	    );
	}

});

/* 
 * Patients management (main content)
 *
 * @arguments
 *  - 
 */
Visit.PatientsContainer = React.createClass({displayName: "PatientsContainer",

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
	 * Handle finishing the visit
	 */
	handleFinishVisit: function() {

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
		
		var patients,
			controls;

		// Set up patients block
		if(Object.keys(this.props.patients).length > 0) {
			patients = (Object.keys(this.props.patients)).map(function(patientID, index) {
				return (
					React.createElement(Visit.Patient, React.__spread({},  
						this.props.patients[patientID], 
						{fields: this.props.fields, 
						id: patientID, 
						index: index, 
						key: patientID, 

						onPatientDataChange: this.props.onPatientDataChange}))
				);
			}.bind(this));
		} else {
			patients = (
				React.createElement("div", {className: "alert alert-info"}, 
					"There are currently no patients in this visit."
				)
			);
		}

		// Set up controls block
		switch(this.props.controlsType) {
			case "new-visit":
				// We're on the new visit page
				controls = (
					React.createElement(Visit.NewVisitControls, {
						isLoading: this.state.isLoading, 
						onFinishVisit: this.handleFinishVisit, 
						onPatientAddFromScratch: this.handlePatientAddfromScratch})
				);
				break;
			case "stage-visit":
				// We're on some sort of stage page

				break;
		}

		return (
			React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-8 col-xl-9"}, 
	            React.createElement("h1", {className: "p-t"}, this.props.containerTitle), 
	            React.createElement("hr", null), 
	            patients, 
	            React.createElement("hr", null), 
	            controls
	        )
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
Visit.NewVisitControls = React.createClass({displayName: "NewVisitControls",

	render: function() {
		var loadingGifClasses = ("m-x" + (this.props.isLoading == false ? " invisible" : ""));

		return (
			React.createElement("div", {className: "btn-group btn-group-lg"}, 
	        	React.createElement("button", {type: "button", className: "btn btn-primary", disabled: this.props.isLoading, onClick: this.props.onPatientAddFromScratch}, "Create new patient record"), 
	        	React.createElement("button", {type: "button", className: "btn btn-success", disabled: this.props.isLoading, onClick: this.props.onFinishVisit}, "Finish visit »"), 
	        	React.createElement("img", {src: "/assets/img/loading.gif", className: loadingGifClasses, width: "52", height: "52"})
	        )
	    );
	}

});


/*
 * Display specified fields relative to this patient
 *
 * Properties:
 */
Visit.Patient = React.createClass({displayName: "Patient",

	handleFieldChange: function(fieldID, event) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onPatientDataChange(this.props.id, fieldID, event);
	},

	render: function() {
		console.log("Preparing to render Visit.Patient with " + Object.keys(this.props.fields).length + " fields");
		console.log(this.props);
		return (
			React.createElement("blockquote", {className: "blockquote"}, 
				React.createElement("h3", null, 
					React.createElement("span", {className: "label label-info"}, this.props.hasOwnProperty('index') ? this.props.index + 1 : "?"), 
		            React.createElement("span", {className: "label label-default"}, this.props.hasOwnProperty('id') ? this.props.id : "?"), "  ",  
		            this.props['full_name'] !== null ? this.props['full_name'] : "Unnamed patient"
		        ), 
		        React.createElement("hr", null), 
		        Object.keys(this.props.fields).map(function(fieldID, index) {
		        	switch(this.props.fields[fieldID]['type']) {
		        		case "text":
		        			return (
		        				React.createElement(Fields.Text, React.__spread({},  
		        					this.props.fields[fieldID], 
		        					{onChange: this.handleFieldChange, 
		        					id: fieldID}))
		        			);
		        			break;
		     //    		case "select":
							// return (
		     //    				<Fields.Select 
		     //    					{...this.props.fields[fieldID]} 
		     //    					onChange={this.handleFieldChange}
		     //    					id={fieldID} />
		     //    			);
		     //    			break;
		        		default:
		        			return (
		        				React.createElement("div", {className: "alert alert-danger"}, 
		        					React.createElement("strong", null, "Warning:"), " Unrecognized input type ", this.props.fields[fieldID]['type']
		        				)
		        			);
		        			break;
		        	}
		        }.bind(this))
			)
		);
	}
});