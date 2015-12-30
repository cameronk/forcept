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
var Visit = React.createClass({

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
				this.setState({ 
					confirmFinishVisitResponse: resp.responseJSON 
				});
				$("#visit-finish-modal")
					.modal('hide')
					.on('hidden.bs.modal', function(e) {
						console.log("Modal hidden");
						modalObject.setState(modalObject.getInitialState());
						modalObject.resetSelectState();
					});

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

			__debug(this.state);
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
	topLevelPatientStateChange: function(patientID, fieldID, value) {
		console.log("Top level patient state change");
		console.log("Patient ID: " + patientID);
		console.log("Field ID: " + fieldID);
		console.log("Value: " + value);

		// Check if patient is in our patients array
		if(this.state.patients.hasOwnProperty(patientID)) {

			var patients = this.state.patients;
				patients[patientID][fieldID] = value;

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
			<div className="row">
				<Visit.FinishModal 
					stages={this.props.stages}
					onConfirmFinishVisit={this.handleConfirmFinishVisit} />

				<Visit.PatientsOverview 
					fields={this.props.allFields}
					patients={this.state.patients} />

				<Visit.PatientsContainer
					_token={this.props._token}
					controlsType={this.props.controlsType}
					containerTitle={this.props.containerTitle}

					fields={this.props.mutableFields}
					patients={this.state.patients}
					confirmFinishVisitResponse={this.state.confirmFinishVisitResponse}

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
 * - fields: Object of ALL fields for ALL stages up to THIS CURRENT STAGE for displaying patient metadata
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
			delete iterableFields["photo"];

		console.log("Rendering PatientsOverview with iterableFields:");
		console.log(iterableFields);
		console.log("and patient properties:");
		console.log(this.props.patients);

		// If there are patients in the props object
		if(Object.keys(this.props.patients).length > 0) {
			patientOverviews = Object.keys(this.props.patients).map(function(patientID, index) {
				var thisPatient = this.props.patients[patientID];
				var photo;

				if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {
					console.log("Patient overview: " + patientID + " has photo");
					var dataURI = thisPatient.photo.toString();
					var split = dataURI.split(";");
					var dataType = split[0].split('/');

					if(dataType[0] == "data:image") {
						console.log("Datatype is valid");
						photo = (
			                <div className="patient-photo-contain">
			                	<img src={dataURI} />	
			                </div>
						);
					}
				}

				console.log("Rendering patient overview card - ID #" + patientID);
				console.log(thisPatient);

				return (
					<div className="card forcept-patient-summary" key={patientID}>
		                <div className="card-header">
		                    <span className="label label-info">#{index + 1}</span>
		                    <span className="label label-default">{patientID}</span> 
		                </div>
		                <div className="card-block">
		                	<h4 className="card-title text-xs-center m-a-0">
		                		<strong>{(thisPatient["full_name"] !== null && thisPatient["full_name"].length > 0) ? thisPatient["full_name"] : "Unnamed patient"}</strong>
		                	</h4>
		                </div>
		                {photo}
		              	<div className="list-group list-group-flush">
		                    {Object.keys(iterableFields).map(function(field, index) {

		                    	var value = "No data";

		                    	if(thisPatient.hasOwnProperty(field) 	// If this field exists in the patient data
		                    		&& thisPatient[field] !== null 		// If the data for this field is null, show "No data"
		                    		&& thisPatient[field].length > 0) 	// If string length == 0 or array length == 0, show "No data"
		                    	{
		                    		if( ["string", "number"].indexOf(typeof thisPatient[field]) !== -1 ) // If the field is a string or number
		                    		{
		                    			console.log(" | Field " + iterableFields[field]["name"] + " is string or number");
		                    			console.log(" | -> type: " + iterableFields[field].type);

		                    			// We might need to mutate the data
		                    			switch(iterableFields[field].type) {
		                    				case "multiselect":
		                    					// Convert from JSON array to nice string
		                    					var arr = JSON.parse(thisPatient[field]);
		                    					if(Array.isArray(arr) && arr.length > 0) {
		                    						value = arr.join(", ");
		                    					}
		                    					console.log("Multiselect value: " + value);
		                    					break;
		                    				case "file":

		                    					var split = thisPatient[field].toString().split(";");
		                    					var dataSection = split[0]; // data:image/png

		                    					if(dataSection.split("/")[0] == "data:image") {

			                    					value = (
			                    						<img src={thisPatient[field].toString()} />
			                    					);

		                    					} else {

		                    						var splitHeadAndData = thisPatient[field].toString().split(",");
		                    						value = "1 file, " + (Math.round( (splitHeadAndData[1].length - splitHeadAndData[0].length) * 0.75 )) + " bytes";

		                    					}

		                    					break;
		                    				default:
		                    					value = thisPatient[field].toString();
		                    					break;
		                    			}
		                    		} else {
		                    			console.log(" | Field " + iterableFields[field]["name"] + " is NOT string or number");
		                    			console.log(" | -> type: " + iterableFields[field].type);
		                    			if( Array.isArray(thisPatient[field]) ) // If the data is an array
		                    			{
		                    				value = thisPatient[field].join(", ");
		                    			} else {
		                    				// WTF is it?
		                    				console.log("WARNING: unknown field data type for field " + field);
		                    			}
		                    		}
		                    	}

		                    	return (
		                    		<a className="list-group-item" key={field + "-" + index}>
		                    			<strong>{iterableFields[field].name}</strong>: &nbsp;
		                    			{value}
		                    		</a>
		                    	);
		                    })}
		                </div>
					</div>
				);
			}.bind(this));
		} else {
			patientOverviews = (
				<div className="alert alert-info hidden-sm-down">
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
 *
 *  - fields: 			All fields for this stage
 *  - patients:  		All patients in this visit
 * 
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
			showImportBlock: false,
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

	handleShowImportBlock: function() {
		this.setState({ showImportBlock: true });
	},
	handleCloseImportBlock: function() {
		this.setState({ showImportBlock: false });
	},

	render: function() {

		console.log("Rendering patients container with patients " + Object.keys(this.props.patients).length);
		console.log(this.props.patients);
		
		var patients,
			importBlock,
			controls;

		// Set up patients block
		if(Object.keys(this.props.patients).length > 0) {
			patients = (Object.keys(this.props.patients)).map(function(patientID, index) {
				return (
					<div key={patientID}>
						<Visit.Patient 
							{...this.props.patients[patientID]} 
							fields={this.props.fields}
							id={patientID}
							index={index}

							onPatientDataChange={this.props.onPatientDataChange} />
						<hr/>
					</div>
				);
			}.bind(this));
		} else {
			patients = (
				<div className="alert alert-info">
					There are currently no patients in this visit.
				</div>
			);
		}

		// Set up import block
		if(this.state.showImportBlock) {
			importBlock = (
				<Visit.ImportBlock 
					_token={this.props._token} 

					onPatientAdd={this.props.onPatientAdd}
					onClose={this.handleCloseImportBlock} />
			);
		}

		// Set up controls block
		switch(this.props.controlsType) {
			case "new-visit":
				// We're on the new visit page
				controls = (
					<Visit.NewVisitControls
						isLoading={this.state.isLoading}
						isImportBlockVisible={this.state.showImportBlock}

						onFinishVisit={this.onFinishVisit}
						onPatientAddFromScratch={this.handlePatientAddfromScratch} 
						onShowImportBlock={this.handleShowImportBlock} />
				);
				break;
			case "stage-visit":
				// We're on some sort of stage page
				controls = (
					<Visit.StageVisitControls
						isLoading={this.state.isLoading}

						onFinishVisit={this.onFinishVisit} />
				);
				break;
		}

		// Add messages as necessary
		var message;
		if(this.props.confirmFinishVisitResponse !== null) {
			var response = this.props.confirmFinishVisitResponse;
			if(response.status == "success") {
				message = (
					<div className="alert alert-success">
						<strong>Awesome!</strong> {response.message}
					</div>
				);
			} else {
				var errorListItems = response.errors.map(function(error, index) {
					return (
						<li key={index}>{error}</li>
					);
				});
				message = (
					<div className="alert alert-danger">
						<strong>An error occurred:</strong> {response.message}
						<ul>{errorListItems}</ul>
					</div>
				);
			}
		}


		return (
			<div className="col-xs-12 col-sm-12 col-md-8 col-xl-9">
	            <h1 className="p-t text-xs-center">{this.props.containerTitle}</h1>
	            <hr/>
	            	{message}
	            	{patients}
	            	{importBlock}
	            	{controls}
	        </div>
		);
	}
});


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
		console.log("Handling click" + type);
		this.setState({ display: 'searching' });

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

		var display;

		switch(this.state.display) {
			case "form":
				display = (
					<fieldset className="form-group m-b-0">
						<label className="form-control-label hidden-sm-up">...by field number:</label>
						<div className="input-group input-group-lg m-b">
	      					<input type="number" className="form-control" placeholder="Search for a patient by field number..." value={this.state.fieldNumber} onChange={this.handleInputChange("fieldNumber")} />
							<span className="input-group-btn">
								<button className="btn btn-secondary" type="button" disabled={this.state.fieldNumber == null} onClick={this.doSearchFieldNumber}>Search</button>
							</span>
						</div>
						<label className="form-control-label hidden-sm-up">...by Forcept ID:</label>
						<div className="input-group input-group-lg m-b">
	      					<input type="number" className="form-control" placeholder="Search for a patient by Forcept ID..." min="100000" value={this.state.forceptID} onChange={this.handleInputChange("forceptID")} />
							<span className="input-group-btn">
								<button className="btn btn-secondary" type="button" disabled={this.state.forceptID == null} onClick={this.doSearchForceptID}>Search</button>
							</span>
						</div>
						<label className="form-control-label hidden-sm-up">...by first or last name:</label>
						<div className="input-group input-group-lg">
	      					<input type="text" className="form-control" placeholder="Search for a patient by first or last name..." value={this.state.name} onChange={this.handleInputChange("name")} />
							<span className="input-group-btn">
								<button className="btn btn-secondary" type="button" disabled={this.state.name == null || this.state.name.length == 0} onClick={this.doSearchName}>Search</button>
							</span>
						</div>
					</fieldset>
				);
				break;
			case "searching":
				display = (
					<h2>
						<img src="/assets/img/loading.gif" className="m-r" />
						One moment, searching patients..
					</h2> 
				);
				break;
			case "results":

				if(this.state.patientsFound.length == 0) {
					display = (
						<div className="alert alert-info">
							No patients found. <a className="alert-link" onClick={this.resetDisplay}>Try again?</a>
						</div>
					)
				} else {
					display = (
						<div className="row">
							{this.state.patientsFound.map(function(patient, index) {
								var currentVisit;
								if(patient['current_visit'] !== null) {
									currentVisit = (
										<li className="list-group-item bg-danger">Patient currently in a visit!</li>
									);
								}
								return (
									<div className="col-xs-12 col-sm-6" key={"patients-found-" + index}>
										<div className="card">
											<div className="card-header">
												<h5 className="card-title">
													<span className="label label-default pull-right">{patient['id']}</span>
													<span className="label label-primary pull-right">#{index + 1}</span>
													<span className="title-content">{(patient["full_name"] !== null && patient["full_name"].length > 0) ? patient["full_name"] : "Unnamed patient"}</span>
												</h5>
											</div>
											<ul className="list-group list-group-flush">
												{currentVisit}
											</ul>
											<div className="card-block">
												<button type="button" className="btn btn-block btn-secondary" disabled={patient['current_visit'] !== null} onClick={this.handlePatientAdd(patient)}>
													{'\u002b'} Add
												</button>
											</div>
										</div>
									</div>
								);
							}.bind(this))}
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
					<button type="button" className="close pull-right" aria-label="Close" onClick={this.props.onClose}>
					    <span aria-hidden="true">&times;</span>
					 </button>
				</h3>
				<hr/>
				{display}
			</blockquote>
		);
	}
});


/*
 * Display the controls for the new visit page
 *
 * Properties:
 *  - isLoading: boolean, is the container engaged in some sort of loading / modal process
 *  - isImportBlockVisible: if the import block is visible, disable the button
 * 
 *  - onFinishVisit: callback for finishing visit
 *  - onPatientAddFromScratch: callback for clicking "Create new patient record"
 *  - onShowImportBlock: callback for showing the import block within PatientsContainer
 */
Visit.NewVisitControls = React.createClass({
	render: function() {

		var loadingGifClasses = ("m-x loading" + (this.props.isLoading == false ? " invisible" : ""));

		return (
			<div className="btn-toolbar" role="toolbar">
				<div className="btn-group btn-group-lg p-b">
		        	<button type="button" className="btn btn-primary" disabled={this.props.isLoading} onClick={this.props.onPatientAddFromScratch}>{'\u002b'} New</button>
		        	<button type="button" className="btn btn-default" disabled={this.props.isLoading || this.props.isImportBlockVisible} onClick={this.props.onShowImportBlock}>{'\u21af'} Import</button>
		        	</div>
	        	<div className="btn-group btn-group-lg">
	        		<img src="/assets/img/loading.gif" className={loadingGifClasses} width="52" height="52" />
	        		<button type="button" className="btn btn-success" disabled={this.props.isLoading} onClick={this.props.onFinishVisit}>{'\u2713'} Finish visit</button>
	        	</div>
	        </div>
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
Visit.StageVisitControls = React.createClass({

	render: function() {

		var loadingGifClasses = ("m-x" + (this.props.isLoading == false ? " invisible" : ""));

		return (
			<div className="btn-toolbar" role="toolbar">
				<div className="btn-group btn-group-lg">
		        	<img src="/assets/img/loading.gif" className={loadingGifClasses} width="52" height="52" />
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

	handleFieldChange: function(fieldID, value) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onPatientDataChange(this.props.id, fieldID, value);
	},

	render: function() {
		console.log("Preparing to render Visit.Patient with " + Object.keys(this.props.fields).length + " fields");
		console.log(this.props);
		var name = this.props['full_name'] !== null ? this.props['full_name'] : "Unnamed patient"
		return (
			<blockquote className="blockquote">
				<h3>
					<span className="label label-info">#{this.props.hasOwnProperty('index') ? this.props.index + 1 : "?"}</span>
		            <span className="label label-default">{this.props.hasOwnProperty('id') ? this.props.id : "?"}</span> &nbsp; 
		            <span className="hidden-xs-down">{name}</span>
		            <div className="hidden-sm-up p-t">{name}</div>
		        </h3>
		        <hr/>
		        {Object.keys(this.props.fields).map(function(fieldID, index) {
		        	switch(this.props.fields[fieldID]['type']) {
		        		case "text":
		        			return (
		        				<Fields.Text 
		        					{...this.props.fields[fieldID]} 
		        					defaultValue={this.props.hasOwnProperty(fieldID) ? this.props[fieldID] : null}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "number":
		        			return (
		        				<Fields.Number
		        					{...this.props.fields[fieldID]} 
		        					defaultValue={this.props.hasOwnProperty(fieldID) ? this.props[fieldID] : null}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "date":
		        			return (
		        				<Fields.Text 
		        					{...this.props.fields[fieldID]} 
		        					defaultValue={this.props.hasOwnProperty(fieldID) ? this.props[fieldID] : null}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "select":
							return (
		        				<Fields.Select 
		        					{...this.props.fields[fieldID]} 
		        					defaultValue={this.props.hasOwnProperty(fieldID) ? this.props[fieldID] : null}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "multiselect":
		        			return (
		        				<Fields.MultiSelect 
		        					{...this.props.fields[fieldID]} 
		        					defaultValue={this.props.hasOwnProperty(fieldID) ? this.props[fieldID] : null}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "file":
		        			return (
								<Fields.File
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
 *   - currentStage: current stage id
 *   - onConfirmFinishVisit: handler function for logic after moving patients
 */
Visit.FinishModal = React.createClass({

	getInitialState: function() {
		return {
			isSubmitting: false,
		};
	},

	/*
	 * onComplete
	 */
	onComplete: function() {
		this.setState({ 
			isSubmitting: true 
		});
		this.props.onConfirmFinishVisit(this.state.destination, this);
	},

	/*
	 * Handle destination change
	 */
	handleDestinationChange: function(destination) {
		return function(event) {
			console.log("Changing destination to ");
			console.log(destination);
			this.setState({ destination: destination });
		}.bind(this);
	},

	/*
	 * Check if a default value is going to be set
	 */
	componentWillMount: function() {
		this.resetSelectState();
	},

	resetSelectState: function() {
		// Set default value as the first stage in the array (the next stage in order above the current one)
		if(this.props.hasOwnProperty('stages') && this.props.stages !== null && this.props.stages.length > 0) {
			this.setState({ destination: this.props.stages[0].id });
		} else {
			this.setState({ destination: "__checkout__" });
		}
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
					<label className={"btn btn-secondary btn-block" + (stage['id'] == this.state.destination ? " active" : "")} key={"finish-modal-option" + index} onClick={this.handleDestinationChange(stage['id'])}>
						<input type="radio" name="destination" defaultChecked={stage['id'] == this.state.destination} />
						{stage['id'] == this.state.destination ? "\u2713" : ""} {stage['name']}
					</label>
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
			<div className="modal fade" id="visit-finish-modal">
			    <div className="modal-dialog modal-sm" role="document">
			        <div className="modal-content">
			            <div className="modal-header">
			                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
			                  <span aria-hidden="true">&times;</span>
			                </button>
			                <h4 className="modal-title">Move visit to...</h4>
			            </div>
			            <div className="modal-body">
			            	<div className="btn-group-vertical btn-group-lg" style={{display: "block"}} data-toggle="buttons">
			            		{destinations}
								<label className={"btn btn-secondary btn-block" + ("__checkout__" == this.state.destination ? " active" : "")} onClick={this.handleDestinationChange("__checkout__")}>
									<input type="radio" name="destination" defaultChecked={"__checkout__" == this.state.destination} />
									{"__checkout__" == this.state.destination ? "\u2713" : ""} Check-out
								</label>
			            	</div>
			            </div>
			            <div className="modal-footer">
			                <button type="button" className="btn btn-success" disabled={this.state.isSubmitting == true} onClick={this.onComplete}>
			                	{buttonText}
			                </button>
			            </div>
			        </div>
			    </div>
			</div>
		);
	}

});