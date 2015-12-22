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

	render: function() {

		if(this.props.type == "text" || this.props.type == "date") {
			return (
				React.createElement("div", {className: "alert alert-info"}, 
					"No configuration is required for ", this.props.type, " inputs."
				)
			);
		} else if(this.props.type == "select") {

			var optionInputs,
				customDataCheckbox;

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
				optionInputs = (
					React.createElement("div", {className: "alert alert-info"}, 
						"No options have been defined — try ", React.createElement("a", {className: "alert-link", onClick: this.handleAddOption}, "adding one"), "." 
					)
				);
				customDataCheckbox = (
					React.createElement("span", null)
				);
			}

			return (
				React.createElement("div", {className: "field-select-options-contain"}, 
					optionInputs, 
					customDataCheckbox, 
					React.createElement("button", {type: "button", className: "btn btn-primary-outline", onClick: this.handleAddOption}, "Add another option")
				)
			);
		} 
	}
});



var FlowEditorFieldConfigurator = React.createClass({displayName: "FlowEditorFieldConfigurator",

 	getInitialState: function() {
 		return {
 			name: "",
 			type: "text",
 			settings: null,
 		};
 	},

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

 	handleFieldNameChange: function(event) {
 		this.setState({ name: event.target.value });
 	},

 	handleFieldTypeChange: function(event) {
 		console.log("Type change from " + this.state.type + " => " + event.target.value);
 		this.setState({ type: event.target.value });
 	},

 	handleRemoveField: function() {
 		this.props.onRemove(this.props.key);
 	},

 	handleFieldSettingsChange: function(settings) {
 		var settings = this.refs['settings-' + this.props['data-key']].state;
 		this.setState({ settings: settings });
 	},

 	render: function() {

 		var nameInputContainerClasses = "form-group" + (this.state.name.length == 0 ? " has-error" : "");
 		var nameInputClasses = "form-control" + (this.state.name.length == 0 ? " form-control-error" : "");

 		var nameInput;
 		if(this.state.name.length == 0) {
 			nameInputGroup = (
 				React.createElement("div", {className: "form-group has-error"}, 
 					React.createElement("label", {className: "form-control-label", for: "name-" + this.props['data-key']}, "Name:"), 
 					React.createElement("input", {type: "text", id: "name-" + this.props['data-key'], className: "form-control form-control-error", placeholder: "Field name", onChange: this.handleFieldNameChange, defaultValue: this.state.name}), 
 					React.createElement("div", {className: "alert alert-danger"}, 
 						React.createElement("strong", null, "Heads up:"), " all inputs require a name."
 					)
 				)
 			);
 		} else {
 			nameInputGroup = (
 				React.createElement("div", {className: "form-group"}, 
 					React.createElement("label", {className: "form-control-label", for: "name-" + this.props['data-key']}, "Name:"), 
 					React.createElement("input", {type: "text", id: "name-" + this.props['data-key'], className: "form-control", placeholder: "Field name", onChange: this.handleFieldNameChange, defaultValue: this.state.name})	
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
	            	React.createElement("h5", null, "Settings:"), 
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
	getInitialState: function() {
		return {
			fields: {}
		};
	},

	componentWillMount: function() {
		this.setState({ fields: this.props.fields });
	},

	handleAddNewField: function() {
		var fields = this.state.fields;
			fields[new Date().getTime()] = { name: "", type: "text", settings: null };
		this.setState({ fields: fields });
	},

 	handleRemoveField: function(key) {
		var fields = this.state.fields;
		if(fields.hasOwnProperty(key)) {
			delete fields[key];
		}

		this.setState({ fields: fields });
 	},

 	compileData: function() {
 		var data = {};
 		Object.keys(this.state.fields).map(function(key, i) {
 			data[key] = this.refs[key].state;
 		}.bind(this));

 		return data;
 	},

	render: function() {
		var fields;

		if(Object.keys(this.state.fields).length > 0) {
			fields = Object.keys(this.state.fields).map(function(key, index) {
				return (
					React.createElement(FlowEditorFieldConfigurator, React.__spread({},  this.state.fields[key], {onRemove: this.handleRemoveField.bind(this, key), key: key, "data-key": key, ref: key, index: index}))
				);
			}.bind(this));
		} else {
			fields = (
				React.createElement("h5", null, "No fields added. Choose \"Add new field\" below to get started!")
			);
		}

		return (
			React.createElement("div", {id: "flow-editor-fields-contain"}, 
				fields, 
	            React.createElement("button", {type: "button", className: "btn btn-primary btn-lg", onClick: this.handleAddNewField}, "Add a new field"), 
	            React.createElement("button", {type: "button", className: "btn btn-success btn-lg", onClick: this.props.handleSubmit}, "Submit changes →")
			)
		);
	}

});