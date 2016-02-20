/*
 * visit/Overview.jsx
 * @author Cameron Kelley
 *
 * Patient overview
 *
 * Accepted properties:
 * - fields: Object of ALL fields for ALL stages up to THIS CURRENT STAGE for displaying patient metadata
 * - patient: Patient object w/ data as pulled from database
 */

Visit.Overview = React.createClass({

	/*
	 *
	 */
	getInitialState: function() {
		return {

			/*
			 * Record card
			 */
			recordVisible: true,
			recordRenderEmpty: true,

			/*
			 * Summary card
			 */
			summaryVisible: true,
			summaryRenderEmpty: false

		};
	},

	/*
	 * Toggle card state property.
	 * @return void
	 */
	toggleCardState: function(value) {
		return function(event) {
			var state = this.state;
			if(state.hasOwnProperty(value)) {
				state[value] = !state[value];
				this.setState(state);
			}
		}.bind(this);
	},

	/*
	 * Build a summary list from patient data and iterable fields.
	 */
	buildList: function(iterableFields, thisPatient, displayEmptyFields) {

		var props = this.props,
			state = this.state,
			fieldsWithData = 0;

		/*
		 * Loop through fields.
		 */
		var list = Object.keys(iterableFields).map(function(field, index) {

			var thisIterableField = iterableFields[field],
				foundData = false,
				isGeneratedField = Visit.generatedFields.hasOwnProperty(field),
				value = "No data", icon;

			console.group("#%s '%s' %O", index + 1, thisIterableField.name, thisIterableField);

			//-- Begin patient field checking --\\
			if(
				thisPatient.hasOwnProperty(field) 	// If this field exists in the patient data
				&& thisPatient[field] !== null	 	// If the data for this field is null, show "No data"
				&& thisPatient[field].toString().length > 0	// If string length == 0 or array length == 0, show "No data"
			) {

				/*
				 * Cache the current field
				 */
				var thisPatientField = thisPatient[field];

				console.info("Patient data: %O", thisPatientField);

				/*
				 * We found data!
				 */
				foundData = true;
				fieldsWithData++;

				/*
				 * Grab field types
				 */
				var fieldType = thisIterableField.type;

				console.log("Type: %s", fieldType);

				/*
				 * Mutate data based on field type.
				 */
				switch(fieldType) {

					/**
					 * Date input
					 */
					case "date":
						if(thisIterableField.hasOwnProperty('settings')
						&& thisIterableField.settings.hasOwnProperty('useBroadMonthSelector')
						&& isTrue(thisIterableField.settings.useBroadMonthSelector)) {

							var modifier = parseInt(thisPatientField, 10); 	// 10 = decimal-based radix

							if(!isNaN(modifier)) {

								var date = new Date(), // instantiate a new date object
									absModifier = Math.abs(modifier);
									humanReadableDateString = "This month";	// assume modifer = 0 => "This month"

								// Change date object's month based on modifier
								date.setMonth(date.getMonth() + modifier);

								// If the modifier is for another month...
								if(modifier !== 0) {
									humanReadableDateString = [
										absModifier,
										(modifier > 0
											? (absModifier > 1 ? "months from now" : "month from now")
											: (absModifier > 1 ? "months ago" : "month ago")
										)
									].join(" ");
								}

								value = (
									<p>
										{humanReadableDateString} ({[(parseInt(date.getMonth(), 10) + 1), date.getFullYear()].join("/")})
									</p>
								);

							} else {
								// Not sure what we're working with, just display the string representation
								value = thisPatientField.toString();
							}

						} else {
							// Not sure what we're working with, just display the string representation
							value = thisPatientField.toString();
						}
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
					case "file":
						// Convert from JSON array to nice string
						var arr;

						/*
						 * The data should be an array already.
						 * If so, just pass it back.
						 * Otherwise, try to convert.
						 */
						if(Array.isArray(thisPatientField)) {
							arr = thisPatientField;
						} else {
							try {
								arr = JSON.parse(thisPatientField);
							} catch(e) {
								arr = [];
							}
						}


						/*
						 * Return a value as long as we
						 * have more than one array value.
						 */
						if(Array.isArray(arr) && arr.length > 0) {

							/*
							 * Run the switch loop again
							 */
							switch(fieldType) {
								case "multiselect":
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
									break;
								case "file":
									value = arr.map(function(resourceID, index) {
										return (
											<Fields.Resource
												id={resourceID} />
										);
									});
									break;
							}

						}

						break;


					/**
					 * Pharmacy field
					 *
					 * Displays a small label with the
					 * prescription set ID
					 */
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
				console.log("No data.");

				/*
				 * If we shouldn't display empty fields,
				 * jump to next iteration before rendering
				 * the list item element.
				 */
				if(!displayEmptyFields) {
					console.groupEnd(); // End: "Field %i..."
					return;
				}
			}

			console.groupEnd(); // End: "Field %i..."

			//-- End patient field checking --\\


			/*
			 * Choose which icon to display
			 */
			if(!isGeneratedField) {
				if(foundData) {

					/*
					 * check mark icon
					 */
					icon = (
						<span className="text-success">
							{"\u2713"}
						</span>
					);
				} else {

					/*
					 * x icon
					 */
					icon = (
						<span className="text-danger">
							{"\u2717"}
						</span>
					);
				}
			} else {

				/*
				 * right arrow icon
				 */
				icon = "\u27a0";
			}

			/*
			 * Return this list item.
			 */
			if(thisIterableField.type === "header") {
				return (
					<div className="list-group-item forcept-patient-overview-header-item" key={field + "-" + index}>
						<h6 className="text-center m-a-0">
							{thisIterableField.name}
						</h6>
					</div>
				);
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

		}.bind(this));

		/*
		 * If at least one field had data,
		 * display the list. Otherwise, display a message.
		 */
		if(fieldsWithData === 0) {
			return (
				<div className="list-group-item">
					<strong>No data found.</strong>
				</div>
			);
		} else return list;

	},

	/*
	 * Render patient overview blocks
	 */
	render: function() {

		var patientOverview,
			patientSummary,
			iterableFields,
			props = this.props,
			state = this.state,
			thisPatient = props.patient;

		console.groupCollapsed("Visit.PatientsOverview: render"); // keep this collapsed
			console.log("Properties: %O", props);

		/*
		 * Copy the local patient fields property to a new variable
		 */
		iterableFields = jQuery.extend(jQuery.extend({}, props.fields), Visit.generatedFields);

		/*
		 * Remove fields that have custom display settings
		 */
		delete iterableFields["first_name"];
		delete iterableFields["last_name"];
		delete iterableFields["photo"];

		/*
		 * Check if summary fields were found.
		 */
		var foundSummaryFields = props.hasOwnProperty("summaryFields")
			&& typeof props.summaryFields === "object"
			&& props.summaryFields !== null
			&& Object.keys(props.summaryFields).length > 0;

		/*
		 * Determine column sizing.
		 */

		var masterColumnSize = "col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-3", // Overview container size. default assumes no summary fields
			innerColumnSize  = "col-xs-12"; // Size of overview list within container. default assumes no summary fields

		if(foundSummaryFields) {

			/*
			 * Expand master column size, divide each card into half the area
			 */
			masterColumnSize = "col-xs-12 col-sm-12 col-md-12 col-lg-6 col-xl-6";
			innerColumnSize  = "col-xs-12 col-sm-6";

		}

		if(!state.recordVisible || !state.summaryVisible) {

			/*
			 * If either are hidden, combine back into one column
			 */
			masterColumnSize = "col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-3";
			innerColumnSize  = "col-xs-12";

		}

		/*
		 * Build patient summary card.
		 */
		patientSummary = (function() {

			/*
			 * Test for available summaryFields.
			 */
			 if(foundSummaryFields) {

				var summaryList;

				/*
				 * If the summary is marked as visible...
				 */
				if(state.summaryVisible) {

					/*
					 * Build summary list
					 */
					summaryList = (
						<div className="list-group list-group-flush">
							{this.buildList(props.summaryFields, thisPatient, state.summaryRenderEmpty)}
						</div>
					);
				} else {

					/*
					 * Show a message reminding the user
					 * that the list is hidden.
					 */
					summaryList = (
		            	<div className="list-group list-group-flush">
							<div className="list-group-item text-muted">
								<small>Hidden - use the <span className="fa fa-chevron-up"></span> button to expand.</small>
							</div>
		                </div>
					);

				}

				/*
				 * Build patient summary card with generated list.
				 */
				return (
					<div className={innerColumnSize}>
						<div className="forcept-patient-summary card">
							<div className="card-header" onClick={this.toggleCardState("summaryVisible")}>
								<h6 className="m-b-0">
									<span className="fa fa-user-md"></span>
									&nbsp; Visit Summary
									<span className={["pull-right fa", state.summaryVisible ? "fa-chevron-down" : "fa-chevron-up"].join(" ")}></span>
								</h6>
							</div>
							{summaryList}
							<div className="card-footer">
								<div className="dropdown">
									<span className="fa fa-cog" data-toggle="dropdown"></span>
									<div className="dropdown-menu dropdown-menu-top">
										<h6 className="dropdown-header">Card settings</h6>
										<a className="dropdown-item" onClick={this.toggleCardState("summaryRenderEmpty")}>
											{state.summaryRenderEmpty ? "Hide empty fields" : "Display empty fields"}
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				);

			} else return;

		}.bind(this))();

		//-- Build patientOverview card --\\
		patientOverview = (function() {

			var cardHeader,
				photo,
				recordList;

			/*
			 * If the patient record is open...
			 */
			if(state.recordVisible) {

				/*
				 * Build list for patient record
				 */
				recordList = (
	            	<div className="list-group list-group-flush">
						{this.buildList(iterableFields, thisPatient, state.recordRenderEmpty)}
	                </div>
				);

				//-- Begin search for patient photo --\\
				if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {

					var resources = props.hasOwnProperty("resources") ? props.resources : {}, // Grab resources passed as properties to Overview
						resourceKeys = []; // Array of resource IDs to search for / fetch

					console.group("Photo:");
						console.log("This patient has a photo property.");

					try {
						if(typeof thisPatient.photo === "string") {
							console.log("The photo property is a STRING");

							// Attempt to...
							try {
								// ...parse JSON from database as string
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

					// If we found some resources to load...
					if(resourceKeys.length > 0) {

						// Since Photo field only allows one upload, we'll grab the first key in the array
						// (it's probably the only key...)
						var photoKey = resourceKeys[0];

						console.log("Photo resource ID is %s, checking resource storage...", photoKey);

						// Check if we have this resource in storage already.
						if(resources.hasOwnProperty(photoKey)) {

							// For the immutable Photo input, the one and only file is the patient photo.
							var photoData = resources[photoKey];

							console.log("Photo found in preloaded resources: %O", photoData);

							photo = (
								<Fields.Resource
									id={photoKey}
									resource={{ type: "image/jpeg", data: photoData.data}}
									handleStoreResource={props.onStoreResource} />
							);

						} else {
							console.log("Photo not found in resources, creating resource object with instructions to grab resource via AJAX");

							photo = (
								<Fields.Resource
									id={photoKey}
									resource={{ type: "image/jpeg" }}
									handleStoreResource={props.onStoreResource} />
							);
						}
					}

					console.groupEnd(); // End "Photo:"

				}
				//-- End photo search --\\

			} else {

				/*
				 * Show a message reminding the user
				 * that the list is hidden.
				 */
				recordList = (
	            	<div className="list-group list-group-flush">
						<div className="list-group-item text-muted">
							<small>Hidden - use the <span className="fa fa-chevron-up"></span> button to expand.</small>
						</div>
	                </div>
				);

			}


			//-- Begin render patient card --\\
			var patientCardDOM = (
				<div className={innerColumnSize}>
					<div className="card forcept-patient-summary">
						<div className="card-header" onClick={this.toggleCardState("recordVisible")}>
							<h6 className="m-b-0">
								<span className="fa fa-clipboard"></span>
								&nbsp; Patient record
								<span className={["pull-right fa", state.recordVisible ? "fa-chevron-down" : "fa-chevron-up"].join(" ")}></span>
							</h6>
						</div>
						{photo}
						{recordList}
						<div className="card-footer">
							<div className="dropdown">
								<span className="fa fa-cog" data-toggle="dropdown"></span>
								<div className="dropdown-menu dropdown-menu-top">
									<h6 className="dropdown-header">Card settings</h6>
									<a className="dropdown-item" onClick={this.toggleCardState("recordRenderEmpty")}>
										{state.recordRenderEmpty ? "Hide empty fields" : "Display empty fields"}
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
			//-- End build patient card DOM --\\

			/*
			 * Return the patient card DOM
			 */
			return patientCardDOM;

		}.bind(this))();

		console.log("Done with PatientOverview group...");
		console.groupEnd(); // End: "PatientsOverview"

		return (
	        <div className={masterColumnSize}>
	        	<div className="row">
					{patientOverview}
					{patientSummary}
				</div>
	        </div>
	    );
	}

});
