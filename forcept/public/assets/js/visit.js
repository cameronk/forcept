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
 *  - redirectOnFinish: URL to redirect to on complete
 *
 *  - visitID: ID of the current visit being modified (null if new visit setup)
 *  - patients: Patients object with fieldID => data setup
 *  - stages: Array of stages (in order of 'order') for finish modal
 *  - currentStage: ID of current stage
 *
 *  - mutablefields: Fields which should be mutable for EACH patient in the PatientContainer block.
 *  - allFields: Fields which should have their data displayed in the PatientOverview block.
 *				 CONTAINS ALL FIELDS FOR ALL STAGES UP TO  currentStage
 */
var Visit = React.createClass({displayName: "Visit",

	/*
	 * Get initial Visit state
	 */
	getInitialState: function() {
		return {
			confirmFinishVisitResponse: null,
			patients: {},
		}
	},

	/*
	 * Deploy necessary state changes prior to mount
	 */
	componentWillMount: function() {
		console.log("Preparing to mount Visit with properties:");
		console.log(this.props);

		if(this.props.hasOwnProperty("patients") && this.props.patients !== null) {
			console.log("Pre-existing patients detected, loading into state:");
			this.setState({ 
				patients: this.props.patients
			});
		}
	},

	/*
	 *
	 */
	handleConfirmFinishVisit: function( destination, modalObject ) {
		$.ajax({
			type: "POST",
			url: "/visits/store",
			data: {
				"_token": this.props._token,
				visit: this.props.visitID,
				patients: this.state.patients,
				stage: this.props.currentStage,
				destination: destination
			},
			success: function(resp) {
				this.setState({ patients: {} });
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
				console.log("Complete:");
				console.log(resp);
				if(this.props.controlsType == "new-visit") {
					this.setState({ 
						confirmFinishVisitResponse: resp.responseJSON 
					});
					$("#visit-finish-modal")
						.modal('hide')
						.on('hidden.bs.modal', function(e) {
							console.log("Modal hidden");
							modalObject.setState(modalObject.getInitialState());
							modalObject.forceUpdate();
						});

				} else {
					window.location = this.props.redirectOnFinish;
				}
			}.bind(this)
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
			this.setState({ 
				confirmFinishVisitResponse: null, 
				patients: patients 
			});
		}
	},

	/*
	 * Aggregate data
	 */
	handleFinishVisit: function( isDoneLoading ) {
		$("#visit-finish-modal")
			.modal('show');
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
		return (
			React.createElement("div", {className: "row"}, 
				React.createElement(Visit.FinishModal, {
					stages: this.props.stages, 
					onConfirmFinishVisit: this.handleConfirmFinishVisit}), 

				React.createElement(Visit.PatientsOverview, {
					fields: this.props.allFields, 
					patients: this.state.patients}), 

				React.createElement(Visit.PatientsContainer, {
					_token: this.props._token, 
					controlsType: this.props.controlsType, 
					containerTitle: this.props.containerTitle, 

					fields: this.props.mutableFields, 
					patients: this.state.patients, 
					confirmFinishVisitResponse: this.state.confirmFinishVisitResponse, 

					onFinishVisit: this.handleFinishVisit, 
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
 * - fields: Object of ALL fields for ALL stages up to THIS CURRENT STAGE for displaying patient metadata
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

		console.log(iterableFields);

		// If there are patients in the props object
		if(Object.keys(this.props.patients).length > 0) {
			patientOverviews = Object.keys(this.props.patients).map(function(patientID, index) {
				var thisPatient = this.props.patients[patientID];
				return (
					React.createElement("div", {className: "card", key: patientID}, 
		                React.createElement("div", {className: "card-header"}, 
		                    React.createElement("span", {className: "label label-info"}, "#", index + 1), 
		                    React.createElement("span", {className: "label label-default"}, patientID), 
		                    "  ", React.createElement("strong", null, thisPatient['full_name'] !== null ? thisPatient['full_name'] : "Unnamed patient")
		                ), 
		                React.createElement("div", {className: "list-group list-group-flush"}, 
		                    Object.keys(iterableFields).map(function(field, index) {
		                    	console.log("Field: " + field);
		                    	console.log(thisPatient[field]);
		                    	return (
		                    		React.createElement("a", {className: "list-group-item", key: field + "-" + index}, 
		                    			React.createElement("strong", null, iterableFields[field]["name"]), ":  ", 
		                    			
		                    				thisPatient.hasOwnProperty(field) 
		                    				&& thisPatient[field] !== null
		                    				&& thisPatient[field].length > 0 
		                    				 ? thisPatient[field] 
		                    				 : "No data"
		                    			
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
Visit.PatientsContainer = React.createClass({displayName: "PatientsContainer",

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

						onFinishVisit: this.onFinishVisit, 
						onPatientAddFromScratch: this.handlePatientAddfromScratch})
				);
				break;
			case "stage-visit":
				// We're on some sort of stage page
				controls = (
					React.createElement(Visit.StageVisitControls, {
						isLoading: this.state.isLoading, 

						onFinishVisit: this.onFinishVisit})
				);
				break;
		}

		// Add messages as necessary
		var message;
		if(this.props.confirmFinishVisitResponse !== null) {
			var response = this.props.confirmFinishVisitResponse;
			if(response.status == "success") {
				message = (
					React.createElement("div", {className: "alert alert-success"}, 
						React.createElement("strong", null, "Awesome!"), " ", response.message
					)
				);
			} else {
				var errorListItems = response.errors.map(function(error, index) {
					return (
						React.createElement("li", {key: index}, error)
					);
				});
				message = (
					React.createElement("div", {className: "alert alert-danger"}, 
						React.createElement("strong", null, "An error occurred:"), " ", response.message, 
						React.createElement("ul", null, errorListItems)
					)
				);
			}
		}


		return (
			React.createElement("div", {className: "col-xs-12 col-sm-12 col-md-8 col-xl-9"}, 
	            React.createElement("h1", {className: "p-t text-xs-center"}, this.props.containerTitle), 
	            React.createElement("hr", null), 
	            message, 
	            patients, 
	            React.createElement("hr", null), 
	            controls
	        )
		);
	}
});


/*
 * Display the controls for the new visit page
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
			React.createElement("div", {className: "btn-toolbar", role: "toolbar"}, 
				React.createElement("div", {className: "btn-group btn-group-lg"}, 
		        	React.createElement("button", {type: "button", className: "btn btn-primary", disabled: this.props.isLoading, onClick: this.props.onPatientAddFromScratch}, "Create new patient record"), 
		        	React.createElement("img", {src: "/assets/img/loading.gif", className: loadingGifClasses, width: "52", height: "52"})
		        ), 
	        	React.createElement("div", {className: "btn-group btn-group-lg"}, 
	        		React.createElement("button", {type: "button", className: "btn btn-success", disabled: this.props.isLoading, onClick: this.props.onFinishVisit}, "Finish visit »")
	        	)
	        )
	    );
	}

});


/*
 * Display the controls for the stage page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *
 *  - onFinishVisit: callback for finishing visit
 */
Visit.StageVisitControls = React.createClass({displayName: "StageVisitControls",

	render: function() {

		var loadingGifClasses = ("m-x" + (this.props.isLoading == false ? " invisible" : ""));

		return (
			React.createElement("div", {className: "btn-toolbar", role: "toolbar"}, 
				React.createElement("div", {className: "btn-group btn-group-lg"}, 
		        	React.createElement("img", {src: "/assets/img/loading.gif", className: loadingGifClasses, width: "52", height: "52"}), 
	        		React.createElement("button", {type: "button", className: "btn btn-success", disabled: this.props.isLoading, onClick: this.props.onFinishVisit}, "Finish visit »")
		        )
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
					React.createElement("span", {className: "label label-info"}, "#", this.props.hasOwnProperty('index') ? this.props.index + 1 : "?"), 
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
		        					key: fieldID, 
		        					id: fieldID}))
		        			);
		        			break;
		        		case "date":
		        			return (
		        				React.createElement(Fields.Text, React.__spread({},  
		        					this.props.fields[fieldID], 
		        					{onChange: this.handleFieldChange, 
		        					key: fieldID, 
		        					id: fieldID}))
		        			);
		        			break;
		        		case "select":
							return (
		        				React.createElement(Fields.Select, React.__spread({},  
		        					this.props.fields[fieldID], 
		        					{onChange: this.handleFieldChange, 
		        					key: fieldID, 
		        					id: fieldID}))
		        			);
		        			break;
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

/*
 * Modal that appears upon clicking "Finish visit"
 *
 * Properties
 *   - stages: array of stage objects (in order of 'order')
 *   - currentStage: current stage id
 *   - onConfirmFinishVisit: handler function for logic after moving patients
 */
Visit.FinishModal = React.createClass({displayName: "FinishModal",

	getInitialState: function() {
		return {
			isSubmitting: false,
			destination: null
		};
	},

	/*
	 * onComplete
	 */
	onComplete: function() {
		this.setState({ isSubmitting: true });
		this.props.onConfirmFinishVisit(this.state.destination, this);
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
		// Set default value as the first stage in the array (the next stage in order above the current one)
		this.setState({ destination: this.props.stages[0].id });
	},

	/*
	 * Render the modal
	 */
	render: function() {

		var destinations,
			buttonText,
			defaultValue,
			stageNameKeyPairs = {};

		// Check if stages are defined, use them as destinations
		// NOTE: stages are in order of ORDER, not ID
		if(this.props.hasOwnProperty('stages') && this.props.stages.length > 0) {
			destinations = this.props.stages.map(function(stage, index) {
				stageNameKeyPairs[stage['id']] = stage['name'];
				return (
					React.createElement("option", {value: stage['id']}, stage['name'])
				);
			}.bind(this));
		}

		// Change button text based on modal state
		if(this.state.isSubmitting == true) {
			buttonText = "Working...";
		} else {
			if(this.state.destination == "__checkout__") {
				buttonText = "Check-out patients";
			} else {
				buttonText = "Move patients to " + (this.state.destination !== null ? stageNameKeyPairs[this.state.destination] : stageNameKeyPairs[defaultValue]);
			}
		}

		return (
			React.createElement("div", {className: "modal fade", id: "visit-finish-modal"}, 
			    React.createElement("div", {className: "modal-dialog modal-sm", role: "document"}, 
			        React.createElement("div", {className: "modal-content"}, 
			            React.createElement("div", {className: "modal-header"}, 
			                React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal", "aria-label": "Close"}, 
			                  React.createElement("span", {"aria-hidden": "true"}, "×")
			                ), 
			                React.createElement("h4", {className: "modal-title"}, "Complete visit")
			            ), 
			            React.createElement("div", {className: "modal-body"}, 
			            	React.createElement("label", {className: "form-control-label"}, "Destination:"), 
			              	React.createElement("select", {className: "form-control", onChange: this.handleDestinationChange, disabled: this.state.isSubmitting}, 
			              		destinations, 
			              		React.createElement("option", {value: "__checkout__"}, "Check patient out")
			              	)
			            ), 
			            React.createElement("div", {className: "modal-footer"}, 
			                React.createElement("button", {type: "button", className: "btn btn-primary", disabled: this.state.isSubmitting == true, onClick: this.onComplete}, 
			                	buttonText
			                )
			            )
			        )
			    )
			)
		);
	}

});