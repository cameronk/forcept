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

		console.group("Visit.PatientsOverview: render (mini=%s)", props.mini);
			console.log("Patients to overview: %i", countPatients);
			console.log("Properties: %O", props);

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

			//-- Begin mapping patient keys --\\
			patientOverviews = patientKeys.map(function(patientID, index) {
				var cardHeader,
					photo,
					thisPatient = props.patients[patientID];

				console.groupCollapsed("Card #%i: Patient %s", index, patientID);

				//-- Begin search for patient photo --\\
				if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {

					console.group("Photo:");
						console.log("This patient has a photo property.");

					var resourceKeys,
						resources = props.hasOwnProperty("resources") ? props.resources : {};

					try {
						if(typeof thisPatient.photo === "string") {
							console.log("The photo property is a STRING");

							// Attempt to..
							try {
								// Parse JSON from database as string
								resourceKeys = JSON.parse(thisPatient.photo);
							} catch(e) {
								console.error("Failed to parse photo string into JSON array.");
								resourceKeys = [];
							}

						} else {
							console.log("The photo property is NOT a STRING");
							console.info("Photo property type: %s", typeof thisPatient.photo);

							// Otherwise, just push the object
							resourceKeys = thisPatient.photo;
						}
					} catch(e) {
						console.error("Some sort of error parsing photo string (not a JSON error...)");
						resourceKeys = [];
					}

					if(resourceKeys.length > 0) {

						// Since Photo field only allows one upload, we'll grab the first key in the array
						// (it's probably the only key...)
						var photoKey = resourceKeys[0];

						console.log("Photo resource ID is %i, checking resource storage...", photoKey);

						// Check if we have this resource in storage already.
						if(resources.hasOwnProperty(photoKey)) {

							// For the immutable Photo input, the one and only file is the patient photo.
							var photoData = resources[photoKey];

							console.log("Photo found in preloaded resources: %O", photoData);

							photo = (
								<Fields.Resource
									id={photoKey}
									resource={{ type: "image/jpeg", base64: photoData.data}} />
							);

						} else {
							console.log("Photo not found in resources, creating resource object with instructions to grab resource via AJAX");

							photo = (
								<Fields.Resource
									id={photoKey}
									resource={{ type: "image/jpeg" }} />
							);
						}
					}

					console.groupEnd(); // End "Photo:"

				}
				//-- End photo search --\\

				// Show header if we're not in Mini mode
				if(props.mini === false) {
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

				//-- Begin render patient card --\\
				var patientCardDOM = (
					<div className="card forcept-patient-summary" key={patientID}>
						{cardHeader}
		              	<div className="list-group list-group-flush">
		                    {Object.keys(iterableFields).map(function(field, index) {

		                    	var thisIterableField = iterableFields[field],
									foundData = false,
									isGeneratedField = Visit.generatedFields.hasOwnProperty(field),
									value = "No data",
									icon;

								console.group("Field #%i: %s", index, thisIterableField.name);


								//-- Begin patient field checking --\\
		                    	if(
		                    		thisPatient.hasOwnProperty(field) 	// If this field exists in the patient data
		                    		&& thisPatient[field] !== null	 	// If the data for this field is null, show "No data"
		                    		&& thisPatient[field].length > 0	// If string length == 0 or array length == 0, show "No data"
		                    	) {

									var thisPatientField = thisPatient[field];

									console.info("Patient data: %O", thisPatientField);

		                    		if(!(props.mini == true && isGeneratedField)) // Don't show generated fields in Mini mode
		                    		{
			                    		if( ["string", "number"].indexOf(typeof thisPatientField) !== -1 ) // If the field is a string or number
			                    		{

			                    			// We found data!
			                    			foundData = true;

											// Grab field types
											var fieldType = thisIterableField.type;

											console.log("Type: %s", fieldType);

			                    			// We might need to mutate the data
			                    			switch(fieldType) {

												/**
												 * Date input
												 */
												case "date":
													/*if(thisIterableField.hasOwnProperty('settings') && thisIterableField.settings.hasOwnProperty('useBroadMonthSelector') && isTrue(thisIterableField.settings.useBroadMonthSelector)) {
														var date = new Date(),
															split = thisPatientField.toString().split("/"); // mm/dd/yyyy

															date.setMonth(parseInt(split[0]) - 1, split[1]);
															date.setFullYear(split[2]);

														value = Utilities.timeAgo(
															date
														);
													} else {*/
														value = thisPatientField.toString();
													// }
													break;

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
			                    					// Convert from JSON array to nice string
													var arr;
			                    					try {
														arr = JSON.parse(thisPatientField);
													} catch(e) {
														arr = [];
													}


													// Make sure it worked
			                    					if(Array.isArray(arr) && arr.length > 0) {
			                    						value = (
															<ul className="list-unstyled">
																{arr.map(function(optionValue, optionIndex) {
																	return (
																		<li key={[optionValue, optionIndex].join("-")}>
																			{'\u26ac'} {optionValue}
																		</li>
																	);
																})}
															</ul>
														);
			                    					}

			                    					console.log("Multiselect value: %s", value);

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
														console.error("Failed to convert file resource array from string to array.");
														arr = [];
													}

													value = arr.map(function(resourceID, index) {
														return (
															<Fields.Resource
																id={resourceID} />
														);
													});

			                    					break;

												case "pharmacy":
													value = (
														<span className="label label-default">
															Set ID: {thisPatientField.toString()}
														</span>
													);
													break;

			                    				/**
			                    				 * Everything else (single-value data points)
			                    				 */
			                    				default:
			                    					value = thisPatientField.toString();
			                    					break;
			                    			}
			                    		} else {
											console.warning("Field isn't a string or number..");
			                    			if( Array.isArray(thisPatientField) ) // If the data is an array
			                    			{
												console.info("We're good, it's an array!");
			                    				// We found data!
			                    				foundData = true;
			                    				value = thisPatientField.join(", ");
			                    			} else {
			                    				// WTF is it?
			                    				console.error("WARNING: unknown field data type");
			                    			}
			                    		}
			                    	}
		                    	}
								//-- End patient field checking --\\


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

								console.groupEnd(); // End: "Field %i..."

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
				//-- End build patient card DOM --\\

				console.groupEnd(); // End "Patient %i"

				// Return the patient card DOM
				return patientCardDOM;

			}.bind(this));
			//-- End patient fields map --\\

		} else { //-- end: if there are patients in the patient object --\\
			patientOverviews = (
				<div className="alert alert-info hidden-sm-down">
					No patients within this visit.
				</div>
			);
		}

		console.log("Done with PatientOverview group...");
		console.groupEnd(); // End: "PatientsOverview"

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
