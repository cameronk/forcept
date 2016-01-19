/*
 * Properties:
 *  - stageType:
 *  - ref
 *  - field-key
 *  - type: type of the input for which we are showing options
 *  - mutable: is the field mutable
 *  - settings: previously defined settings stage
 *
 *  - onChange: define handler for when options change
 */
FlowEditor.Field.Settings = React.createClass({

	/*
	 * Return initial state based on property type
	 */
	getInitialState: function() {

		console.group("FlowEditor.Field.Settings: getInitialState");
		console.log("Type: %s", this.props.type);

		var initialState = {};
		// Return initial state if settings are necessary for this file type
		switch(this.props.type) {

			// Date input
			case "date":
				console.log("Dialog is for date field, returning initial date options.");
				initialState = {
					useBroadMonthSelector: false
				};
				break;


			// Select input
			case "select":
				console.log("Dialog is for select field, returning initial select options.");
				initialState = {
					options: {},
					allowCustomData: false,
				};
				break;

			// Multiselect input
			case "multiselect":
				console.log("Dialog is for multiselect field, returning initial select options.");
				initialState = {
					options: {},
				};
				break;

			// File input
			case "file":
				initialState = {
					accept: []
				};
				break;

			// For all others...
			default:
				console.log("Field does not need settings, skipping.");
				break;
		}


		console.groupEnd();

		return initialState;
	},

	/*
	 * Prepare component for mounting
	 */
	componentWillMount: function() {

		console.group("FlowEditor.Field.Settings: componentWillMount");
		console.log("Props: %O", this.props);
		console.log("Type: %s", this.props.type);

		// If we have a field type that requires settings, load default settings into state
		switch(this.props.type) {

			// Select field type
			case "date":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {
					console.log("DATE FIELD: props.settings found");
					// If there's a set value for allowing custom data...
					if(this.props.settings.hasOwnProperty("useBroadMonthSelector") && this.props.settings.useBroadMonthSelector == "true") {
						console.log("DATE FIELD: use broad month selector == true");
						this.setState({ useBroadMonthSelector: (this.props.settings.useBroadMonthSelector == "true") });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;

			// Select field type
			case "select":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						this.setState({ options: this.props.settings.options });
					}

					// If there's a set value for allowing custom data...
					if(this.props.settings.hasOwnProperty("allowCustomData") && this.props.settings.allowCustomData == "true") {
						this.setState({ allowCustomData: (this.props.settings.allowCustomData == "true") });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;

			// Multiselect field type
			case "multiselect":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						this.setState({ options: this.props.settings.options });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;

			// File field type
			case "file":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("accept")) {
						this.setState({ accept: this.props.settings.accept });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;
		}

		console.groupEnd();
	},

	/*
	 * Component completed mounting (debug)
	 */
	componentDidMount: function() {
		console.log("Component 'FlowEditorFieldConfiguratorSettingsDialog' mounted, state is now:");
		console.log(this.state);
 		console.log("--[/mount: " + this.props['field-key'] + "]--");
 		console.log("");
	},

	/*
	 * Handle adding of a new option (SELECT/MULTISELECT type)
	 */
	handleAddOption: function() {

		console.log("");
		console.log("--[add option: " + this.props['field-key'] + "]--");

		var push = function() {

			// Grab options object, add a new entry with default option state based on stage type
			var options = this.state.options;
				options[new Date().getTime()] = FlowEditor.getDefaultOptionState(this.props.stageType);

			// Push to our local state
			this.setState({ options: options });

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

			console.log("--[/add option: " + this.props['field-key'] + "]--");
			console.log("");

		}.bind(this);

		if(!this.state.hasOwnProperty('options')) {
			// No options yet (type was probably just changed to select), add one.
			// Make sure to set other initial state values first
			console.log("\t| Missing options property, returning component to initial state and continuing...");
			this.setState(this.getInitialState(), function() {
				push();
			}.bind(this));
		} else {
			console.log("\t| Options array exists, pushing...");
			push();
		}

	},

	/*
	 * Handle removing of an option (SELECT/MULTISELECT type)
	 */
	handleRemoveOption: function(optionKey) {
		// Cache options object
		var options = this.state.options;

		// Get rid of it!
		if(options.hasOwnProperty(optionKey)) {
			delete options[optionKey];
		}

		this.setState({ options: options }, function() {

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

		}.bind(this));
	},

	/*
	 * Handle change option position (SELECT/MULTISELECT type)
	 */
	handleChangeOptionPosition: function(where, optionKey) {
		return function(event) {

			console.log("Looking to move '" + optionKey + "' " + where);

			var options = this.state.options;
			var keys = Object.keys(options);
			var value = options[optionKey]; 		// Get option data object at optionKey
			var index = keys.indexOf(optionKey);	// Get index of optionKey

			// If the index was found
			if(index !== -1) {

				console.log(" -> found @ index " + index);

				var cacheKey;
				var indexKey = keys[index];

				switch(where) {
					case "up":
						cacheKey = keys[index - 1]; // get option KEY corresponding to the index above
						break;
					case "down":
						cacheKey = keys[index + 1]; // get option KEY corresponding to the index below
						break;
				}

				// Get option value object by index
				var cacheValue = options[cacheKey];
					options[cacheKey] = value;
					options[indexKey] = cacheValue;

				console.log(" -> caching key: " + cacheKey);
				console.log(" -> value @ cached key: " + cacheValue);
				console.log(" -> New options:");
				console.log(options);

				this.setState({
					options: options
				}, function() {
					// Bump state up to parent for aggregation
					this.props.onChange(this.state);
				}.bind(this));

			} else {
				console.log("WARNING: " + where + " not found in options");
			}
		}.bind(this);
	},

	/*
	 * Handle change of option text (SELECT/MULTISELECT type)
	 */
	handleChangeOptionText: function(optionKey) {
		return function(event) {
			var options = this.state.options;

			// If the option at this index exists
			if(options.hasOwnProperty(optionKey)) {
				options[optionKey].value = event.target.value;
			}

			this.setState({ options: options }, function() {
				// Bump changes to parent element for aggregation
				this.props.onChange(this.state);
			}.bind(this));


		}.bind(this);
	},

	/*
	 * Handle change of allow custom data checkbox (SELECT/MULTISELECT type)
	 */
	handleAllowCustomDataChange: function() {

		var newStatus = !this.state.allowCustomData;
		this.setState({ allowCustomData: newStatus }, function() {
			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);
		});

	},

	/*
	 * Handle change of allow custom data checkbox (SELECT/MULTISELECT type)
	 */
	handleBroadMonthSelectorChange: function() {
		console.log("handleBroadMonthSelectorChange");
		var newStatus = !this.state.useBroadMonthSelector;
		this.setState({ useBroadMonthSelector: newStatus }, function() {
			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);
		});
	},

	/**
	 * Change the allowed filetypes (FILE field type)
	 */
	handleChangeAllowedFiletypes: function(event) {

		var options = event.target.options;
		var values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}

		console.log("Allowed filetypes is now:");
		console.log(values);
		console.log(this.state);

		this.setState({ accept: values }, function() {
			this.props.onChange(this.state);
		}.bind(this));
	},

	/*
	 *
	 */
	handleDrugQuantityChange: function(optionKey) {
		return function(event) {
			var options = this.state.options;
				options[optionKey].count = parseInt(event.target.value);

			this.setState({
				options: options
			}, function() {
				this.props.onChange(this.state);
			}.bind(this));
		}.bind(this);
	},

	/*
	 *
	 */
	handleDrugAvailabilityChange: function(optionKey) {
		return function(event) {
			var options = this.state.options;
				options[optionKey].available = (event.target.value == "true");

			this.setState({
				options: options
			}, function() {
				this.props.onChange(this.state);
			}.bind(this));

		}.bind(this);
	},

	/*
	 * Render the settings dialog
	 */
	render: function() {

		console.log("Rendering settings dialog for type " + this.props.type);

		var mutabilityMessage;

		// Add a message if this field is immutable
		if(this.props.mutable == false) {
			mutabilityMessage = (
				<div className="alert alert-danger">
					<strong>Notice:</strong> This field is protected. Only the display name and type-based settings can be modified.
				</div>
			);
		} else {
			mutabilityMessage = (
				<span></span>
			);
		}

		switch(this.props.type) {
			case "text":
			case "textarea":
			case "number":
			case "yesno":
			case "header":
			case "pharmacy":
				return (
					<div>
						<div className="alert alert-info m-t">
							No configuration is required for {this.props.type} inputs.
						</div>
						{mutabilityMessage}
					</div>
				);
				break;

			case "date":
				return (
					<div className="form-group row">
						<div className="col-sm-12">
							<h2>Settings</h2>
							<div className="checkbox m-t">
								<label>
									<input type="checkbox"
										checked={this.state.useBroadMonthSelector == true}
										onChange={this.handleBroadMonthSelectorChange} />
										Use broad month selector instead of specific date selector
								</label>
							</div>
							{mutabilityMessage}
						</div>
					</div>
				);
				break;
			case "select":
			case "multiselect":

				console.log(" -> Options:");
				console.log(this.state.options);

				var optionInputs,
					customDataCheckbox;

				var noOptionsDefined = function() {

					// No options available, show info message
					optionInputs = (
						<div className="alert alert-info">
							No options have been defined &mdash; try <a className="alert-link" onClick={this.handleAddOption}>adding one</a>.
						</div>
					);

				};

				if(this.state.hasOwnProperty('allowCustomData') && this.state.allowCustomData == true) {
					customDataCheckbox = (
						<div className="col-sm-12">
							<div className="checkbox m-t">
								<label>
									<input type="checkbox"
										checked={this.state.allowCustomData == true}
										onChange={this.handleAllowCustomDataChange} />
										Allow users to enter custom data for this field
								</label>
							</div>
						</div>
					);
				}

				// If there are options in the state
				if(this.state.hasOwnProperty('options')) {
					var optionKeys = Object.keys(this.state.options);

					if(optionKeys.length > 0) {

						// Map option input containers to one variable
						optionInputs = optionKeys.map(function(optionKey, index) {
							// console.log(" : " + index + "=" + value);

							var thisOption = this.state.options[optionKey];
							var upButton,
								downButton,
								drugOptions;

							if(index !== 0) {
								upButton = (
									<button type="button" className="btn btn-primary" onClick={this.handleChangeOptionPosition("up", optionKey)}>
										&uarr;
									</button>
								);
							}

							if(index !== (optionKeys.length - 1)) {
								downButton = (
									<button type="button" className="btn btn-primary" onClick={this.handleChangeOptionPosition("down", optionKey)}>
										&darr;
									</button>
								);
							}

							var pharmacyAvailableIcon;
							if(this.props.stageType == "pharmacy") {
								if(isTrue(thisOption.available)) {
									pharmacyAvailableIcon = (
										<span className="label label-success col-sm-1">
											Check
										</span>
									);
								} else {
									pharmacyAvailableIcon = (
										<span className="label label-default col-sm-1">
											x
										</span>
									);
								}
								drugOptions = (
									<div className="col-xs-11 col-sm-offset-1">
										<div className="row">
											<div className="col-xs-12 col-sm-6">
												<div className="input-group input-group-sm">
													<input
														type="number"
														className="form-control"
														min={0}
														value={thisOption.count}
														onChange={this.handleDrugQuantityChange(optionKey)} />
													<span className="input-group-addon">
														qty in stock
													</span>
												</div>
											</div>
											<div className="col-xs-12 col-sm-6">
												<div className="input-group input-group-sm">
													<span className="input-group-addon">
														available
													</span>
													<select
														className="form-control"
														defaultValue={thisOption.available}
														onChange={this.handleDrugAvailabilityChange(optionKey)}>
														<option value={true}>Yes</option>
														<option value={false}>No</option>
													</select>
												</div>
											</div>
										</div>
									</div>
								);

							}



							return (
								<div className={(this.props.stageType !== "pharmacy" ? "field-select-option " : "") + "form-group row"} key={index}>
									{pharmacyAvailableIcon}
									<div className={this.props.stageType !== "pharmacy" ? "col-sm-12" : "col-sm-11"}>
										<div className="input-group input-group-sm">
											<input type="text"
												placeholder="Enter a value for this option"
												className="form-control"
												value={thisOption.value}
												onChange={this.handleChangeOptionText(optionKey)} />
											<span className="input-group-btn">
												{upButton}
												{downButton}
												<button type="button" className="btn btn-danger" onClick={this.handleRemoveOption.bind(this, optionKey)}>
												  	<span>&times;</span>
												</button>
											</span>
										</div>
									</div>
									{drugOptions}
								</div>
							);
						}.bind(this));

					} else {
						noOptionsDefined();
					}
				} else {
					noOptionsDefined();
				}

				return (
					<div className="field-select-options-contain p-t">
		            	<h5>{this.props.stageType == "pharmacy" ? "Drugs in this category" : "Options"} ({ this.state.hasOwnProperty('options') ? Object.keys(this.state.options).length : 0 })</h5>
						{optionInputs}
						{customDataCheckbox}
						{mutabilityMessage}
						<button type="button" className="btn btn-primary-outline" onClick={this.handleAddOption}>
							Add another {this.props.stageType == "pharmacy" ? "drug" : "option"}
						</button>
					</div>
				);

				break;

			case "file":
				return (
					<div className="field-select-options-contain">
						<h5>Accepted file types</h5>
						<select className="form-control" multiple={true} onChange={this.handleChangeAllowedFiletypes} defaultValue={this.state.accept}>
							<option value="image/*">image / *</option>
						</select>
						{mutabilityMessage}
					</div>
				);
				break;

			default:
				return (
					<div>
						<div className="alert alert-danger m-t">
							Unrecognized input type "{this.props.type}"
						</div>
						{mutabilityMessage}
					</div>
				);
				break;
		}
	}
});
