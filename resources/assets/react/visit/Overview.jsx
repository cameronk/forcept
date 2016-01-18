/*
 * Patients overview (left sidebar)
 *
 * Accepted properties:
 * - fields: Object of ALL fields for ALL stages up to THIS CURRENT STAGE for displaying patient metadata
 * - patients: Object of patients w/ data as pulled from database
 *
 * - mini: should this display as a card instead of a column
 */
Visit.PatientsOverview = React.createClass({

	/*
	 * Render patient overview blocks
	 */
	render: function() {

		var props = this.props,
			patientKeys = Object.keys(props.patients),
			countPatients = patientKeys.length,
			patientOverviews,
			iterableFields;

		console.log("[Visit.PatientsOverview]->render(): " + countPatients + " (mini=" + props.mini + ")");
		console.log(props);

		// Copy the local patient fields property to a new variable
		// and remove first/last name, so they don't appear in the list
		if(props.mini == true) {
			iterableFields = jQuery.extend({}, props.fields);
		} else {
			iterableFields = jQuery.extend(jQuery.extend({}, props.fields), Visit.generatedFields);
		}

		// Remove fields that are displayed differently than normal
		delete iterableFields["first_name"];
		delete iterableFields["last_name"];
		delete iterableFields["photo"];

		// If there are patients in the props object
		if(countPatients > 0) {
			patientOverviews = patientKeys.map(function(patientID, index) {
				var cardHeader,
					photo,
					thisPatient = props.patients[patientID];

				if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {

					console.log("[Visit.PatientOverview][" + patientID + "]: has photo");

					var resourceKeys,
						resources = props.hasOwnProperty("resources") ? props.resources : {};

					try {
						if(typeof thisPatient.photo === "string") {
							console.log("[Visit.PatientOverview][" + patientID + "]: photo is STRING");
							// Parse JSON from database as string
							resourceKeys = JSON.parse(thisPatient.photo);
						} else {
							console.log("[Visit.PatientOverview][" + patientID + "]: photo is NOT STRING");
							// Otherwise, just push the object
							resourceKeys = thisPatient.photo;
						}
					} catch(e) {
						console.log("[Visit.PatientOverview][" + patientID + "]: error parsing photo string");
						resourceKeys = [];
					}

					if(resourceKeys.length > 0) {

						var photoKey = resourceKeys[0];

						console.log("[Visit.PatientOverview][" + patientID + "]: Valid resources array obtained, looking for photo...");

						// Check if we have this resource in storage already.
						if(resources.hasOwnProperty(photoKey)) {

							console.log("[Visit.PatientOverview][" + patientID + "]: Photo found in our pre-loaded resources.");

							// For the immutable Photo input, the one and only file is the patient photo.
							var photoData = resources[photoKey];

							console.log("[Visit.PatientOverview]->render(patientID=" + patientID + "): has photo");

							photo = (
								<Fields.Resource
									id={photoKey}
									resource={{ type: "image/jpeg", base64: photoData.data}} />
							);

						} else {
							console.log("[Visit.PatientOverview][" + patientID + "]: photo not in resources, preparing to grab via AJAX");

							photo = (
								<Fields.Resource
									id={resourceKeys[0]}
									resource={{ type: "image/jpeg" }} />
							);
						}
					}

				}

				// Show header if we're not in Mini mode
				if(props.mini == false) {
					cardHeader = (
						<span>
			               	<div className="card-header">
			                    <span className="label label-info">#{index + 1}</span>
			                    <span className="label label-default">{patientID}</span>
			                </div>
			                <div className="card-block">
			                	<h4 className="card-title text-xs-center m-a-0">
			                		<strong>
										{Utilities.getFullName(thisPatient)}
									</strong>
			                	</h4>
			                </div>
			                {photo}
			            </span>
			        );
				}

				console.log("[Visit.PatientsOverview] Rendering patient overview card - ID #" + patientID);

				return (
					<div className="card forcept-patient-summary" key={patientID}>
						{cardHeader}
		              	<div className="list-group list-group-flush">
		                    {Object.keys(iterableFields).map(function(field, index) {

		                    	var thisIterableField = iterableFields[field],
									foundData = false,
									isGeneratedField = Visit.generatedFields.hasOwnProperty(field),
									value = "No data",
									icon;

		                    	if(
		                    		thisPatient.hasOwnProperty(field) 	// If this field exists in the patient data
		                    		&& thisPatient[field] !== null	 	// If the data for this field is null, show "No data"
		                    		&& thisPatient[field].length > 0	// If string length == 0 or array length == 0, show "No data"
		                    	) {

									var thisPatientField = thisPatient[field];

		                    		if(!(props.mini == true && isGeneratedField)) // Don't show generated fields in Mini mode
		                    		{
			                    		if( ["string", "number"].indexOf(typeof thisPatientField) !== -1 ) // If the field is a string or number
			                    		{

			                    			// We found data!
			                    			foundData = true;

											// Grab field types
											var fieldType = thisIterableField.type;

			                    			console.log(" | Field " + thisIterableField.name + " is string or number");
			                    			console.log(" | -> type: " + fieldType);

			                    			// We might need to mutate the data
			                    			switch(fieldType) {

			                    				/**
			                    				 * Things with multiple lines
			                    				 */
			                    				case "textarea":
			                    					value = (
			                    						<p dangerouslySetInnerHTML={{ __html: thisPatientField.replace(/\n/g, "<br/>") }}></p>
			                    					);
			                    					break;

			                    				/**
			                    				 * Things stored as arrays
			                    				 */
			                    				case "multiselect":
			                    				case "pharmacy":
			                    					// Convert from JSON array to nice string
													var arr;
			                    					try {
														arr = JSON.parse(thisPatientField);
													} catch(e) {
														arr = [];
													}

													// Make sure it worked
			                    					if(Array.isArray(arr) && arr.length > 0) {
														// console.log("[Visit.PatientsOverview] Found " + arr.length + " prescriptions for patient #" + patientID);
														// console.log(props.hasOwnProperty("onFindPrescription"));
														// if(fieldType === "pharmacy" && props.hasOwnProperty("onFindPrescription")) {
															// props.onFindPrescription(patientID, arr);
														// }
			                    						value = arr.join(", ");
			                    					}

			                    					console.log(" | Multiselect value: " + value);

			                    					break;

			                    				/**
			                    				 * Things stored as base64
			                    				 */
			                    				case "file":

													// Convert from JSON array to nice string
													var arr;
													try {
														arr = JSON.parse(thisPatientField);
													} catch(e) {
														arr = [];
													}

													value = arr.map(function(resourceID, index) {
														return (
															<Fields.Resource
																id={resourceID} />
														);
													});

			                    					/*var split = thisPatient[field].toString().split(";");
			                    					var dataSection = split[0]; // data:image/png

			                    					if(dataSection.split("/")[0] == "data:image") {
				                    					value = (
				                    						<div className="patient-photo-contain">
				                    							<img src={thisField.toString()} />
				                    						</div>
				                    					);
			                    					} else {
			                    						value = "1 file, " + getFileSize(thisPatient[field]);
			                    					}*/

			                    					break;

			                    				/**
			                    				 * Everything else (single-value data points)
			                    				 */
			                    				default:
			                    					value = thisPatientField.toString();
			                    					break;
			                    			}
			                    		} else {
			                    			console.log(" | Field " + thisIterableField["name"] + " is NOT string or number");
			                    			console.log(" | -> type: " + thisIterableField.type);
			                    			if( Array.isArray(thisPatientField) ) // If the data is an array
			                    			{
			                    				// We found data!
			                    				foundData = true;
			                    				value = thisPatientField.join(", ");
			                    			} else {
			                    				// WTF is it?
			                    				console.log("WARNING: unknown field data type for field " + field);
			                    			}
			                    		}
			                    	}
		                    	}

		                    	// Choose which icon to display
		                    	if(!isGeneratedField) {
		                    		if(foundData) {
		                    			icon = (
		                    				<span className="text-success">
		                    					{"\u2713"}
		                    				</span>
		                    			);
		                    		} else {
		                    			icon = (
		                    				<span className="text-danger">
		                    					{"\u2717"}
		                    				</span>
		                    			);
		                    		}
		                    	} else {
		                    		icon = "\u27a0";
		                    	}

		                    	// Render the list item
		                    	if(thisIterableField.type == "header") {
		                    		if(props.mini == false) {
			                    		return (
			                    			<div className="list-group-item forcept-patient-overview-header-item" key={field + "-" + index}>
			                    				<h5 className="text-center m-a-0">
			                    					{thisIterableField.name}
			                    				</h5>
			                    			</div>
			                    		);
			                    	}
		                    	} else {
									return (
										<div className="list-group-item" key={field + "-" + index}>
											<dl>
												<dt>{icon} &nbsp; {thisIterableField.name}</dt>
												<dd>{foundData ? value : ""}</dd>
											</dl>
										</div>
									);
		                    	}
	                    	}.bind(this))}
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

		// If we're in mini mode, use different column structure
		if(props.mini == true) {
			return (
		        <div className="col-xs-12 col-lg-6">
		           {patientOverviews}
		        </div>
			);
		} else return (
	        <div className="col-xs-12 col-sm-12 col-md-4 col-xl-3">
	           {patientOverviews}
	        </div>
	    );
	}

});
