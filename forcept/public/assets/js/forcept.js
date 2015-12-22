/**
 * Forcept.jsx
 */

/*
 * Add debug data to tooltip
 */
function __debug(data) {
	$("#forcept-debug-content code").html(data)
}

/* =================================================== */

/**
 * Field JSON structure

 {
  "fields": {
    "[id]": {
      "name": "Patient name",
      "type": "text"
    },
    "[id]": { 
      "name": "Location",
      "type": "select",
      "settings": {
        "options": ["option 1", "option 2"],
        "allowCustomData": true
      }
    }
  }
}

*/

var flowEditorCustomizableFields = ["select"];

var FlowEditorFieldConfiguratorSettingsDialog = React.createClass({displayName: "FlowEditorFieldConfiguratorSettingsDialog",

	/*
	 * Return initial state based on property type
	 */
	getInitialState: function() {
		console.log("Caught getInitialState for field settings dialog with type " + this.props.type);
		switch(this.props.type) {
			case "text":
			case "date":
				// Do nothing for these types
				console.log("\t| Dialog is for text/date field, skipping.");
				return {};
				break;
			case "select":
				console.log("\t| Dialog is for select field, returning initial select options.");
				return {
					options: [],
					allowCustomData: false,
				};
				break;
			default:
				console.log("\t| Field not recognized, skipping.");
				return {};
				break;
		}
	},

	/*
	 * Prepare component for mounting
	 */
	componentWillMount: function() {
 		
 		console.log("");
 		console.log("--[mount: " + this.props['field-key'] + "]--")
		console.log("Mounting options dialog for '" + this.props.type + "' input with props:");
		console.log(this.props);

		switch(this.props.type) {
			case "text":
			case "date":
				// Do nothing for these types
				console.log("\t| Input is " + this.props.type + ", no custom settings.");
				break;
			case "select":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {
					console.log("\t| CURRENT state is: " + JSON.stringify(this.state));
					console.log("\t| Input has pre-defined settings, checking individual sections...");

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						console.log("\t\t| Input has options [" + this.props.settings.options + "], pushing to state.");
						this.setState({ options: this.props.settings.options });
					}

					// If there's a set value for allowing custom data...
					if(this.props.settings.hasOwnProperty("allowCustomData") && typeof this.props.settings.allowCustomData === "boolean") {
						console.log("\t\t| Input has allowCustomData [" + this.props.settings.allowCustomData + "], pushing to state.");
						this.setState({ allowCustomData: this.props.settings.allowCustomData });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;
		}
	},

	/*
	 * Component completed mounting
	 */
	componentDidMount: function() {
		console.log("Component 'FlowEditorFieldConfiguratorSettingsDialog' mounted, state is now:");
		console.log(this.state);
 		console.log("--[/mount: " + this.props['field-key'] + "]--");
 		console.log("");
	},

	/*
	 * Handle adding of a new option (SELECT type)
	 */
	handleAddOption: function() {

		console.log("");
		console.log("--[add option: " + this.props['field-key'] + "]--");


		var push = function() {
			var options = this.state.options;
				options.push("");
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
	 * Handle removing of an option (SELECT type)
	 */
	handleRemoveOption: function(index) {
		var options = this.state.options;
			options.splice(index, 1);
		this.setState({ options: options });

		// Bump changes to parent element for aggregation
		this.props.onChange(this.state);
	},

	/*
	 * Handle change of option text (SELECT type)
	 */
	handleChangeOptionText: function(index) {
		return function(event) {
			var options = this.state.options;
				options[index] = event.target.value;
			this.setState({ options: options });

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);
		}.bind(this);
	},

	/*
	 * Handle change of allow custom data checkbox (SELECT type)
	 */
	handleAllowCustomDataChange: function() {
		console.log("");
		console.log("--[change allow custom data: " + this.props['field-key'] + "]--");
		console.log("\t| State before custom data change:");
		console.log(this.state);

		var newStatus = !this.state.allowCustomData;
		this.setState({ allowCustomData: newStatus }, function() {
			console.log("\t| New state:");
			console.log(this.state);

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

			console.log("--[/change allow custom data: " + this.props['field-key'] + "]--");
			console.log("");
		});

	},

	/*
	 * Render the settings dialog
	 */
	render: function() {

		// Check what type of input this dialog is for
		if(this.props.type == "text" || this.props.type == "date") {
			return (
				React.createElement("div", {className: "alert alert-info"}, 
					"No configuration is required for ", this.props.type, " inputs."
				)
			);
		} else if(this.props.type == "select") {

			var optionInputs,
				customDataCheckbox;

			// If there are options in the state
			if(this.state.hasOwnProperty('options') && this.state.options.length > 0) {

				// Map option input containers to one variable
				optionInputs = this.state.options.map(function(value, index) {
					return (
						React.createElement("div", {className: "field-select-option form-group row", key: index}, 
							React.createElement("div", {className: "col-sm-12"}, 
								React.createElement("div", {className: "input-group"}, 
									React.createElement("input", {type: "text", placeholder: "Enter an option", className: "form-control", defaultValue: value, onChange: this.handleChangeOptionText(index)}), 
									React.createElement("span", {className: "input-group-btn"}, 
										React.createElement("button", {type: "button", onClick: this.handleRemoveOption.bind(this, index), className: "btn btn-danger"}, 
										  	React.createElement("span", null, "×")
										)
									)
								)
							)
						)
					);
				}.bind(this));

				// Add a checkbox at the end
				customDataCheckbox = (
					React.createElement("div", {className: "col-sm-12"}, 
						React.createElement("div", {className: "checkbox m-t"}, 
							React.createElement("label", null, 
								React.createElement("input", {type: "checkbox", checked: this.state.allowCustomData, onChange: this.handleAllowCustomDataChange}), " Allow users to enter custom data for this field"
							)
						)
					)
				);
			} else {

				// No options available, show info message
				optionInputs = (
					React.createElement("div", {className: "alert alert-info"}, 
						"No options have been defined — try ", React.createElement("a", {className: "alert-link", onClick: this.handleAddOption}, "adding one"), "." 
					)
				);
				customDataCheckbox = (
					React.createElement("span", null)
				);
			}

			// Ta-da!
			return (
				React.createElement("div", {className: "field-select-options-contain"}, 
	            	React.createElement("h5", null, "Options (",  this.state.hasOwnProperty('options') ? this.state.options.length : 0, ")"), 
					optionInputs, 
					customDataCheckbox, 
					React.createElement("button", {type: "button", className: "btn btn-primary-outline", onClick: this.handleAddOption}, "Add another option")
				)
			);
		} 
	}
});



var FlowEditorFieldConfigurator = React.createClass({displayName: "FlowEditorFieldConfigurator",

	/*
	 * Initial state for a field
	 */
 	getInitialState: function() {
 		return {
 			name: "",
 			type: "text",
 			settings: null,
 		};
 	},

 	/*
 	 * Set up field state based on props prior to mount
 	 */
 	componentWillMount: function() {
 		this.setState({ 
 			// Required properties
 			name: this.props.name,
 			type: this.props.type,

 			// Settings
 			settings: 
 				flowEditorCustomizableFields.indexOf(this.props.type) !== -1 // If this field is a customizable field
 				&& typeof this.props.settings === "object" // If the settings object exists
 				&& Object.keys(this.props.settings).length > 0  // If the settings object has parameters
 					? this.props.settings // Use the settings object
 					: null, // Otherwise, return null

 		});
 	},

 	/*
 	 * Handle field name change
 	 */
 	handleFieldNameChange: function(event) {
 		this.setState({ name: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});

 	},

 	/*
 	 * Handle field type change
 	 */
 	handleFieldTypeChange: function(event) {
 		console.log("Type change from " + this.state.type + " => " + event.target.value);
 		this.setState({ type: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});

 	},

 	/*
 	 * Handle field removal
 	 */
 	handleRemoveField: function() {
 		this.props.onRemove(this.props.key);
 	},

 	/*
 	 * Handle change to field settings.
 	 */
 	handleFieldSettingsChange: function(settings) {
 		var settings = this.refs['settings-' + this.props['data-key']].state;

 		this.setState({ settings: settings });
 	},

 	/*
 	 * Check the validity of this field.
 	 */
 	isValid: function() {
 		var valid = true;

 		// Field must have a name
 		if(this.state.name.length == 0) {
 			valid = false;
 		}

 		console.log(this.state.name + " has length " + this.state.name.length + " and therefore validity " + valid);

 		return valid;
 	},

 	/*
 	 * Display the field
 	 */
 	render: function() {

 		var nameInput;

 		if(this.state.name.length == 0) {
 			nameInputGroup = (
 				React.createElement("div", {className: "form-group has-error"}, 
 					React.createElement("label", {className: "form-control-label", for: "name-" + this.props['data-key']}, "Name:"), 
 					React.createElement("input", {type: "text", id: "name-" + this.props['data-key'], className: "form-control form-control-error", placeholder: "Field name", maxlength: "30", onChange: this.handleFieldNameChange, defaultValue: this.state.name}), 
 					React.createElement("div", {className: "alert alert-danger"}, 
 						React.createElement("strong", null, "Heads up:"), " all inputs require a name."
 					)
 				)
 			);
 		} else {
 			nameInputGroup = (
 				React.createElement("div", {className: "form-group"}, 
 					React.createElement("label", {className: "form-control-label", for: "name-" + this.props['data-key']}, "Name:"), 
 					React.createElement("input", {type: "text", id: "name-" + this.props['data-key'], className: "form-control", placeholder: "Field name", maxlength: "30", onChange: this.handleFieldNameChange, defaultValue: this.state.name})	
 				)	
 			);
 		}

 		return (
 			React.createElement("div", {"data-key": this.props['data-key'], "data-index": this.props.index, className: "row flow-editor-configurator-row p-t"}, 

 				/* Configurator: field setup header */ 
 				React.createElement("div", {className: "col-xs-12"}, 
 					React.createElement("div", {className: "row"}, 
 						React.createElement("div", {className: "col-sm-12 col-md-8"}, 
	 						React.createElement("h4", {className: "field-title"}, 
		 						React.createElement("span", {className: "label label-info"}, "#", this.props.index + 1), 
		 						React.createElement("span", {className: "label label-default"}, this.props['data-key']), 
		 						React.createElement("span", {className: "title hidden-lg-down"}, this.state.name.length > 0 ? '"' + this.state.name + '"' : "Untitled " + this.state.type + " input")
		 					)
 						), 
	 					React.createElement("div", {className: "col-sm-12 col-md-4"}, 
		 					React.createElement("h4", {className: "field-title m-b"}, 
		 						React.createElement("button", {type: "button", className: "btn btn-sm btn-danger-outline pull-right", onClick: this.handleRemoveField}, "× Remove ", this.state.name.length > 0 ? '"' + this.state.name + '"' : 'this input')
		 					)
		 				)
 					)
 				), 
 				
 				/* Configurator: name/type */ 
 				React.createElement("div", {className: "col-sm-4 col-xs-12"}, 
 					nameInputGroup, 
 					React.createElement("div", {className: "form-group"}, 
 						React.createElement("label", {className: "form-control-label"}, "Type:"), 
	 					React.createElement("select", {className: "form-control", onChange: this.handleFieldTypeChange, defaultValue: this.state.type}, 
	 						React.createElement("option", {value: "text"}, "Text input"), 
	 						React.createElement("option", {value: "date"}, "Date input"), 
	 						React.createElement("option", {value: "select"}, "Select input with options")
	 					)
	 				)
 				), 

 				/* Configurator: settings */ 
	            React.createElement("div", {className: "col-sm-8 col-xs-12"}, 
	                React.createElement(FlowEditorFieldConfiguratorSettingsDialog, {
	                	ref: 'settings-' + this.props['data-key'], 
	                	"field-key": this.props['data-key'], 
	                	type: this.state.type, 
	                	settings: this.state.settings, 
	                	onChange: this.handleFieldSettingsChange.bind(this, this.state.settings)}
	                	)
	            )
	        )
 		);
 	}

 });

/**
 * Heirarchy
 *
 * > FlowEditorFields (houses all field containers and form controls)
 * | Passes down: 
 * |   field object, onRemove handler for the configurator, key (time-based input key), index (index in fields object)
 * ==> FlowEditorFieldConfigurator (single field configuration control area)
 *   | Passes down:
 *   |   field type, onChange handler
 *   ==> FlowEditorFieldConfiguratorSettingsDialog
 */

var FlowEditorFields = React.createClass({displayName: "FlowEditorFields",

	/*
	 * Initial container state: has no fields
	 */
	getInitialState: function() {
		return {
			fields: {},
			fieldValidities: {},
			invalidCount: 0,
			isValid: true,
		};
	},

	/*
	 * Add prop fields to state before mount
	 */
	componentWillMount: function() {
		this.setState({ fields: this.props.fields }, function() {
			this.checkContainerValidity();
		}.bind(this));
	},


	/*
	 * Add a new field to the container
	 */
	handleAddNewField: function() {
		var fields = this.state.fields;
		var fieldValidities = this.state.fieldValidities;
		var key = new Date().getTime();

		fields[key] = { name: "", type: "text", settings: null }; // Default settings for a new input
		fieldValidities[key] = false; // Input defaults to invalid

		this.setState({ fields: fields, fieldValidities: fieldValidities });

		// Since we added a field, we should re-check validity of the container
		this.checkContainerValidity();
	},

	/*
	 * Remove a field from the container (requires key)
	 */
 	handleRemoveField: function(key) {
		var fields = this.state.fields;
		var fieldValidities = this.state.fieldValidities;

		if(fields.hasOwnProperty(key)) {
			delete fields[key];
		}
		if(fieldValidities.hasOwnProperty(key)) {
			delete fieldValidities[key];
		}

		this.setState({ fields: fields, fieldValidities: fieldValidities });

		// Since we removed a field, we should re-check validity of the container
		this.checkContainerValidity();
 	},

 	/*
 	 * Check the validity of a field object
 	 */
 	checkFieldValidity: function(ref) {

 		console.log("Checking field validity for " + ref);

 		var fieldValidities = this.state.fieldValidities;
 			fieldValidities[ref] = this.refs[ref].isValid();

 			console.log(fieldValidities[ref]);

 		this.setState({ fieldValidities: fieldValidities });
 		this.checkContainerValidity();
 	},

 	/*
 	 * Check the validity of the container as a whole
 	 */
 	checkContainerValidity: function() {
 		var valid = true;
 		var invalidCount = 0;

 		for(var fieldKey in this.state.fieldValidities) {
 			if(this.state.fieldValidities[fieldKey] !== true) {
 				invalidCount++;
 				valid = false;
 			}
 		}

 		this.setState({ invalidCount: invalidCount, isValid: valid });
 	},

 	/*
 	 * Compile container data into one coherent object
 	 */
 	compileData: function() {
 		var data = {};
 		Object.keys(this.state.fields).map(function(key, i) {
 			data[key] = this.refs[key].state;
 		}.bind(this));

 		return data;
 	},

 	/*
 	 * Render the container
 	 */
	render: function() {
		var fields;

		// Check if any fields are stored in state.
		if(Object.keys(this.state.fields).length > 0) {
			fields = Object.keys(this.state.fields).map(function(key, index) {
				return (
					React.createElement(FlowEditorFieldConfigurator, React.__spread({},  this.state.fields[key], {onChange: this.checkFieldValidity.bind(this, key), onRemove: this.handleRemoveField.bind(this, key), key: key, "data-key": key, ref: key, index: index}))
				);
			}.bind(this));
		} else {
			fields = (
				React.createElement("div", {className: "alert alert-info"}, 
					"No fields added — try ", React.createElement("a", {className: "alert-link", onClick: this.handleAddNewField}, "adding a new one"), "."
				)
			);
		}

		return (
			React.createElement("div", {id: "flow-editor-fields-contain"}, 
				fields, 
	            React.createElement("button", {type: "button", className: "btn btn-primary btn-lg", onClick: this.handleAddNewField}, "Add a new field"), 
	            React.createElement("button", {type: "button", className: "btn btn-success btn-lg", onClick: this.props.handleSubmit, disabled: !this.state.isValid}, this.state.isValid ? "Submit changes" : this.state.invalidCount + " field(s) need attention before submitting")
			)
		);
	}

});