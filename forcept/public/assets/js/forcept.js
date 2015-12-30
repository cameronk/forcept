/**
 * Forcept.jsx
 */

/*
 * Add debug data to tooltip
 */
function __debug() {
	var compile = ""
	for(var i = 0; i < arguments.length; i++) {
		var data = arguments[i];
		if(typeof data == "object" && data !== null) {
			data = JSON.stringify(data, null, "  ");
		}
		compile += (data + "<br/><br/>");
	}
	$("#forcept-debug-content pre").html(compile);
}

function isTrue(statement) {
	switch(typeof statement) {
		case "boolean":
			return statement == true;
			break;
		case "string":
			return statement === "true";
			break;
		default:
			return false;
			break;
	}
}


/* ========================================= */

var Fields = {
	labelColumnClasses: "col-xl-2 col-lg-3 col-sm-5 col-xs-12",
	inputColumnClasses: "col-xl-10 col-lg-9 col-sm-7 col-xs-12"
};

Fields.Text = React.createClass({displayName: "Text",
	onTextInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, this.props.name), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "text", 
						className: "form-control", 
						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						autoComplete: "off", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onTextInputChange})
				)
			)
		);
	}
});

Fields.Number = React.createClass({displayName: "Number",
	onNumberInputChange: function(event) {
		// Bubble event up to handler passed from Visit
		// (pass field ID and event)
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {
		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, this.props.name), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("input", {
						type: "number", 
						className: "form-control", 
						id: this.props.id, 
						placeholder: this.props.name + " goes here", 
						autoComplete: "off", 
						defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null, 
						onChange: this.onNumberInputChange})
				)
			)
		);
	}
});

Fields.Select = React.createClass({displayName: "Select",

	getInitialState: function() {
		return {
			isCustomDataOptionSelected: false,
		};
	},

	onSelectInputChange: function(event) {

		// Check value before bubbling.
		switch(event.target.value) {
			case "__default__":
				// Spoof event target value
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, "");
				break;
			case "__custom__":
				// Set top-level state value to nothing (so it says "No data")
				this.setState({ isCustomDataOptionSelected: true });
				this.props.onChange(this.props.id, "");
				break;
			default:
				// Bubble event up to handler passed from Visit
				// (pass field ID and event)
				this.setState({ isCustomDataOptionSelected: false });
				this.props.onChange(this.props.id, event.target.value);
				break;
		}
	},

	onCustomDataInputChange: function(event) {
		this.props.onChange(this.props.id, event.target.value);
	},

	render: function() {

		var options,
			displaySelect;

		// Default option (prepended to select)
		var defaultOption = (
			React.createElement("option", {value: "__default__", disabled: "disabled"}, "Choose an option…")
		);
		// Custom data option (appended to select IF allowCustomData is set)
		var customDataOption = (
			React.createElement("option", {value: "__custom__"}, "Enter custom data for this field »")
		);

		// Custom data input 
		var customDataInput = (
			React.createElement("input", {type: "text", className: "form-control", placeholder: "Enter custom data here", onChange: this.onCustomDataInputChange})
		);

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					React.createElement("option", {value: option, key: this.props.id + "-option-" + index}, option)
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				React.createElement("select", {className: "form-control", onChange: this.onSelectInputChange, defaultValue: this.props.defaultValue !== null ? this.props.defaultValue : null}, 
					defaultOption, 
					options, 
					isTrue(this.props.settings.allowCustomData) ? customDataOption : ""
				)
			);
		} else {
			displaySelect = (
				React.createElement("div", {className: "alert alert-danger"}, 
					React.createElement("strong", null, "Warning:"), " no options defined for select input ", this.props.id
				)
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, this.props.name), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					displaySelect, 
					isTrue(this.state.isCustomDataOptionSelected) ? customDataInput : ""
				)
			)
		);
	}
});

Fields.MultiSelect = React.createClass({displayName: "MultiSelect",

	getInitialState: function() {
		return {};
	},

	onSelectInputChange: function(event) {
		var options = event.target.options;
		var values = [];

		for(var i = 0; i < options.length; i++) {
			if(options[i].selected) {
				values.push(options[i].value);
			}
		}

		this.props.onChange(this.props.id, values);
	},

	render: function() {

		var options,
			displaySelect;

		// Was there an error with options?
		var optionsError = false;

		// Load options if they are present, otherwise error
		if(this.props.settings.hasOwnProperty('options') && Array.isArray(this.props.settings.options)) {
			options = this.props.settings.options.map(function(option, index) {
				return (
					React.createElement("option", {value: option, key: this.props.id + "-option-" + index}, option)
				);
			}.bind(this));
		} else {
			optionsError = true;
		}

		// If no error, build select input. Otherwise, display an error message.
		if(!optionsError) {
			displaySelect = (
				React.createElement("select", {className: "form-control", onChange: this.onSelectInputChange, multiple: true, defaultValue: this.props.defaultValue}, 
					options
				)
			);
		} else {
			displaySelect = (
				React.createElement("div", {className: "alert alert-danger"}, 
					React.createElement("strong", null, "Warning:"), " no options defined for select input ", this.props.id
				)
			);
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, this.props.name), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					displaySelect
				)
			)
		);
	}
});

Fields.File = React.createClass({displayName: "File",
	getInitialState: function() {
		return {
			fileCount: 0,
		};
	},

	onFileInputChange: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function(upload) {
			console.log("Reader onload return upload target result:");
			console.log(upload.target.result);
			this.props.onChange(this.props.id, upload.target.result);
		}.bind(this);

		reader.readAsDataURL(file);
	},

	render: function() {
		var accept = "";
		if(this.props.settings.hasOwnProperty("accept")) {
			accept = this.props.settings.accept.join();
		}

		return (
			React.createElement("div", {className: "form-group row"}, 
				React.createElement("label", {htmlFor: this.props.id, className: Fields.labelColumnClasses + " form-control-label"}, this.props.name), 
				React.createElement("div", {className: Fields.inputColumnClasses}, 
					React.createElement("label", {className: "file"}, 
						React.createElement("input", {type: "file", className: "form-control", accept: accept, onChange: this.onFileInputChange}), 
						React.createElement("span", {className: "file-custom"}, this.state.fileCount == 0 ? "No files - " : this.state.fileCount + " file" + (this.state.fileCount == 1 ? "" : "s"))
					)
				)
			)
		);
	}
});